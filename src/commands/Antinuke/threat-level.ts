import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX THREAT-LEVEL COMMAND
 * Analyze and display current server threat level
 * Version: 1.0.0 (God-Tier Security)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('threat-level')
    .setDescription('🚨 Display current server threat assessment level')
    .addStringOption((option) =>
      option
        .setName('scope')
        .setDescription('Analysis scope')
        .setRequired(false)
        .addChoices(
          { name: '🌐 Full Server', value: 'full' },
          { name: '👥 Member Analysis', value: 'members' },
          { name: '🔧 Infrastructure', value: 'infra' },
          { name: '🔐 Permissions', value: 'permissions' }
        )
    )
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: false });

      const scope = interaction.options.getString('scope') || 'full';

      // ========== THREAT ANALYSIS ==========
      const threatData = analyzeThreatLevel(interaction, scope);
      const threatEmbed = createThreatEmbed(threatData, interaction);

      await interaction.editReply({ embeds: [threatEmbed] });
      logger.info(
        `✅ Threat level analyzed for ${interaction.guild?.name}: scope=${scope}`
      );
    } catch (error) {
      console.error('[THREAT-LEVEL ERROR]:', error);
      logger.error('❌ Threat Level Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: `❌ Error: ${(error as any)?.message || 'Unknown error'}`,
        });
      }
    }
  },
};

// ========== THREAT ANALYSIS ENGINE ==========
function analyzeThreatLevel(
  interaction: ChatInputCommandInteraction,
  scope: string
): {
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  factors: string[];
  recommendations: string[];
} {
  const guild = interaction.guild!;
  const factors: string[] = [];
  let score = 0;

  // Analyze based on scope
  switch (scope) {
    case 'members':
      // Check unverified members
      const unverified = guild.members.cache.filter(
        (m) => !m.roles.highest.id || m.joinedTimestamp && Date.now() - m.joinedTimestamp < 86400000 // Less than 1 day
      );
      if (unverified.size > guild.memberCount * 0.3) {
        factors.push(
          `⚠️ ${unverified.size} unverified members (${Math.round((unverified.size / guild.memberCount) * 100)}%)`
        );
        score += 25;
      }

      // Check bot accounts
      const bots = guild.members.cache.filter((m) => m.user.bot).size;
      if (bots > 10) {
        factors.push(`🤖 ${bots} bot accounts detected`);
        score += 15;
      }

      // Check members with admin role
      const admins = guild.members.cache.filter((m) =>
        m.permissions.has('Administrator')
      );
      if (admins.size > 5) {
        factors.push(`👑 ${admins.size} admin members (high trust required)`);
        score += 20;
      }
      break;

    case 'infra':
      // Check role hierarchy
      const rolesWithAdmin = guild.roles.cache.filter((r) =>
        r.permissions.has('Administrator')
      );
      if (rolesWithAdmin.size > 3) {
        factors.push(`⚠️ ${rolesWithAdmin.size} roles with admin permissions`);
        score += 30;
      }

      // Check webhook count
      const webhooksCount = guild.channels.cache.reduce((acc, ch) => {
        return acc; // Would require additional checks
      }, 0);
      if (webhooksCount > 5) {
        factors.push(`🪝 ${webhooksCount} webhooks (potential entry points)`);
        score += 15;
      }

      // Check channel count growth
      if (guild.channels.cache.size > 100) {
        factors.push(`📊 ${guild.channels.cache.size} channels (complex structure)`);
        score += 10;
      }
      break;

    case 'permissions':
      // Check public permissions
      const defaultRole = guild.roles.everyone;
      const publicPerms = defaultRole.permissions.toArray();
      if (publicPerms.length > 5) {
        factors.push(`🔓 ${publicPerms.length} permissions granted to @everyone`);
        score += 35;
      }

      // Check role color abuse (spam)
      const coloredRoles = guild.roles.cache.filter((r) => r.color !== 0);
      if (coloredRoles.size > 50) {
        factors.push(`🎨 ${coloredRoles.size} colored roles (possible spam)`);
        score += 10;
      }
      break;

    case 'full':
    default:
      // Comprehensive analysis
      const allMembers = guild.memberCount;
      const botCount = guild.members.cache.filter((m) => m.user.bot).size;
      const newMembers = guild.members.cache.filter(
        (m) => m.joinedTimestamp && Date.now() - m.joinedTimestamp < 604800000 // Less than 7 days
      ).size;

      factors.push(`📊 Members: ${allMembers} (${botCount} bots, ${newMembers} new)`);

      if (newMembers > allMembers * 0.2) {
        factors.push(
          `⚠️ High new member rate: ${Math.round((newMembers / allMembers) * 100)}%`
        );
        score += 25;
      }

      if (botCount > 20) {
        factors.push(`🤖 High bot count: ${botCount}`);
        score += 15;
      }

      const adminRoles = guild.roles.cache.filter((r) =>
        r.permissions.has('Administrator')
      );
      if (adminRoles.size > 5) {
        factors.push(`👑 Multiple admin roles: ${adminRoles.size}`);
        score += 20;
      }

      factors.push(`🌐 Channels: ${guild.channels.cache.size}`);
      factors.push(`🎭 Roles: ${guild.roles.cache.size}`);
      break;
  }

  // Determine threat level
  let level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (score >= 75) level = 'CRITICAL';
  else if (score >= 50) level = 'HIGH';
  else if (score >= 25) level = 'MEDIUM';

  const recommendations = getRecommendations(level, scope);

  return { level, score, factors, recommendations };
}

