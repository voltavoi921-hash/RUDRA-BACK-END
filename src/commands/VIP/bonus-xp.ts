import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX BONUS XP COMMAND
 * VIP-only: Activate 2x XP multiplier for 24 hours
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('bonus-xp')
    .setDescription(
      '💎 [VIP-ONLY] Activate 2x XP multiplier for 24 hours'
    )
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // Defer reply
      await interaction.deferReply({ ephemeral: true });

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

        // Check if user is a VIP
        const vipRecord = await VIPModel.findOne({
          userId: interaction.user.id,
        });

        if (!vipRecord) {
          // User is not a VIP
          const notVIPEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ VIP-Only Feature')
            .setDescription(
              'This feature is exclusive to VIP members only! 💎'
            )
            .addFields(
              {
                name: '🎯 How to Get VIP?',
                value: 'Use `/addvip` or contact the server owner for VIP access.',
              },
              {
                name: '💎 VIP Benefits',
                value: 'Use `/vipinfo` to see all exclusive VIP features.',
              }
            )
            .setFooter({
              text: '👑 Developed & Owned by Ashu & Zoro',
              iconURL: interaction.client.user?.displayAvatarURL(),
            })
            .setTimestamp();

          await interaction.editReply({
            embeds: [notVIPEmbed],
          });

          logger.warn(`⛔ Non-VIP ${interaction.user.tag} tried to use bonus-xp`);
          return;
        }

        // Get UserEconomy model
        if (!db.models['UserEconomy']) {
          await interaction.editReply({
            content: '❌ Economy database not initialized.',
          });
          logger.error('❌ UserEconomy model not found in database');
          return;
        }

        const UserModel = db.models['UserEconomy'];

        // Calculate 24-hour expiry timestamp
        const now = new Date();
        const expiryTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

        // Check if user already has active bonus XP
        const userRecord = await UserModel.findOne({
          userId: interaction.user.id,
        });

        if (
          userRecord &&
          userRecord.bonusXpMultiplier &&
          userRecord.bonusXpExpires
        ) {
          const currentExpiry = new Date(userRecord.bonusXpExpires);
          if (currentExpiry > now) {
            // Still has active bonus XP
            const remainingMs = currentExpiry.getTime() - now.getTime();
            const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
            const remainingMinutes = Math.floor(
              (remainingMs / (1000 * 60)) % 60
            );

            const activeBonus = new EmbedBuilder()
              .setColor('#FFD700')
              .setTitle('⏳ Bonus XP Already Active')
              .setDescription('You already have an active bonus XP multiplier!')
              .addFields(
                {
                  name: '🎯 Current Multiplier',
                  value: `${userRecord.bonusXpMultiplier}x`,
                  inline: true,
                },
                {
                  name: '⏰ Time Remaining',
                  value: `${remainingHours}h ${remainingMinutes}m`,
                  inline: true,
                },
                {
                  name: '💡 Tip',
                  value:
                    'You can activate again once your current bonus expires!',
                  inline: false,
                }
              )
              .setFooter({
                text: '👑 Developed & Owned by Ashu & Zoro',
                iconURL: interaction.client.user?.displayAvatarURL(),
              })
              .setTimestamp();

            await interaction.editReply({
              embeds: [activeBonus],
            });

            logger.info(
              `⏳ ${interaction.user.tag} already has active bonus XP`
            );
            return;
          }
        }

        // Activate bonus XP by updating user document
        const updatedUser = await UserModel.findOneAndUpdate(
          { userId: interaction.user.id },
          {
            bonusXpMultiplier: 2,
            bonusXpExpires: expiryTime,
            bonusXpActivatedAt: now,
            bonusXpActivations: (userRecord?.bonusXpActivations || 0) + 1,
          },
          { new: true, upsert: true }
        );

        // Success embed
        const successEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('💎 2x Bonus XP Activated!')
          .setDescription('Your bonus XP multiplier is now active!')
          .addFields(
            {
              name: '🎯 Multiplier',
              value: '2x XP',
              inline: true,
            },
            {
              name: '⏱️ Duration',
              value: '24 hours',
              inline: true,
            },
            {
              name: '⏰ Expires At',
              value: expiryTime.toLocaleString(),
              inline: false,
            },
            {
              name: '🚀 Total Activations',
              value: (updatedUser?.bonusXpActivations || 1).toString(),
              inline: true,
            },
            {
              name: '📊 XP Gain',
              value:
                'Double XP earned from all activities for the next 24 hours!',
              inline: false,
            }
          )
          .setThumbnail(interaction.user.displayAvatarURL())
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({
          embeds: [successEmbed],
        });

        logger.info(
          `✅ 2x Bonus XP activated for ${interaction.user.tag} (expires: ${expiryTime.toISOString()})`
        );
      } catch (dbError) {
        console.error('[VIP COMMAND ERROR - bonus-xp]:', {
          name: (dbError as any)?.name,
          message: (dbError as any)?.message,
          code: (dbError as any)?.code,
          fullError: dbError,
        });
        logger.error('❌ Database error during bonus XP activation:', dbError);
        await interaction.editReply({
          content:
            '❌ A database error occurred while activating bonus XP.',
        });
      }
    } catch (error) {
      console.error('[VIP COMMAND ERROR - bonus-xp (outer)]:', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        code: (error as any)?.code,
        fullError: error,
      });
      logger.error('❌ Bonus XP Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while activating bonus XP.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while activating bonus XP.',
          ephemeral: true,
        });
      }
    }
  },
};
