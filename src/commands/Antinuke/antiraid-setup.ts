import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX ANTIRAID SETUP COMMAND
 * Toggle the anti-raid system for mass-join protection
 * Version: 1.0.0 (God-Tier Security)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('antiraid-setup')
    .setDescription(
      '🛡️ Toggle the anti-raid system (mass-join & new account protection)'
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
            'Only the server owner can configure the anti-raid system.'
          )
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [deniedEmbed] });
        logger.warn(
          `⛔ Unauthorized antiraid-setup attempt by ${interaction.user.tag}`
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
            antiRaid: true,
          });
        } else {
          // Toggle antiRaid
          config.antiRaid = !config.antiRaid;
          await config.save();
        }

        // Create response embed
        const statusEmbed = new EmbedBuilder()
          .setColor(config.antiRaid ? '#00FF00' : '#FFB700')
          .setTitle(
            '🛡️ Anti-Raid System ' + (config.antiRaid ? 'ENABLED' : 'DISABLED')
          )
          .setDescription(
            config.antiRaid
              ? 'Mass-join protections are now ACTIVE.'
              : 'Anti-raid protections are now OFFLINE.'
          )
          .addFields(
            {
              name: '🔒 Status',
              value: config.antiRaid ? '✅ **ARMED**' : '❌ **DISARMED**',
              inline: true,
            },
            {
              name: '🛡️ Protections',
              value: config.antiRaid
                ? '• New account blocking (< 3 days)\n• Mass-join detection\n• Auto-kick on raid trigger'
                : 'All protections disabled',
              inline: true,
            },
            {
              name: '⏰ New Account Threshold',
              value: '3 days old minimum',
              inline: true,
            },
            {
              name: '📊 Mass-Join Limit',
              value: '10 users per 30 seconds',
              inline: true,
            }
          )
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [statusEmbed] });

        logger.info(
          `✅ Anti-raid system toggled to ${config.antiRaid ? 'ON' : 'OFF'} for guild ${interaction.guild?.name}`
        );
      } catch (dbError) {
        console.error('[ANTIRAID SETUP ERROR]:', dbError);
        logger.error('❌ Database error during antiraid setup:', dbError);
        await interaction.editReply({
          content: `❌ Error: ${(dbError as any)?.message || 'Database error'}`,
        });
      }
    } catch (error) {
      console.error('[ANTIRAID SETUP ERROR (OUTER)]:', error);
      logger.error('❌ Antiraid Setup Command Error:', error);

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
