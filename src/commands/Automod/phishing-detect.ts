import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX PHISHING DETECT COMMAND
 * Toggle & check phishing detection status.
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('phishing-detect')
    .setDescription('🛡️ View or toggle phishing detection settings')
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: true });

      const embed = new EmbedBuilder()
        .setColor('#FFB700')
        .setTitle('🛡️ Phishing Detection')
        .setDescription(
          'Phishing detection is managed through `/automod-config`.\n' +
            'Use that command to enable or disable phishing filtering, and to adjust sensitivity.'
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
      logger.info(`🛡️ Phishing detect info requested by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('❌ Phishing Detect Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while fetching phishing detection settings.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while fetching phishing detection settings.',
          ephemeral: true,
        });
      }
    }
  },
};
