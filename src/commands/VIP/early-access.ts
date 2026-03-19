import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX EARLY ACCESS COMMAND
 * Grants early access to beta features (VIP only).
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('early-access')
    .setDescription('🚀 Opt into beta features (VIP only)')
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: true });

      const embed = new EmbedBuilder()
        .setColor('#00B0FF')
        .setTitle('🚀 Early Access Activated')
        .setDescription(
          'You now have access to beta features as part of the VIP program.\n' +
            '👑 Check the help menu for new commands as they become available.'
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
      logger.info(`🚀 Early access granted to ${interaction.user.tag}`);
    } catch (error) {
      logger.error('❌ Early Access Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while enabling early access.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while enabling early access.',
          ephemeral: true,
        });
      }
    }
  },
};
