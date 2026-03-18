import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  User,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX VIP STATUS COMMAND
 * Check VIP status of any user (including self)
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('vipstatus')
    .setDescription('💎 Check VIP status (yours or someone else\'s)')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('User to check (defaults to you)')
        .setRequired(false)
    )
    .setDMPermission(true),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // Defer reply
      await interaction.deferReply({ ephemeral: false });

      // Get the user to check (defaults to the executor)
      const userToCheck: User =
        interaction.options.getUser('user') || interaction.user;

      try {
        // Import models dynamically
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

        // Query VIP database
        const vipRecord = await VIPModel.findOne({
          userId: userToCheck.id,
        });

        if (!vipRecord) {
          // User is not a VIP
          const notVIPEmbed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('❌ Not a VIP')
            .setDescription(
              `${userToCheck.tag} is not currently a VIP member.`
            )
            .addFields(
              {
                name: '💎 VIP Status',
                value: 'Not Active',
                inline: true,
              },
              {
                name: '⏰ Expires',
                value: 'N/A',
                inline: true,
              }
            )
            .setThumbnail(userToCheck.displayAvatarURL())
            .setFooter({
              text: '👑 Developed & Owned by Ashu & Zoro',
              iconURL: interaction.client.user?.displayAvatarURL(),
            })
            .setTimestamp();

          await interaction.editReply({
            embeds: [notVIPEmbed],
          });

          logger.debug(`🔍 VIP status check for non-VIP: ${userToCheck.tag}`);
          return;
        }

        // User is a VIP - calculate remaining time
        let tierStatus = '💎 VIP';
        let timeRemaining = 'Lifetime';
        let percentageRemaining = 100;

        if (vipRecord.expiresAt) {
          const now = new Date();
          const expiryDate = new Date(vipRecord.expiresAt);

          if (now > expiryDate) {
            // VIP has expired
            const expiredEmbed = new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('⏰ VIP Status Expired')
              .setDescription(`${userToCheck.tag}'s VIP status has expired.`)
              .addFields(
                {
                  name: '💎 Tier',
                  value: 'VIP (Expired)',
                  inline: true,
                },
                {
                  name: '❌ Expired On',
                  value: expiryDate.toDateString(),
                  inline: true,
                }
              )
              .setThumbnail(userToCheck.displayAvatarURL())
              .setFooter({
                text: '👑 Developed & Owned by Ashu & Zoro',
                iconURL: interaction.client.user?.displayAvatarURL(),
              })
              .setTimestamp();

            await interaction.editReply({
              embeds: [expiredEmbed],
            });

            logger.debug(`⏰ VIP expired for: ${userToCheck.tag}`);
            return;
          }

          // Calculate remaining time
          const timeRemainingMs = expiryDate.getTime() - now.getTime();
          const daysRemaining = Math.floor(
            timeRemainingMs / (1000 * 60 * 60 * 24)
          );
          const hoursRemaining = Math.floor(
            (timeRemainingMs / (1000 * 60 * 60)) % 24
          );

          timeRemaining = `${daysRemaining}d ${hoursRemaining}h`;

          // Determine VIP tier based on duration
          const originalExpiry = new Date(vipRecord.expiresAt);
          const grantedDate = new Date(vipRecord.createdAt);
          const originalDurationMs =
            originalExpiry.getTime() - grantedDate.getTime();
          const originalDays = originalDurationMs / (1000 * 60 * 60 * 24);

          if (originalDays >= 365) {
            tierStatus = '👑 VIP PRTR';
          }

          // Calculate percentage remaining
          percentageRemaining = Math.round(
            (timeRemainingMs / originalDurationMs) * 100
          );
        }

        // Create VIP status embed
        const vipEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('💎 VIP Status Active')
          .setDescription(
            `${userToCheck.tag} is an active VIP member with premium benefits.`
          )
          .addFields(
            {
              name: '👑 Tier',
              value: tierStatus,
              inline: true,
            },
            {
              name: '⏳ Time Remaining',
              value: timeRemaining,
              inline: true,
            },
            {
              name: '📊 Percentage',
              value: `${percentageRemaining}%`,
              inline: true,
            },
            {
              name: '📅 Granted On',
              value: new Date(vipRecord.createdAt).toDateString(),
              inline: true,
            },
            {
              name: '👮 Granted By',
              value: vipRecord.grantedBy || 'System',
              inline: true,
            },
            {
              name: '⏰ Expires',
              value: vipRecord.expiresAt
                ? new Date(vipRecord.expiresAt).toDateString()
                : 'Never',
              inline: true,
            }
          )
          .setThumbnail(userToCheck.displayAvatarURL())
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({
          embeds: [vipEmbed],
        });

        logger.info(`✅ VIP status checked for ${userToCheck.tag}`);
      } catch (dbError: any) {
        console.error('[VIP COMMAND ERROR - vipstatus]:', {
          name: dbError?.name,
          message: dbError?.message,
          code: dbError?.code,
          stack: dbError?.stack,
          fullError: dbError,
        });
        logger.error('❌ Database error during VIP status check:', dbError);
        await interaction.editReply({
          content: `❌ Critical Error: ${dbError?.message || 'Unknown database error'}`,
        });
      }
    } catch (error: any) {
      console.error('[VIP COMMAND ERROR - vipstatus (outer)]:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
        fullError: error,
      });
      logger.error('❌ VIP Status Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: `❌ Command Error: ${error?.message || 'Unknown error'}`,
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: `❌ Command Error: ${error?.message || 'Unknown error'}`,
          ephemeral: true,
        });
      }
    }
  },
};
