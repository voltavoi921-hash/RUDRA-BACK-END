import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';
import { isMaintenanceModeEnabled, setMaintenanceMode } from '../../utils/maintenance.js';

/**
 * RUDRA.OX MAINTENANCE MODE COMMAND
 * Toggle maintenance mode on/off for all non-owner users.
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('maintenance-mode')
    .setDescription('🛠️ Enable or disable maintenance mode (Owner Only)')
    .addBooleanOption((option) =>
      option
        .setName('enable')
        .setDescription('Enable or disable maintenance mode')
        .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // Only owner can toggle maintenance mode
      if (interaction.user.id !== process.env.OWNER_ID) {
        await interaction.reply({
          content: '❌ Access Denied. This command is owner-only.',
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply({ ephemeral: true });

      const enable = interaction.options.getBoolean('enable', true);
      setMaintenanceMode(enable);

      const statusEmbed = new EmbedBuilder()
        .setColor(enable ? '#00FF00' : '#FF0000')
        .setTitle(enable ? '🛠️ Maintenance Mode Enabled' : '✅ Maintenance Mode Disabled')
        .setDescription(
          enable
            ? 'The bot is now in maintenance mode. Only the owner can use commands.'
            : 'The bot has returned to normal operation.'
        )
        .addFields(
          {
            name: '👤 Initiated By',
            value: `${interaction.user.tag} (${interaction.user.id})`,
            inline: false,
          },
          {
            name: '🕒 Timestamp',
            value: `${new Date().toISOString()}`,
            inline: false,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [statusEmbed] });

      logger.info(`🛠️ Maintenance mode set to ${enable} by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('❌ Maintenance Mode Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while toggling maintenance mode.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while toggling maintenance mode.',
          ephemeral: true,
        });
      }
    }
  },
};
