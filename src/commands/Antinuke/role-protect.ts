import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX ROLE PROTECT COMMAND
 * Add a role to the protected list (immune to deletion or modification)
 * Version: 1.0.0 (God-Tier Security)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('role-protect')
    .setDescription('🛡️ Protect an important role from deletion/modification')
    .addRoleOption((option) =>
      option
        .setName('role')
        .setDescription('Role to protect')
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
            'Only the server owner or the Absolute Owner can protect roles.'
          )
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [deniedEmbed] });
        logger.warn(`⛔ Unauthorized role-protect attempt by ${interaction.user.tag}`);
        return;
      }

      const targetRole = interaction.options.getRole('role');
      if (!targetRole) {
        await interaction.editReply({ content: '❌ Role not found.' });
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

        // Add role to protected list
        const updated = await AntinukeModel.findOneAndUpdate(
          { guildId: interaction.guildId },
          {
            $addToSet: { protectedRoles: targetRole.id },
          },
          { upsert: true, new: true }
        );

        // Create protection embed
        const protectEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('🛡️ Role Protected')
          .setDescription(
            `The role **${targetRole.name}** is now heavily protected.`
          )
          .addFields(
            {
              name: '📌 Role',
              value: `${targetRole.name} (${targetRole.id})`,
              inline: true,
            },
            {
              name: '🔒 Status',
              value: 'PROTECTED',
              inline: true,
            },
            {
              name: '⚠️ Notice',
              value:
                'Any attempt to delete or modify this role will trigger the antinuke system and ban the unauthorized admin.',
              inline: false,
            },
            {
              name: '📊 Total Protected Roles',
              value: `${updated.protectedRoles.length} roles`,
              inline: true,
            }
          )
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [protectEmbed] });

        logger.info(
          `✅ Role ${targetRole.name} protected in guild ${interaction.guild?.name}`
        );
      } catch (dbError) {
        console.error('[ROLE PROTECT ERROR]:', dbError);
        logger.error('❌ Database error during role protection:', dbError);
        await interaction.editReply({
          content: `❌ Error: ${(dbError as any)?.message || 'Database error'}`,
        });
      }
    } catch (error) {
      console.error('[ROLE PROTECT ERROR (OUTER)]:', error);
      logger.error('❌ Role Protect Command Error:', error);

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
