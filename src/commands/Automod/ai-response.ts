import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX AI RESPONSE COMMAND
 * Toggle or view AI response configuration.
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('ai-response')
    .setDescription('🤖 Configure AI responses for bot mentions and chats')
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: true });

      const embed = new EmbedBuilder()
        .setColor('#4B0082')
        .setTitle('🤖 AI Response Configuration')
        .setDescription(
          'AI response behavior is managed through the automod system.\n' +
            'Use `/automod-config` to enable or disable AI replies and set trigger rules.'
        )
        .addFields(
          {
            name: '💡 Tip',
            value: 'Mention the bot with `@bot <message>` to chat with AI when enabled.',
            inline: false,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
      logger.info(`🤖 AI response info requested by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('❌ AI Response Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while fetching AI response settings.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while fetching AI response settings.',
          ephemeral: true,
        });
      }
    }
  },
};
