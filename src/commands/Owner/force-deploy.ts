import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';
import { registerSlashCommands } from '../../handlers/commandHandler.js';

/**
 * RUDRA.OX FORCE DEPLOY COMMAND
 * Re-registers all slash commands with Discord instantly.
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('force-deploy')
    .setDescription('🚀 Force refresh slash commands across Discord (Owner Only)')
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // Only owner can run
      if (interaction.user.id !== process.env.OWNER_ID) {
        await interaction.reply({
          content: '❌ Access Denied. This command is owner-only.',
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply({ ephemeral: true });

      await registerSlashCommands(interaction.client);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Slash Commands Deployed')
        .setDescription('All slash commands have been forcefully re-registered with Discord.')
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      logger.info(`🚀 Slash commands force-deployed by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('❌ Force Deploy Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while deploying commands.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while deploying commands.',
          ephemeral: true,
        });
      }
    }
  },
};
