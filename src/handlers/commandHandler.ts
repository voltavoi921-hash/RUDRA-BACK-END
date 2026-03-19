import { Client, Collection, REST, Routes, SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * RUDRA.OX COMMAND HANDLER
 * Dynamically loads all commands from src/commands/ recursively
 * Supports subfolders: VIP_Owner, Antinuke, Moderation, Music, etc.
 */

export interface CommandModule {
  data: SlashCommandBuilder;
  execute: (interaction: any) => Promise<void>;
  cooldown?: number;
  requiresVIP?: boolean;
  requiresOwner?: boolean;
}

class CommandHandler {
  private client: Client & { commands?: Collection<string, any> };
  private commandsLoaded: number = 0;
  private errorCount: number = 0;
  private commandsByCategory: Map<string, string[]> = new Map();

  constructor(client: Client & { commands?: Collection<string, any> }) {
    this.client = client;
  }

  /**
   * Load all commands recursively from src/commands/
   */
  async loadCommands(): Promise<void> {
    try {
      logger.info('📂 Scanning commands directory...');

      const commandsPath = path.join(__dirname, '..', 'commands');

      // Ensure commands directory exists
      if (!fs.existsSync(commandsPath)) {
        logger.warn('⚠️  Commands directory not found. Creating empty structure...');
        fs.mkdirSync(commandsPath, { recursive: true });
        return;
      }

      // Recursively read all command files
      const commandFiles = this.getCommandFiles(commandsPath);

      logger.info(`🔍 Found ${commandFiles.length} command files`);

      for (const filePath of commandFiles) {
        await this.loadCommandFile(filePath, commandsPath);
      }

      this.displayLoadingSummary(commandFiles.length);
    } catch (error) {
      logger.error('❌ Command Handler Error:', error);
    }
  }

  /**
   * Recursively get all command files from directory
   */
  private getCommandFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Recursively search subdirectories
        this.getCommandFiles(filePath, fileList);
      } else if ((file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')) {
        // Only include TypeScript and JavaScript files, not TypeScript declaration files
        fileList.push(filePath);
      }
    });

    return fileList;
  }

  /**
   * Load individual command file
   */
  private async loadCommandFile(filePath: string, basePath: string): Promise<void> {
    try {
      // Get category from folder structure
      const relativePath = path.relative(basePath, filePath);
      const categoryMatch = relativePath.split(path.sep)[0];
      const category = categoryMatch || 'Uncategorized';

      // Import command module (support both .ts and .js)
      const command: CommandModule = await import(`file://${filePath}`).then(
        (mod) => mod.default || mod
      );

      if (!command.data || !command.execute) {
        logger.warn(
          `⚠️  Skipped ${path.basename(filePath)}: Missing 'data' or 'execute' property`
        );
        this.errorCount++;
        return;
      }

      // Get command name
      const commandName = command.data.name;

      // Add to client.commands collection
      if (!this.client.commands) {
        this.client.commands = new Collection();
      }

      this.client.commands.set(commandName, command);

      // Log successful load
      console.log(`✅ COMMAND LOADED: "${commandName}" from ${category}/${path.basename(filePath)}`);
      logger.debug(`✅ Command loaded: ${commandName} (${category})`);

      // Track by category
      if (!this.commandsByCategory.has(category)) {
        this.commandsByCategory.set(category, []);
      }
      this.commandsByCategory.get(category)!.push(commandName);

      this.commandsLoaded++;
    } catch (error) {
      logger.warn(`❌ Failed to load command from ${path.basename(filePath)}:`, error);
      this.errorCount++;
    }
  }

  /**
   * Register slash commands with Discord API
   */
  async registerSlashCommands(): Promise<void> {
    try {
      if (!this.client.commands || this.client.commands.size === 0) {
        logger.warn('⚠️  No commands to register');
        return;
      }

      logger.info(`📤 Registering ${this.client.commands.size} slash commands with Discord...`);

      const commands = this.client.commands.map((cmd: CommandModule) => cmd.data.toJSON());

      const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN || '');

      // Prefer guild command registration when DEV_GUILD_ID is provided (instant updates)
      const devGuildId = process.env.DEV_GUILD_ID;
      if (devGuildId) {
        await rest.put(Routes.applicationGuildCommands(this.client.user?.id || '', devGuildId), {
          body: commands,
        });
        logger.success(`✅ Slash commands registered to dev guild (instant update)`);
        return;
      }

      // Otherwise, default to global registration (takes up to 1 hour to update)
      if (process.env.NODE_ENV === 'production') {
        await rest.put(Routes.applicationCommands(this.client.user?.id || ''), {
          body: commands,
        });
        logger.success('✅ Slash commands registered globally (1 hour to propagate)');
      } else {
        logger.warn('⚠️  DEV_GUILD_ID not set. Registering commands globally (may take up to 1 hour).');
        await rest.put(Routes.applicationCommands(this.client.user?.id || ''), {
          body: commands,
        });
        logger.success('✅ Slash commands registered globally (1 hour to propagate)');
      }
    } catch (error) {
      logger.error('❌ Failed to register slash commands:', error);
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
      `║ ${'🎯 COMMAND LOADING SUMMARY'.padEnd(lineLength)} ║`,
      `╠${border}╣`,
      `║ Total Files Scanned:      ${String(totalFiles).padEnd(lineLength - 28)} ║`,
      `║ Commands Loaded:           ${String(this.commandsLoaded).padEnd(lineLength - 29)} ║`,
      `║ Load Errors:               ${String(this.errorCount).padEnd(lineLength - 26)} ║`,
      `╠${border}╣`,
    ];

    // Add category breakdown
    if (this.commandsByCategory.size > 0) {
      summary.push(`║ 📂 Categories:             ${String(this.commandsByCategory.size).padEnd(lineLength - 28)} ║`);
      summary.push(`╠${border}╣`);

      for (const [category, commands] of this.commandsByCategory) {
        const categoryInfo = `${category}: ${commands.join(', ')}`;
        summary.push(`║   ${categoryInfo.padEnd(lineLength - 4)} ║`);
      }
    }

    summary.push(`╚${border}╝`);
    summary.push('');

    // Print summary
    for (const line of summary) {
      logger.success(line);
    }

    // CRITICAL: Print all loaded command names to console for verification
    console.log('\n========== 📋 ALL LOADED COMMANDS ==========');
    if (this.client.commands && this.client.commands.size > 0) {
      const commandNames = Array.from(this.client.commands.keys());
      console.log(`Total Commands in Memory: ${commandNames.length}`);
      console.log('Commands:', commandNames.join(', '));
    } else {
      console.log('❌ NO COMMANDS LOADED IN MEMORY!');
    }
    console.log('==========================================\n');
  }

  /**
   * Get command statistics
   */
  getStats(): {
    totalCommands: number;
    categories: number;
    errors: number;
  } {
    return {
      totalCommands: this.commandsLoaded,
      categories: this.commandsByCategory.size,
      errors: this.errorCount,
    };
  }
}

/**
 * Export function to initialize command handler
 */
export async function setupCommandHandler(client: Client): Promise<void> {
  const handler = new CommandHandler(client);
  await handler.loadCommands();
}

export async function registerSlashCommands(client: Client): Promise<void> {
  const handler = new CommandHandler(client);
  await handler.registerSlashCommands();
}
