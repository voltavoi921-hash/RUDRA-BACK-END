import { Client } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * RUDRA.OX EVENT HANDLER
 * Dynamically loads and binds all events from src/events/
 * Supports both client.on() and client.once() events
 */

export interface EventModule {
  name: string;
  once?: boolean;
  execute: (...args: any[]) => Promise<void> | void;
}

class EventHandler {
  private client: Client;
  private eventsLoaded: number = 0;
  private errorCount: number = 0;
  private eventsByType: Map<string, string[]> = new Map();

  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Load all events from src/events/
   */
  async loadEvents(): Promise<void> {
    try {
      logger.info('📂 Scanning events directory...');

      const eventsPath = path.join(__dirname, '..', 'events');

      // Ensure events directory exists
      if (!fs.existsSync(eventsPath)) {
        logger.warn('⚠️  Events directory not found. Creating empty structure...');
        fs.mkdirSync(eventsPath, { recursive: true });
        return;
      }

      // Read all event files
      const eventFiles = fs
        .readdirSync(eventsPath)
        .filter((file) => file.endsWith('.js') && !file.endsWith('.d.ts'));

      logger.info(`🔍 Found ${eventFiles.length} event files`);

      for (const file of eventFiles) {
        await this.loadEventFile(path.join(eventsPath, file), file);
      }

      this.displayLoadingSummary(eventFiles.length);
    } catch (error) {
      logger.error('❌ Event Handler Error:', error);
    }
  }

  /**
   * Load individual event file
   */
  private async loadEventFile(filePath: string, fileName: string): Promise<void> {
    try {
      // Import event module (support both .ts and .js)
      const eventModule: EventModule = await import(`file://${filePath}`).then(
        (mod) => mod.default || mod
      );

      if (!eventModule.name || !eventModule.execute) {
        logger.warn(
          `⚠️  Skipped ${fileName}: Missing 'name' or 'execute' property`
        );
        this.errorCount++;
        return;
      }

      // Determine if event should be registered with client.once() or client.on()
      const eventType = eventModule.once ? 'once' : 'on';

      if (eventModule.once) {
        this.client.once(eventModule.name, (...args: any[]) => {
          try {
            Promise.resolve(eventModule.execute(...args)).catch((err: any) =>
              logger.error(`❌ Error in event ${eventModule.name}:`, err)
            );
          } catch (err) {
            logger.error(`❌ Error in event ${eventModule.name}:`, err);
          }
        });
      } else {
        this.client.on(eventModule.name, (...args: any[]) => {
          try {
            Promise.resolve(eventModule.execute(...args)).catch((err: any) =>
              logger.error(`❌ Error in event ${eventModule.name}:`, err)
            );
          } catch (err) {
            logger.error(`❌ Error in event ${eventModule.name}:`, err);
          }
        });
      }

      // Track by event type
      if (!this.eventsByType.has(eventType)) {
        this.eventsByType.set(eventType, []);
      }
      this.eventsByType.get(eventType)!.push(eventModule.name);

      this.eventsLoaded++;
    } catch (error) {
      logger.warn(`❌ Failed to load event from ${fileName}:`, error);
      this.errorCount++;
    }
  }

  /**
   * Display beautiful loading summary
   */
  private displayLoadingSummary(totalFiles: number): void {
    const lineLength = 70;
    const border = '═'.repeat(lineLength);

    const summary: string[] = [
      '',
      `╔${border}╗`,
      `║ ${'🎯 EVENT LOADING SUMMARY'.padEnd(lineLength)} ║`,
      `╠${border}╣`,
      `║ Total Files Scanned:      ${String(totalFiles).padEnd(lineLength - 28)} ║`,
      `║ Events Loaded:             ${String(this.eventsLoaded).padEnd(lineLength - 27)} ║`,
      `║ Load Errors:               ${String(this.errorCount).padEnd(lineLength - 26)} ║`,
      `╠${border}╣`,
    ];

    // Add event type breakdown
    if (this.eventsByType.size > 0) {
      for (const [eventType, events] of this.eventsByType) {
        const typeInfo = `${eventType.toUpperCase()}: ${events.length} events`;
        summary.push(`║   ${typeInfo.padEnd(lineLength - 4)} ║`);
      }
      summary.push(`╠${border}╣`);
    }

    // Success indicator
    const successRate = ((this.eventsLoaded / totalFiles) * 100).toFixed(1);
    const statusEmoji = this.errorCount === 0 ? '✅' : '⚠️ ';

    summary.push(
      `║ ${statusEmoji} Success Rate: ${successRate}%${' '.repeat(lineLength - (statusEmoji.length + 17 + successRate.length))} ║`,
      `╚${border}╝`,
      ''
    );

    console.log(summary.join('\n'));

    if (this.eventsLoaded > 0) {
      logger.success(`🚀 RUDRA.OX Event Engine Ready: ${this.eventsLoaded} events registered!`);
    }
  }

  /**
   * Get event statistics
   */
  getStats(): {
    totalEvents: number;
    onceEvents: number;
    onEvents: number;
    errors: number;
  } {
    return {
      totalEvents: this.eventsLoaded,
      onceEvents: this.eventsByType.get('once')?.length || 0,
      onEvents: this.eventsByType.get('on')?.length || 0,
      errors: this.errorCount,
    };
  }
}

/**
 * Export function to initialize event handler
 */
export async function setupEventHandler(client: Client): Promise<void> {
  const handler = new EventHandler(client);
  await handler.loadEvents();
}

export { EventHandler };
