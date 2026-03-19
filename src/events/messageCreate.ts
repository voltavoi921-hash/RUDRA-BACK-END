import { Message, ChannelType, EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';
import { isMaintenanceModeEnabled } from '../utils/maintenance.js';
import { generateAIResponse } from '../utils/ai.js';

/**
 * RUDRA.OX MESSAGE CREATE EVENT
 * Handles prefix commands and AI responses when bot is mentioned
 * Integrates with Google Gemini API for intelligent responses
 */

export default {
  name: 'messageCreate',
  once: false,

  /**
   * Execute event handler - Prefix Commands & AI Chat Integration
   */
  async execute(message: Message): Promise<void> {
    try {
      // Ignore bot messages
      if (message.author.bot) return;

      // Only respond in guild channels (not DMs)
      if (message.channel.type !== ChannelType.GuildText) return;

      // Check for maintenance mode
      if (isMaintenanceModeEnabled() && message.author.id !== process.env.OWNER_ID) {
        return; // Silently ignore non-owner messages in maintenance
      }

      // Get the prefix from environment (fallback) and override with guild config if available
      let prefix = process.env.PREFIX || '!';

      if (message.guildId) {
        try {
          const { default: mongoose } = await import('mongoose');
          const db = mongoose.connection;
          if (db.models['GuildConfig']) {
            const GuildConfigModel = db.models['GuildConfig'];
            const guildConfig = (await GuildConfigModel.findOne({ guildId: message.guildId }).lean()) as any;
            if (guildConfig?.prefix) {
              prefix = guildConfig.prefix;
            }
          }
        } catch (prefixError) {
          logger.warn('⚠️ Failed to load guild prefix from database:', prefixError);
        }
      }

      // Check if message starts with prefix
      if (message.content.startsWith(prefix)) {
        await handlePrefixCommand(message, prefix);
        return;
      }

      // Check if bot is mentioned for AI chat
      if (!message.mentions.has(message.client.user.id)) return;

      // Extract the text after the mention
      const mentionPattern = new RegExp(`^<@!?${message.client.user.id}>\\s*`);
      const userInput = message.content.replace(mentionPattern, '').trim();

      // Ignore if no text after mention
      if (!userInput) {
        await message.reply({
          content: '💬 Hey there! Ask me something and I\'ll help you out.',
          allowedMentions: { repliedUser: false },
        });
        return;
      }

      // Send typing indicator to show the bot is processing
      await message.channel.sendTyping();

      // Generate a response using the configured AI provider
      let aiResponse: string;
      try {
        aiResponse = await generateAIResponse(userInput);
      } catch (apiError) {
        console.error('[AI ERROR]:', apiError);
        logger.error('❌ AI generation failed:', apiError);
        await message.reply({
          content:
            '⚠️ AI service is currently unavailable. Please check your configuration and try again.',
          allowedMentions: { repliedUser: false },
        });
        return;
      }

        // Split response into chunks (Discord 2000 char limit)
        const chunks = aiResponse.match(/[\s\S]{1,1950}/g) || [aiResponse];

        for (const chunk of chunks) {
          // Create embed for AI response
          const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setDescription(chunk)
            .setFooter({
              text: '🤖 Powered by Google Gemini AI',
              iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Google_Gemini_logo.svg/1200px-Google_Gemini_logo.svg.png',
            })
            .setTimestamp();

          await message.reply({
            embeds: [embed],
            allowedMentions: { repliedUser: false },
          });
        }

        logger.info(`✅ AI Response sent to ${message.author.tag} in ${message.guild?.name}`);
    } catch (error) {
      logger.error('❌ Message Create Event Error:', error);
    }
  },
};

/**
 * Handle prefix-based commands
 */
async function handlePrefixCommand(message: Message, prefix: string): Promise<void> {
  try {
    // Remove prefix and split into command and args
    const content = message.content.slice(prefix.length).trim();
    if (!content) return;

    const args = content.split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    // Get the slash command equivalent
    const client = message.client as any;
    const slashCommand = client.commands?.get(commandName);

    if (!slashCommand) {
      // Unknown command
      await message.reply({
        content: `❌ Unknown command: \`${commandName}\`. Use \`${prefix}help\` for a list of commands.`,
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    // Create a mock interaction object for the slash command
    const mockInteraction = {
      user: message.author,
      guild: message.guild,
      guildId: message.guildId,
      channel: message.channel,
      client: message.client,
      options: {
        getString: (name: string) => args.join(' ') || null,
        getUser: () => null,
        getBoolean: () => false,
        getInteger: () => null,
        getNumber: () => null,
        getMentionable: () => null,
        getRole: () => null,
        getChannel: () => null,
        getAttachment: () => null,
      },
      reply: async (options: any) => {
        await message.reply(options);
      },
      deferReply: async () => {
        // For prefix commands, we don't defer
      },
      editReply: async (options: any) => {
        // Not applicable for prefix
      },
      followUp: async (options: any) => {
        await message.reply(options);
      },
      deferred: false,
      replied: false,
    };

    // Execute the slash command with the mock interaction
    try {
      await slashCommand.execute(mockInteraction);
      logger.info(`✅ Prefix command executed: ${commandName} by ${message.author.tag}`);
    } catch (error) {
      logger.error(`❌ Error executing prefix command ${commandName}:`, error);
      await message.reply({
        content: '❌ An error occurred while executing that command.',
        allowedMentions: { repliedUser: false },
      });
    }
  } catch (error) {
    logger.error('❌ Prefix Command Handler Error:', error);
  }
}
