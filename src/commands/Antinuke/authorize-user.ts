import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX AUTHORIZE USER COMMAND
 * Whitelist a user to be immune to the antinuke system
 * Version: 1.0.0 (God-Tier Security)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('authorize-user')
    .setDescription('✅ Whitelist a user (immune to antinuke)')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('User to whitelist')
        .setRequired(true)
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
            'Only the server owner or the Absolute Owner can authorize users.'
          )
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [deniedEmbed] });
        logger.warn(
          `⛔ Unauthorized authorize-user attempt by ${interaction.user.tag}`
        );
        return;
      }

      const targetUser = interaction.options.getUser('user');
      if (!targetUser) {
        await interaction.editReply({ content: '❌ User not found.' });
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

        // Add user to whitelist
        const updated = await AntinukeModel.findOneAndUpdate(
          { guildId: interaction.guildId },
          {
            $addToSet: { whitelistedUsers: targetUser.id },
          },
          { upsert: true, new: true }
        );

        // Create authorization embed
        const authEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('✅ User Authorized')
          .setDescription(
            `${targetUser.tag} has been whitelisted and is now immune to the antinuke system.`
          )
          .addFields(
            {
              name: '👤 User',
              value: `${targetUser.tag} (${targetUser.id})`,
              inline: true,
            },
            {
              name: '🔓 Status',
              value: 'WHITELISTED',
              inline: true,
            },
            {
              name: '📊 Total Whitelisted',
              value: `${updated.whitelistedUsers.length} users`,
              inline: true,
            }
          )
          .setThumbnail(targetUser.displayAvatarURL())
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [authEmbed] });

        logger.info(
          `✅ User ${targetUser.tag} whitelisted in guild ${interaction.guild?.name}`
        );
      } catch (dbError) {
        console.error('[AUTHORIZE USER ERROR]:', dbError);
        logger.error('❌ Database error during user authorization:', dbError);
        await interaction.editReply({
          content: `❌ Error: ${(dbError as any)?.message || 'Database error'}`,
        });
      }
    } catch (error) {
      console.error('[AUTHORIZE USER ERROR (OUTER)]:', error);
      logger.error('❌ Authorize User Command Error:', error);

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
