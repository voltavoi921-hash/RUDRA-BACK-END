import { Client, ActivityType } from 'discord.js';
import { logger } from '../utils/logger.js';

/**
 * EXAMPLE EVENT: ready
 * Fires once when bot successfully connects to Discord
 *
 * Event file location: src/events/ready.ts
 * The handler automatically loads all .ts and .js files from src/events/
 */

export default {
  name: 'ready',
  once: true, // Set to true for client.once(), false for client.on()

  /**
   * Execute event handler
   */
  async execute(client: Client): Promise<void> {
    try {
      if (!client.user) {
        logger.error('❌ Client user is not available');
        return;
      }

      logger.success(`✅ Bot ready! Logged in as ${client.user.tag}`);
      logger.info(`📊 Ready in ${client.guilds.cache.size} servers`);

      // Set bot status
      client.user.setActivity('RUDRA.OX v1.0.0 | /help', { type: ActivityType.Watching });
    } catch (error) {
      logger.error('Error in ready event:', error);
    }
  },
};
