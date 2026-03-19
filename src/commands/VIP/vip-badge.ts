import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX VIP BADGE COMMAND
 * Display a premium badge on your profile card.
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('vip-badge')
    .setDescription('🎖️ Display your VIP badge (VIP only)')
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // This command assumes VIP status is handled elsewhere (DB/permissions).
      // For now, we acknowledge the request and provide the badge.
      await interaction.deferReply({ ephemeral: true });

      const badgeEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎖️ VIP Badge')
        .setDescription(
          'You are rocking the VIP badge! This badge represents exclusive access to premium features.'
        )
        .addFields(
          {
            name: '🔥 Perks',
            value:
              '• Priority support\n' +
              '• Early access features\n' +
              '• Custom prefix & styling',
            inline: false,
          },
          {
            name: '📌 Tip',
            value: 'Use `/vipstatus` to see your current VIP tier and expiry.',
            inline: false,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [badgeEmbed] });
      logger.info(`🎖️ VIP badge requested by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('❌ VIP Badge Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while showing your VIP badge.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while showing your VIP badge.',
          ephemeral: true,
        });
      }
    }
  },
};
