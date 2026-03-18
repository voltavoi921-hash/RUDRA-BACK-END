import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX BADWORDS LIST COMMAND
 * Displays all blacklisted words
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('badwords-list')
    .setDescription('View all blacklisted words')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction: any) {
    try {
      // Permission check
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const deniedEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('❌ Permission Denied')
          .setDescription('You need **Administrator** permissions to use this command.')
          .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });

        return interaction.reply({ embeds: [deniedEmbed], ephemeral: true });
      }

      // Validate guild
      if (!interaction.guildId) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('❌ Guild Not Found')
          .setDescription('This command can only be used in a server.')
          .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });

        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      // Import Automod model
      const { default: mongoose } = await import('mongoose');
      const db = mongoose.connection;
      const AutomodModel = db.models['Automod'];

      if (!AutomodModel) {
        logger.error('❌ Automod model not registered');
        const errorEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('❌ Database Error')
          .setDescription('Automod system is not initialized. Please contact the bot owner.')
          .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      // Fetch automod config
      const config = await AutomodModel.findOne({ guildId: interaction.guildId });

      logger.info(`[BADWORDS LIST] Fetched blacklist for guild ${interaction.guildId}`);

      // Handle empty or missing config
      if (!config || config.badWords.length === 0) {
        const emptyEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('📋 Blacklist - Empty')
          .setDescription('No words are currently blacklisted.')
          .addFields(
            { name: '📊 Total Words', value: '0', inline: true },
            { name: '🔍 Status', value: 'Ready to receive words', inline: true }
          )
          .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
          .setTimestamp();

        return interaction.reply({ embeds: [emptyEmbed] });
      }

      // Build word list (max 100 words per embed)
      const words = config.badWords;
      const wordList =
        words.length > 0
          ? '```\n' + words.join('\n') + '\n```'
          : 'No words in the blacklist.';

      // Split into chunks if too many words (Discord 4096 char limit per field)
      const chunks: string[] = [];
      let currentChunk = '```\n';

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const line = `${i + 1}. ${word}\n`;

        if ((currentChunk + line).length > 1024) {
          chunks.push(currentChunk + '```');
          currentChunk = '```\n' + line;
        } else {
          currentChunk += line;
        }
      }

      if (currentChunk.length > 4) {
        chunks.push(currentChunk + '```');
      }

      // Create embed
      const embed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('📋 Blacklisted Words')
        .setDescription(
          `**Total Words:** ${words.length} | **Status:** ${config.enabled ? '🟢 Active' : '🔴 Inactive'}`
        );

      // Add fields for each chunk
      if (chunks.length === 0) {
        embed.addFields({
          name: '📝 Word List',
          value: 'No words in the blacklist.',
          inline: false,
        });
      } else {
        chunks.forEach((chunk, index) => {
          if (index === 0) {
            embed.addFields({
              name: '📝 Word List',
              value: chunk,
              inline: false,
            });
          } else {
            embed.addFields({
              name: `📝 Word List (Continued ${index})`,
              value: chunk,
              inline: false,
            });
          }
        });
      }

      // Add statistics
      embed.addFields(
        {
          name: '📊 Statistics',
          value: `Total Blacklisted: **${words.length}**`,
          inline: true,
        },
        {
          name: '⚙️ Filter Status',
          value: `Spam: ${config.filters.spam ? '✅' : '❌'} | Links: ${config.filters.links ? '✅' : '❌'} | Invites: ${config.filters.invites ? '✅' : '❌'}`,
          inline: false,
        }
      );

      embed.setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' }).setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error(`[BADWORDS LIST] Error: ${error}`);

      const errorEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('❌ System Error')
        .setDescription('Failed to fetch blacklist. Please try again.')
        .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
