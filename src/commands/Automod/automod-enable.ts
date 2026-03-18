import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX AUTOMOD ENABLE COMMAND
 * Enables AI Automod system for the guild
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('automod-enable')
    .setDescription('Enable the AI Automod system for this server')
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

      // Upsert automod config
      const config = await AutomodModel.findOneAndUpdate(
        { guildId: interaction.guildId },
        {
          $set: { enabled: true },
          $setOnInsert: {
            guildId: interaction.guildId,
            enabled: true,
            badWords: [],
            filters: {
              spam: false,
              caps: false,
              links: false,
              invites: false,
              phishing: false,
              mentions: false,
              nsfw: false,
            },
            actions: {
              deleteMessage: true,
              muteUser: false,
              kickUser: false,
              warnUser: true,
            },
            muteDuration: 5,
            maxWarnings: 3,
            createdAt: new Date(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      logger.info(`[AUTOMOD] System enabled for guild: ${interaction.guildId}`);

      const successEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('🤖 AI Automod System ACTIVATED')
        .setDescription('The server is now actively monitored for violations.')
        .addFields(
          { name: '✅ Status', value: 'ENABLED', inline: true },
          { name: '🛡️ Protection', value: 'All filters ready', inline: true },
          { name: '⚙️ Action', value: 'Default: Delete + Warn', inline: true }
        )
        .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
        .setTimestamp();

      return interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      logger.error(`[AUTOMOD ENABLE] Error: ${error}`);

      const errorEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('❌ System Error')
        .setDescription('Failed to enable automod system. Please try again.')
        .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
