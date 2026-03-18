import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX SHUTDOWN COMMAND - THE KILL SWITCH
 * Gracefully shut down the bot with proper cleanup
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('🛑 Gracefully shutdown the bot (Owner Only)')
    .addBooleanOption((option) =>
      option
        .setName('confirm')
        .setDescription('Confirm shutdown (required)')
        .setRequired(true)
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

      const confirm = interaction.options.getBoolean('confirm', true);

      if (!confirm) {
        const cancelEmbed = new EmbedBuilder()
          .setColor('#FFB700')
          .setTitle('⏸️ Shutdown Cancelled')
          .setDescription('Shutdown was cancelled by the owner.')
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({
          embeds: [cancelEmbed],
        });

        logger.info(`⏸️ Shutdown cancelled by ${interaction.user.tag}`);
        return;
      }

      // Create shutdown embed
      const shutdownEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🛑 RUDRA.OX Shutting Down')
        .setDescription('Initiating graceful shutdown sequence...')
        .addFields(
          {
            name: '⏰ Timestamp',
            value: new Date().toISOString(),
            inline: false,
          },
          {
            name: '👤 Initiated By',
            value: `${interaction.user.tag} (${interaction.user.id})`,
            inline: false,
          },
          {
            name: '📊 Final Stats',
            value:
              `🏢 Guilds: ${interaction.client.guilds.cache.size}\n` +
              `⏱️ Uptime: ${Math.floor((interaction.client.uptime || 0) / 1000)}s\n` +
              `🔌 Ping: ${interaction.client.ws.ping}ms`,
            inline: false,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro | Goodbye!',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      // Send the shutdown message
      await interaction.editReply({
        embeds: [shutdownEmbed],
      });

      logger.warn(
        `🛑 SHUTDOWN INITIATED BY ${interaction.user.tag} - Graceful shutdown starting...`
      );

      // Wait 2 seconds before shutting down
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Log final stats
      logger.info('='.repeat(70));
      logger.info('🛑 RUDRA.OX SHUTDOWN SEQUENCE');
      logger.info('='.repeat(70));
      logger.info(`Guilds: ${interaction.client.guilds.cache.size}`);
      logger.info(`Users: ${interaction.client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0)}`);
      logger.info(`Uptime: ${Math.floor((interaction.client.uptime || 0) / 1000)}s`);
      logger.info('='.repeat(70));

      // Destroy the client (cleanup connections)
      interaction.client.destroy();

      logger.warn('🛑 Bot client destroyed. Exiting process.');

      // Exit the process
      process.exit(0);
    } catch (error) {
      logger.error('❌ Shutdown Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred during shutdown.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred during shutdown.',
          ephemeral: true,
        });
      }
    }
  },
};
