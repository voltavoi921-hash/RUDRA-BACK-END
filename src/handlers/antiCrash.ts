import { Client, ChannelType, EmbedBuilder, TextChannel } from 'discord.js';
import { logger } from '../utils/logger.js';

/**
 * RUDRA.OX ANTI-CRASH ENGINE
 * Prevents bot crashes by catching:
 * - Uncaught Exceptions
 * - Unhandled Promise Rejections
 * - Discord.js Errors
 * - Command Execution Errors
 * Logs to both console and the owner's error channel
 */

class AntiCrashHandler {
  private client: Client | null = null;
  private errorLogChannelId = process.env.ERROR_LOG_CHANNEL_ID;
  private ownerId = process.env.OWNER_ID;
  private errorCount: Map<string, number> = new Map();
  private readonly ERROR_THRESHOLD = 5; // Ban channel if 5+ errors in 5 minutes
  private readonly ERROR_TIMEOUT = 300000; // 5 minutes

  /**
   * Initialize anti-crash handler with Discord client
   */
  initialize(client: Client): void {
    this.client = client;
    this.setupGlobalErrorHandlers();
    logger.success('🛡️  RUDRA.OX Anti-Crash Engine Activated');
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Catch uncaught exceptions
    process.on('uncaughtException', async (error: Error) => {
      await this.handleError('UNCAUGHT EXCEPTION', error, 'critical');
      // Attempt to keep bot running (don't exit)
      logger.error('⚠️  Received uncaught exception, but bot will continue running...');
    });

    // Catch unhandled promise rejections
    process.on('unhandledRejection', async (reason: unknown, promise: Promise<any>) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      await this.handleError('UNHANDLED REJECTION', error, 'critical');
      logger.error('⚠️  Received unhandled rejection, but bot will continue running...');
    });

    // Catch warnings
    process.on('warning', (warning: Error) => {
      logger.warn(`⚠️  Warning: ${warning.name} - ${warning.message}`);
    });

