import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX SECURITY STATUS COMMAND
 * Display comprehensive security statistics and threat level
 * Version: 1.0.0 (God-Tier Security)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('security-status')
    .setDescription('📊 View comprehensive security status and threat level')
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: false });

      try {
        // Import Antinuke model
        const { default: mongoose } = await import('mongoose');
        const db = mongoose.connection;

        if (!db.models['Antinuke']) {
          await interaction.editReply({
            content:
              '❌ Antinuke database not initialized. Run `/antinuke-enable` first.',
          });
          logger.error('❌ Antinuke model not found');
          return;
        }

        const AntinukeModel = db.models['Antinuke'];

        // Fetch antinuke config
        let antinukeConfig = await AntinukeModel.findOne({
          guildId: interaction.guildId,
        });

        // If no config exists yet, create a default one
        if (!antinukeConfig) {
          antinukeConfig = await AntinukeModel.create({
            guildId: interaction.guildId,
            enabled: false,
            whitelistedUsers: [],
            features: {
              antiBan: false,
              antiKick: false,
              antiChannel: false,
              antiRole: false,
              antiBot: false,
            },
          });
        }

        // Calculate threat level
        let threatLevel = '🔴 CRITICAL';
        let threatColor = '#FF0000';
        let threatDescription =
          'Antinuke system is disabled. Server is vulnerable to attacks.';

        if (antinukeConfig.enabled) {
          if (antinukeConfig.antiRaid) {
            threatLevel = '🟢 SECURE';
            threatColor = '#00FF00';
            threatDescription =
              'Full protection enabled. Server is heavily fortified.';
          } else {
            threatLevel = '🟡 GUARDED';
            threatColor = '#FFD700';
            threatDescription =
              'Basic protection active. Anti-Raid not enabled yet.';
          }
        }

        // Create status embed
        const statusEmbed = new EmbedBuilder()
          .setColor(parseInt(threatColor.replace('#', ''), 16) as any)
          .setTitle('📊 Security Status Report')
          .addFields(
            {
              name: '🛡️ Antinuke System Status',
              value: antinukeConfig.enabled ? '✅ **ARMED**' : '❌ **DISABLED**',
              inline: true,
            },
            {
              name: '⚔️ Anti-Raid',
              value: antinukeConfig.antiRaid ? '✅ ON' : '❌ OFF',
              inline: true,
            },
            {
              name: '🔌 Webhook Monitor',
              value: antinukeConfig.antiWebhook ? '✅ ON' : '❌ OFF',
              inline: true,
            },
            {
              name: '📋 Featured Protections',
              value: `
• Anti-Ban: ${antinukeConfig.features.antiBan ? '✅' : '❌'}
• Anti-Kick: ${antinukeConfig.features.antiKick ? '✅' : '❌'}
• Anti-Channel: ${antinukeConfig.features.antiChannel ? '✅' : '❌'}
• Anti-Role: ${antinukeConfig.features.antiRole ? '✅' : '❌'}
• Anti-Bot: ${antinukeConfig.features.antiBot ? '✅' : '❌'}
              `,
              inline: false,
            },
            {
              name: '👥 Whitelisted Users',
              value: `${antinukeConfig.whitelistedUsers.length} users immune to antinuke`,
              inline: true,
            },
            {
              name: '🔒 Protected Roles',
              value: `${antinukeConfig.protectedRoles.length} roles protected`,
              inline: true,
            },
            {
              name: '⏱️ Rate Limit',
              value: `${antinukeConfig.actionRateLimit} actions per 10 seconds`,
              inline: true,
            },
            {
              name: '🎯 Threat Level',
              value: threatLevel,
              inline: true,
            },
            {
              name: '📝 Status Description',
              value: threatDescription,
              inline: false,
            }
          )
          .setThumbnail(interaction.guild?.iconURL() || null)
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [statusEmbed] });

        logger.info(
          `✅ Security status displayed for guild ${interaction.guild?.name}`
        );
      } catch (dbError) {
        console.error('[SECURITY STATUS ERROR]:', dbError);
        logger.error('❌ Database error during security status:', dbError);
        await interaction.editReply({
          content: `❌ Error: ${(dbError as any)?.message || 'Database error'}`,
        });
      }
    } catch (error) {
      console.error('[SECURITY STATUS ERROR (OUTER)]:', error);
      logger.error('❌ Security Status Command Error:', error);

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
