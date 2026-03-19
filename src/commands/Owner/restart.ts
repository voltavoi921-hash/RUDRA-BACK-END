import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX RESTART COMMAND
 * Recovers the bot by exiting the process (should be restarted by PM2 / Docker)
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('🔄 Restart the bot (Owner Only)')
    .addBooleanOption((option) =>
      option
        .setName('confirm')
        .setDescription('Confirm restart (required)')
        .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // Owner-only enforcement
      if (interaction.user.id !== process.env.OWNER_ID) {
        await interaction.reply({
          content: '❌ Access Denied. This command is owner-only.',
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply({ ephemeral: true });

      const confirm = interaction.options.getBoolean('confirm', true);

      if (!confirm) {
        await interaction.editReply({
          content: '✅ Restart cancelled.',
        });
        return;
      }

      const restartEmbed = new EmbedBuilder()
        .setColor('#00B0FF')
        .setTitle('🔄 Restarting RUDRA.OX')
        .setDescription('The bot is restarting now. It will be back shortly.')
        .addFields(
          {
            name: '👤 Initiated By',
            value: `${interaction.user.tag} (${interaction.user.id})`,
            inline: false,
          },
          {
            name: '⏱️ Timestamp',
            value: `${new Date().toISOString()}`,
            inline: false,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [restartEmbed] });

      logger.warn(`🔄 Restart initiated by ${interaction.user.tag}`);

      // Give Discord a moment to send the response before exiting
      setTimeout(() => {
        process.exit(0);
      }, 1500);
    } catch (error) {
      logger.error('❌ Restart Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while restarting the bot.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while restarting the bot.',
          ephemeral: true,
        });
      }
    }
  },
};