    // Discord.js error handler
    if (this.client) {
      this.client.on('error', async (error: Error) => {
        await this.handleError('DISCORD.JS ERROR', error, 'high');
      });

      // Warn handler for Discord.js
      this.client.on('warn', (info: string) => {
        logger.warn(`⚠️  Discord.js Warning: ${info}`);
      });

      // Debug handler (can be toggled)
      if (process.env.DEBUG_MODE === 'true') {
        this.client.on('debug', (info: string) => {
          if (info.includes('error') || info.includes('Error')) {
            logger.debug(`🔍 Debug: ${info}`);
          }
        });
      }
    }
  }

  /**
   * Central error handler
   */
  private async handleError(
    type: string,
    error: Error,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const errorId = `${type}-${Date.now()}`;

    // Log to console
    const logMessage = `\n${'='.repeat(50)}\n📛 ${type} [${severity.toUpperCase()}]\n${'='.repeat(50)}\nTime: ${timestamp}\nMessage: ${error.message}\nStack:\n${error.stack}\n${'='.repeat(50)}\n`;

    switch (severity) {
      case 'critical':
        logger.error(logMessage);
        break;
      case 'high':
        logger.error(logMessage);
        break;
      case 'medium':
        logger.warn(logMessage);
        break;
      case 'low':
        logger.info(logMessage);
        break;
    }

    // Update error tracking
    const errorKey = `${type}-${error.message.substring(0, 50)}`;
    this.errorCount.set(errorKey, (this.errorCount.get(errorKey) || 0) + 1);

    // Auto-clear old error counts
    setTimeout(() => {
      this.errorCount.delete(errorKey);
    }, this.ERROR_TIMEOUT);

    // Send to error log channel if configured
    if (this.errorLogChannelId && this.client) {
      await this.sendErrorToLogChannel(errorId, type, error, severity);
    }

    // Critical error alert to owner
    if (severity === 'critical' && this.ownerId && this.client) {
      await this.alertOwner(type, error);
    }
  }

  /**
   * Send error details to the error log channel
   */
  private async sendErrorToLogChannel(
    errorId: string,
    type: string,
    error: Error,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void> {
    try {
      if (!this.client) return;

      const logChannel = this.client.channels.cache.get(this.errorLogChannelId!);

      if (!logChannel || logChannel.type !== ChannelType.GuildText) {
        logger.warn('❌ Error Log Channel not found or not a text channel');
        return;
      }

      const textChannel = logChannel as TextChannel;

      // Truncate stack trace if too long
      const stack =
        error.stack && error.stack.length > 1024
          ? error.stack.substring(0, 1000) + '...'
          : error.stack || 'No stack trace available';

      const severityColors = {
        low: 0x3498db, // Blue
        medium: 0xf39c12, // Orange
        high: 0xe74c3c, // Red
        critical: 0x8b0000, // Dark Red
      };

      const embed = new EmbedBuilder()
        .setColor(severityColors[severity])
        .setTitle(`🛑 ${type}`)
        .setDescription(`**Error ID:** \`${errorId}\``)
        .addFields(
          { name: '🕐 Timestamp', value: new Date().toISOString(), inline: false },
          { name: '⚠️  Severity', value: severity.toUpperCase(), inline: true },
          { name: '📝 Message', value: `\`\`\`${error.message}\`\`\``, inline: false },
          { name: '📚 Stack Trace', value: `\`\`\`${stack}\`\`\``, inline: false }
        )
        .setFooter({ text: 'RUDRA.OX Anti-Crash Engine' })
        .setTimestamp();

      await textChannel.send({ embeds: [embed] });
    } catch (logError) {
      logger.error('Failed to send error to log channel:', logError);
    }
  }

  /**
   * Alert the bot owner about critical errors
   */
  private async alertOwner(type: string, error: Error): Promise<void> {
    try {
      if (!this.client || !this.ownerId) return;

      const owner = await this.client.users.fetch(this.ownerId);
      if (!owner) {
        logger.warn('❌ Owner not found for critical error alert');
        return;
      }

      const criticalEmbed = new EmbedBuilder()
        .setColor(0x8b0000)
        .setTitle('🚨 CRITICAL ERROR - IMMEDIATE ACTION REQUIRED')
        .setDescription(
          `RUDRA.OX has encountered a critical issue that requires your attention.`
        )
        .addFields(
          {
            name: '🔴 Error Type',
            value: type,
            inline: false,
          },
          {
            name: '💥 Error Message',
            value: error.message.substring(0, 200),
            inline: false,
          },
          {
            name: '⏰ Time',
            value: new Date().toISOString(),
            inline: false,
          }
        )
        .setFooter({ text: 'Check the error log channel for full details' })
        .setTimestamp();

      await owner.send({
        content: `${owner.toString()} 🚨 **CRITICAL ERROR ALERT**`,
        embeds: [criticalEmbed],
      });

      logger.success('🔔 Owner alerted about critical error');
    } catch (alertError) {
      logger.error('Failed to alert owner:', alertError);
    }
  }

  /**
   * Get current error statistics
   */
  getErrorStats(): { totalErrors: number; errorsByType: Record<string, number> } {
    const stats: Record<string, number> = {};
    this.errorCount.forEach((count, key) => {
      stats[key] = count;
    });

    return {
      totalErrors: Array.from(this.errorCount.values()).reduce((a, b) => a + b, 0),
      errorsByType: stats,
    };
  }

  /**
   * Clear error tracking (useful for manual resets)
   */
  clearErrorStats(): void {
    this.errorCount.clear();
    logger.info('🧹 Error statistics cleared');
  }

  /**
   * Log a handled error message (for non-critical errors)
   */
  async logHandledError(
    source: string,
    message: string,
    details?: Record<string, any>
  ): Promise<void> {
    const errorLog = {
      timestamp: new Date().toISOString(),
      source,
      message,
      details,
    };

    logger.warn(`📋 Handled Error from ${source}: ${message}`);

    if (this.errorLogChannelId && this.client) {
      try {
        const logChannel = this.client.channels.cache.get(this.errorLogChannelId);
        if (logChannel && logChannel.type === ChannelType.GuildText) {
          const textChannel = logChannel as TextChannel;
          const embed = new EmbedBuilder()
            .setColor(0xf39c12)
            .setTitle(`📋 Handled Error: ${source}`)
            .setDescription(message)
            .addFields({
              name: 'Details',
              value: `\`\`\`json\n${JSON.stringify(details, null, 2)}\`\`\``,
              inline: false,
            })
            .setTimestamp();

          await textChannel.send({ embeds: [embed] });
        }
      } catch (error) {
        logger.error('Failed to log handled error to channel:', error);
      }
    }
  }
}

// Singleton instance
const antiCrashHandler = new AntiCrashHandler();

export { antiCrashHandler, AntiCrashHandler };