function getRecommendations(
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
  scope: string
): string[] {
  const baseRecs = {
    CRITICAL: [
      '🚨 Enable automod immediately',
      '🔐 Review all admin roles',
      '👥 Audit recent members',
      '🪝 Disable webhooks if not needed',
    ],
    HIGH: [
      '⚠️ Enable 2-factor authentication requirement',
      '🔍 Review invite settings',
      '📋 Audit moderator permissions',
      '🛡️ Enable anti-bot measures',
    ],
    MEDIUM: [
      '✅ Consider enable member verification',
      '🔒 Review public channel permissions',
      '👀 Monitor for suspicious activity',
    ],
    LOW: [
      '✅ Server appears secure',
      '🛡️ Continue regular audits',
      '📊 Monitor threat levels',
    ],
  };

  return baseRecs[level];
}

function createThreatEmbed(
  threatData: {
    level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    score: number;
    factors: string[];
    recommendations: string[];
  },
  interaction: ChatInputCommandInteraction
): EmbedBuilder {
  const colorMap = {
    CRITICAL: '#FF0000',
    HIGH: '#FF6600',
    MEDIUM: '#FFB700',
    LOW: '#00FF00',
  };

  const iconMap = {
    CRITICAL: '🚨',
    HIGH: '⚠️',
    MEDIUM: '🟡',
    LOW: '✅',
  };

  return new EmbedBuilder()
    .setColor(parseInt(colorMap[threatData.level].replace('#', ''), 16) as any)
    .setTitle(
      `${iconMap[threatData.level]} Threat Level: ${threatData.level}`
    )
    .addFields(
      {
        name: '📊 Threat Score',
        value: `${threatData.score}/100`,
        inline: true,
      },
      {
        name: '🎯 Assessment Status',
        value: threatData.level,
        inline: true,
      },
      {
        name: '📋 Risk Factors',
        value:
          threatData.factors.length > 0
            ? threatData.factors.join('\n')
            : '✅ No major risks detected',
        inline: false,
      },
      {
        name: '🛡️ Recommendations',
        value: threatData.recommendations.join('\n'),
        inline: false,
      }
    )
    .setFooter({
      text: '👑 Developed & Owned by Ashu & Zoro | RUDRA Security Module',
      iconURL: interaction.client.user?.displayAvatarURL(),
    })
    .setTimestamp();
}
