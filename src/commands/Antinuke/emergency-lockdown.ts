import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX EMERGENCY LOCKDOWN COMMAND
 * The Panic Button - Lock ALL channels instantly
 * Version: 1.0.0 (God-Tier Security)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('emergency-lockdown')
    .setDescription('🚨 EMERGENCY LOCKDOWN - Lock all channels instantly')
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: false });

      // ========== CRITICAL PERMISSION CHECK ==========
      const isOwner = interaction.user.id === process.env.OWNER_ID;
      const isGuildOwner = interaction.user.id === interaction.guild?.ownerId;

      if (!isOwner && !isGuildOwner) {
        const deniedEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Access Denied')
          .setDescription(
            'Only the server owner or the Absolute Owner can initiate an emergency lockdown.'
          )
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [deniedEmbed] });
        logger.warn(
          `⛔ Unauthorized emergency-lockdown attempt by ${interaction.user.tag}`
        );
        return;
      }

      try {
        // Fetch all channels in the guild
        const channels = await interaction.guild?.channels.fetch();
        let lockedCount = 0;
        let failedCount = 0;

        if (channels) {
          for (const [, channel] of channels) {
            try {
              // Only lock text channels
              if (channel && channel.type === ChannelType.GuildText && 'permissionOverwrites' in channel) {
                // Deny SendMessages for @everyone
                await channel.permissionOverwrites.edit(
                  interaction.guild!.roles.everyone,
                  {
                    SendMessages: false,
                  }
                );
                lockedCount++;
              }
            } catch (err) {
              const channelName = channel ? channel.name : 'Unknown';
              console.error(`Failed to lock channel ${channelName}:`, err);
              failedCount++;
              logger.warn(`⚠️ Failed to lock channel: ${channelName}`);
            }
          }
        }

        // Create lockdown embed
        const lockdownEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('🚨 EMERGENCY LOCKDOWN INITIATED 🚨')
          .setDescription(
            'All channels have been locked. Server is now in high-security mode.'
          )
          .addFields(
            {
              name: '🔒 Channels Locked',
              value: `${lockedCount} text channels`,
              inline: true,
            },
            {
              name: '⚠️ Failed Locks',
              value: `${failedCount} channels`,
              inline: true,
            },
            {
              name: '🔴 Status',
              value: 'HIGH ALERT - SERVER LOCKED DOWN',
              inline: false,
            },
            {
              name: '📢 Notice',
              value:
                'Users cannot send messages. Unlock channels with `/emergency-unlock` (Admin only).',
              inline: false,
            }
          )
          .setThumbnail(interaction.guild?.iconURL() || null)
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [lockdownEmbed] });

        logger.warn(
          `🚨 Emergency lockdown initiated by ${interaction.user.tag} in guild ${interaction.guild?.name}`
        );
        logger.info(`✅ Lockdown summary: ${lockedCount} locked, ${failedCount} failed`);
      } catch (actionError) {
        console.error('[EMERGENCY LOCKDOWN ERROR]:', actionError);
        logger.error('❌ Error during emergency lockdown:', actionError);
        await interaction.editReply({
          content: `❌ Error: ${(actionError as any)?.message || 'Lockdown failed'}`,
        });
      }
    } catch (error) {
      console.error('[EMERGENCY LOCKDOWN ERROR (OUTER)]:', error);
      logger.error('❌ Emergency Lockdown Command Error:', error);

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
