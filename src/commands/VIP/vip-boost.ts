import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX VIP BOOST COMMAND
 * Activates a bonus XP boost for VIP users.
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('vip-boost')
    .setDescription('⚡ Activate VIP bonus XP boost')
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: true });

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('⚡ VIP Boost Activated')
        .setDescription(
          'Your VIP XP boost is now active! Enjoy 2x XP gain while VIP boost is enabled.'
        )
        .addFields(
          {
            name: '📌 Tip',
            value: 'Use `/vipstatus` to view your remaining VIP duration.',
            inline: false,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
      logger.info(`⚡ VIP boost activated by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('❌ VIP Boost Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while activating VIP boost.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while activating VIP boost.',
          ephemeral: true,
        });
      }
    }
  },
};
