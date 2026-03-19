import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  User,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX ADD VIP COMMAND
 * Owner-only command to grant VIP status to users
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('addvip')
    .setDescription('👑 Grant VIP status to a user (Owner only)')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to add to VIP')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('duration')
        .setDescription('VIP duration')
        .setRequired(true)
        .addChoices(
          { name: '📅 1 Day', value: '1day' },
          { name: '📅 30 Days', value: '30days' },
          { name: '♾️  Lifetime', value: 'lifetime' }
        )
    )
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // Defer reply to give us time to process
      await interaction.deferReply({ ephemeral: true });

      // CRITICAL: Owner check at the start of execute
      if (interaction.user.id !== process.env.OWNER_ID) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Access Denied')
          .setDescription('You are not the Absolute Owner.')
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({
          embeds: [errorEmbed],
        });

        logger.warn(
          `⚠️ Unauthorized /addvip attempt by ${interaction.user.tag} (${interaction.user.id})`
        );
        return;
      }

      // Get command options
      const targetUser: User | null = interaction.options.getUser('user');
      const duration = interaction.options.getString('duration');

      if (!targetUser) {
        await interaction.editReply({
          content: '❌ User not found.',
        });
        return;
      }

      // Calculate expiry date
      let expiryDate: Date | null = null;
      let durationText = '';

      if (duration === '1day') {
        expiryDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
        durationText = '1 Day';
      } else if (duration === '30days') {
        expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        durationText = '30 Days';
      } else if (duration === 'lifetime') {
        expiryDate = null; // No expiry for lifetime
        durationText = 'Lifetime';
      }

      // Save to VIP database
      try {
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

        const vipTier = duration === 'lifetime' ? 'VIP_PRTR' : 'VIP';

        await VIPModel.findOneAndUpdate(
          { userId: targetUser.id },
          {
            userId: targetUser.id,
            tier: vipTier,
            grantedBy: interaction.user.id,
            expiresAt: expiryDate,
            createdAt: new Date(),
          },
          { upsert: true, new: true }
        );
      } catch (dbError) {
        logger.error('❌ Database error while granting VIP status:', dbError);
        await interaction.editReply({
          content: '❌ Failed to save VIP status to the database.',
        });
        return;
      }

      // Create success embed
      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ VIP Status Granted')
        .setDescription(
          `**User:** ${targetUser.tag} (${targetUser.id})\n` +
          `**Duration:** ${durationText}\n` +
          `${expiryDate ? `**Expires:** <t:${Math.floor(expiryDate.getTime() / 1000)}:F>` : '**Expires:** Never'}\n` +
          `**Granted By:** ${interaction.user.tag}`
        )
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          {
            name: '📝 Status',
            value: 'User has been added to the VIP Database',
            inline: false,
          },
          {
            name: '👑 VIP Benefits',
            value:
              '• Priority support\n' +
              '• Exclusive commands\n' +
              '• Premium features\n' +
              '• Ad-free experience',
            inline: false,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({
        embeds: [successEmbed],
      });

      // Log the action
      logger.info(
        `✅ VIP Granted: ${targetUser.tag} with duration ${durationText} by ${interaction.user.tag}`
      );

      // Optional: Notify the granted user
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('🎉 You\'ve Been Granted VIP Status!')
          .setDescription(
            `Congratulations! You have been granted VIP status on the RUDRA.OX server.\n\n` +
            `**Duration:** ${durationText}\n` +
            `${expiryDate ? `**Expires:** <t:${Math.floor(expiryDate.getTime() / 1000)}:F>` : '**Expires:** Never'}`
          )
          .setThumbnail(interaction.client.user?.displayAvatarURL() || '')
          .setFooter({
            text: '👑 RUDRA.OX - The God-Tier Discord Bot',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await targetUser.send({
          embeds: [dmEmbed],
        });

        logger.debug(`✅ VIP notification sent to ${targetUser.tag}`);
      } catch (dmError) {
        logger.warn(`⚠️ Could not send DM to ${targetUser.tag}:`, dmError);
      }
    } catch (error) {
      logger.error('❌ Add VIP Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while processing the VIP grant.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while processing the VIP grant.',
          ephemeral: true,
        });
      }
    }
  },
};
