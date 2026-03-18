import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActivityType,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX STATUS COMMAND - DYNAMIC PRESENCE
 * Set the bot's status/activity for all servers
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('🎭 Set bot status and activity (Owner Only)')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Activity type')
        .setRequired(true)
        .addChoices(
          { name: '🎮 Playing', value: 'PLAYING' },
          { name: '👀 Watching', value: 'WATCHING' },
          { name: '🎧 Listening', value: 'LISTENING' },
          { name: '🌐 Streaming', value: 'STREAMING' },
          { name: '🤝 Competing', value: 'COMPETING' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('Status text to display')
        .setRequired(true)
        .setMaxLength(128)
    )
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // CRITICAL SECURITY CHECK
      if (interaction.user.id !== process.env.OWNER_ID) {
        await interaction.reply({
          content: '❌ Access Denied.',
          ephemeral: true,
        });
        return;
      }

      // Defer reply
      await interaction.deferReply({ ephemeral: true });

      const type = interaction.options.getString('type', true);
      const text = interaction.options.getString('text', true);

      // Map string to ActivityType enum
      const activityTypeMap: Record<string, ActivityType> = {
        PLAYING: ActivityType.Playing,
        WATCHING: ActivityType.Watching,
        LISTENING: ActivityType.Listening,
        STREAMING: ActivityType.Streaming,
        COMPETING: ActivityType.Competing,
      };

      const activityType = activityTypeMap[type];

      if (!activityType) {
        await interaction.editReply({
          content: '❌ Invalid activity type.',
        });
        return;
      }

      // Set the bot's activity
      interaction.client.user?.setActivity(text, { type: activityType });

      // Create success embed
      const successEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('✅ Status Updated')
        .setDescription('Bot presence has been successfully updated.')
        .addFields(
          {
            name: '🎭 Activity Type',
            value: type,
            inline: true,
          },
          {
            name: '📝 Status Text',
            value: text,
            inline: true,
          },
          {
            name: '⏰ Updated At',
            value: new Date().toISOString(),
            inline: false,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({
        embeds: [successEmbed],
      });

      logger.info(
        `✅ Bot status updated to: ${type} - "${text}" by ${interaction.user.tag}`
      );
    } catch (error) {
      logger.error('❌ Status Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while updating status.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while updating status.',
          ephemeral: true,
        });
      }
    }
  },
};
