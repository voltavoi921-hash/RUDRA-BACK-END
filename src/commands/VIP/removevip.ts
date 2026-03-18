import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  User,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX REMOVE VIP COMMAND
 * Permanently revoke VIP status from a user (Owner Only)
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('removevip')
    .setDescription('💎 Remove VIP status from a user (Owner Only)')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to remove from VIP')
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

      const targetUser: User | null = interaction.options.getUser('user');

      if (!targetUser) {
        await interaction.editReply({
          content: '❌ User not found.',
        });
        return;
      }

      try {
        // Import models dynamically to avoid circular dependencies
        const { default: mongoose } = await import('mongoose');
        const db = mongoose.connection;

        if (!db.models['VIP']) {
          await interaction.editReply({
            content: '❌ Database connection error.',
          });
          logger.error('❌ VIP model not found in database');
          return;
        }

        const VIPModel = db.models['VIP'];

        // Find and delete the VIP record
        const deletedVIP = await VIPModel.findOneAndDelete({
          userId: targetUser.id,
        });

        if (!deletedVIP) {
          const notVIPEmbed = new EmbedBuilder()
            .setColor('#FFB700')
            .setTitle('⚠️ User Not in VIP Database')
            .setDescription(
              `${targetUser.tag} was not in the VIP database. No action taken.`
            )
            .setThumbnail(targetUser.displayAvatarURL())
            .setFooter({
              text: '👑 Developed & Owned by Ashu & Zoro',
              iconURL: interaction.client.user?.displayAvatarURL(),
            })
            .setTimestamp();

          await interaction.editReply({
            embeds: [notVIPEmbed],
          });

          logger.warn(
            `⚠️ Attempted to revoke VIP from non-VIP user ${targetUser.tag}`
          );
          return;
        }

        // Create success embed
        const successEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('✅ VIP Status Revoked')
          .setDescription(
            `${targetUser.tag}'s VIP status has been permanently revoked.`
          )
          .addFields(
            {
              name: '👤 User',
              value: `${targetUser.tag} (${targetUser.id})`,
              inline: false,
            },
            {
              name: '⏰ Revoked At',
              value: new Date().toISOString(),
              inline: false,
            },
            {
              name: '👮 Revoked By',
              value: interaction.user.tag,
              inline: false,
            }
          )
          .setThumbnail(targetUser.displayAvatarURL())
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({
          embeds: [successEmbed],
        });

        logger.info(
          `✅ VIP Revoked: ${targetUser.tag} by ${interaction.user.tag}`
        );
      } catch (dbError) {
        console.error('[VIP COMMAND ERROR - removevip]:', {
          name: (dbError as any)?.name,
          message: (dbError as any)?.message,
          code: (dbError as any)?.code,
          fullError: dbError,
        });
        logger.error('❌ Database error during VIP removal:', dbError);
        await interaction.editReply({
          content: '❌ A database error occurred while removing VIP status.',
        });
      }
    } catch (error) {
      console.error('[VIP COMMAND ERROR - removevip (outer)]:', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        code: (error as any)?.code,
        fullError: error,
      });
      logger.error('❌ Remove VIP Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while removing VIP status.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while removing VIP status.',
          ephemeral: true,
        });
      }
    }
  },
};
