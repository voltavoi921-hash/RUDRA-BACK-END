import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX INVITE FILTER COMMAND
 * Toggle anti-invite/anti-link filter for unauthorized Discord invites
 * Version: 1.0.0 (God-Tier Security)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('invite-filter')
    .setDescription('🔗 Toggle the anti-invite/anti-link filter')
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
            'Only the server owner or the Absolute Owner can toggle the invite filter.'
          )
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [deniedEmbed] });
        logger.warn(
          `⛔ Unauthorized invite-filter attempt by ${interaction.user.tag}`
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

        // Fetch current config
        let config = await AntinukeModel.findOne({
          guildId: interaction.guildId,
        });

        if (!config) {
          config = await AntinukeModel.create({
            guildId: interaction.guildId,
            antiInvite: true,
          });
        } else {
          // Toggle antiInvite
          config.antiInvite = !config.antiInvite;
          await config.save();
        }

        // Create response embed
        const statusEmbed = new EmbedBuilder()
          .setColor(config.antiInvite ? '#00FF00' : '#FFB700')
          .setTitle('🔗 Invite Filter ' + (config.antiInvite ? 'ENABLED' : 'DISABLED'))
          .setDescription(
            config.antiInvite
              ? 'Unauthorized Discord invite links will now be instantly deleted.'
              : 'Invite links are no longer being filtered. Users can share Discord invites freely.'
          )
          .addFields(
            {
              name: '🔤 Filter Status',
              value: config.antiInvite ? '✅ **ON**' : '❌ **OFF**',
              inline: true,
            },
            {
              name: '📝 Pattern',
              value: 'Matches: discord.gg/*, discord.com/invite/*',
              inline: true,
            },
            {
              name: '⚠️ Notice',
              value:
                'Admins and whitelisted users are exempt from the filter. Messages will be deleted silently.',
              inline: false,
            }
          )
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [statusEmbed] });

        logger.info(
          `✅ Invite filter toggled to ${config.antiInvite ? 'ON' : 'OFF'} for guild ${interaction.guild?.name}`
        );
      } catch (dbError) {
        console.error('[INVITE FILTER ERROR]:', dbError);
        logger.error('❌ Database error during invite filter toggle:', dbError);
        await interaction.editReply({
          content: `❌ Error: ${(dbError as any)?.message || 'Database error'}`,
        });
      }
    } catch (error) {
      console.error('[INVITE FILTER ERROR (OUTER)]:', error);
      logger.error('❌ Invite Filter Command Error:', error);

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
