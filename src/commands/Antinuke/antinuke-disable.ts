import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX ANTINUKE DISABLE COMMAND
 * Deactivate the enterprise antinuke system
 * Version: 1.0.0 (God-Tier Security)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('antinuke-disable')
    .setDescription('⚠️ Disable the enterprise antinuke system')
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: true });

      // ========== CRITICAL PERMISSION CHECK ==========
      const isOwner = interaction.user.id === process.env.OWNER_ID;
      const isGuildOwner = interaction.user.id === interaction.guild?.ownerId;

      if (!isOwner && !isGuildOwner) {
        const deniedEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Access Denied')
          .setDescription(
            'Only the server owner or the Absolute Owner can disable the antinuke system.'
          )
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [deniedEmbed] });
        logger.warn(
          `⛔ Unauthorized antinuke-disable attempt by ${interaction.user.tag}`
        );
        return;
      }

      try {
        // Import Antinuke model
        const { default: mongoose } = await import('mongoose');
        const db = mongoose.connection;

        if (!db.models['Antinuke']) {
          await interaction.editReply({
            content: '❌ Antinuke database not initialized.',
          });
          logger.error('❌ Antinuke model not found');
          return;
        }

        const AntinukeModel = db.models['Antinuke'];

        // Update antinuke configuration to disabled
        await AntinukeModel.findOneAndUpdate(
          { guildId: interaction.guildId },
          { enabled: false },
          { upsert: true, new: true }
        );

        // Create deactivation embed
        const deactivationEmbed = new EmbedBuilder()
          .setColor('#FFB700')
          .setTitle('⚠️ Enterprise Antinuke System DISABLED')
          .setDescription(
            'The server is currently vulnerable to unauthorized admin actions.'
          )
          .addFields(
            {
              name: '❌ Status',
              value: 'DISARMED',
              inline: true,
            },
            {
              name: '🔓 Features',
              value: 'All protections are now OFFLINE',
              inline: true,
            },
            {
              name: '⚠️ Warning',
              value:
                'Without antinuke protection, the server is susceptible to raids and unauthorized actions. Enable it again with `/antinuke-enable`.',
              inline: false,
            }
          )
          .setThumbnail(interaction.guild?.iconURL() || null)
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [deactivationEmbed] });

        logger.info(
          `⚠️ Antinuke system disabled for guild: ${interaction.guild?.name} (${interaction.guildId})`
        );
      } catch (dbError) {
        console.error('[ANTINUKE DISABLE ERROR]:', dbError);
        logger.error('❌ Database error during antinuke disable:', dbError);
        await interaction.editReply({
          content: `❌ Error: ${(dbError as any)?.message || 'Database error'}`,
        });
      }
    } catch (error) {
      console.error('[ANTINUKE DISABLE ERROR (OUTER)]:', error);
      logger.error('❌ Antinuke Disable Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: `❌ Error: ${(error as any)?.message || 'Unknown error'}`,
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: `❌ Error: ${(error as any)?.message || 'Unknown error'}`,
          ephemeral: true,
        });
      }
    }
  },
};
