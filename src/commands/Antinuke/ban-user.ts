import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  User,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX BAN USER COMMAND
 * Ban a user from the server with a reason
 * Version: 1.0.0 (God-Tier Security)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('ban-user')
    .setDescription('🔨 Ban a user from the server')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('User to ban')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(true)
        .setMaxLength(512)
    )
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
            'Only the server owner or the Absolute Owner can ban users.'
          )
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [deniedEmbed] });
        logger.warn(`⛔ Unauthorized ban-user attempt by ${interaction.user.tag}`);
        return;
      }

      const targetUser: User | null = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason', true);

      if (!targetUser) {
        await interaction.editReply({ content: '❌ User not found.' });
        return;
      }

      // Cannot ban the bot itself
      if (targetUser.id === interaction.client.user?.id) {
        await interaction.editReply({
          content: '❌ Cannot ban the bot itself.',
        });
        return;
      }

      // Cannot ban the person running the command
      if (targetUser.id === interaction.user.id) {
        await interaction.editReply({
          content: '❌ Cannot ban yourself.',
        });
        return;
      }

      try {
        // Attempt to ban the user
        await interaction.guild?.members.ban(targetUser, {
          reason: `Banned by ${interaction.user.tag} - ${reason}`,
        });

        // Create ban confirmation embed
        const banEmbed = new EmbedBuilder()
          .setColor('#8B0000')
          .setTitle('🔨 User Eradicated')
          .setDescription(
            `${targetUser.tag} has been permanently eradicated from the server.`
          )
          .addFields(
            {
              name: '👤 User',
              value: `${targetUser.tag} (${targetUser.id})`,
              inline: true,
            },
            {
              name: '📝 Reason',
              value: reason,
              inline: false,
            },
            {
              name: '👮 Banned By',
              value: interaction.user.tag,
              inline: true,
            },
            {
              name: '⏰ Timestamp',
              value: new Date().toISOString(),
              inline: true,
            },
            {
              name: '⚠️ Status',
              value: '🔴 PERMANENTLY BANNED - No appeals',
              inline: false,
            }
          )
          .setThumbnail(targetUser.displayAvatarURL())
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [banEmbed] });

        logger.warn(
          `🔨 User ${targetUser.tag} banned from ${interaction.guild?.name} - Reason: ${reason}`
        );
      } catch (banError) {
        console.error('[BAN ERROR]:', banError);
        logger.error('❌ Error banning user:', banError);
        await interaction.editReply({
          content: `❌ Error: ${(banError as any)?.message || 'Failed to ban user'}`,
        });
      }
    } catch (error) {
      console.error('[BAN USER ERROR (OUTER)]:', error);
      logger.error('❌ Ban User Command Error:', error);

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
