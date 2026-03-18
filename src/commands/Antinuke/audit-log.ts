import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX AUDIT-LOG COMMAND
 * View and manage Discord's audit logs for security tracking
 * Version: 1.0.0 (God-Tier Security)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('audit-log')
    .setDescription('📋 View and analyze server audit logs')
    .addStringOption((option) =>
      option
        .setName('action')
        .setDescription('Audit log action')
        .setRequired(true)
        .addChoices(
          { name: '📖 View Recent', value: 'recent' },
          { name: '🚨 View Deletions', value: 'deletions' },
          { name: '👥 View Bans', value: 'bans' },
          { name: '🔧 View Changes', value: 'changes' },
          { name: '📊 Full Report', value: 'report' }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('Number of entries to fetch (1-100)')
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: true });

      // ========== PERMISSION CHECK ==========
      const isOwner = interaction.user.id === process.env.OWNER_ID;
      const isGuildOwner = interaction.user.id === interaction.guild?.ownerId;

      if (!isOwner && !isGuildOwner) {
        const deniedEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Access Denied')
          .setDescription(
            'Only the server owner can view audit logs.'
          )
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [deniedEmbed] });
        logger.warn(
          `⛔ Unauthorized audit-log attempt by ${interaction.user.tag}`
        );
        return;
      }

      const action = interaction.options.getString('action');
      const limit = interaction.options.getInteger('limit') || 10;
      const resultEmbed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📋 Audit Log Analysis');

      try {
        const logs = await interaction.guild?.fetchAuditLogs({ limit });
        const entries = logs?.entries.first(limit) || [];

        switch (action) {
          case 'recent':
            resultEmbed
              .setDescription('📖 Recent Server Activity')
              .addFields(
                {
                  name: '📝 Latest Actions',
                  value: entries.length
                    ? entries
                        .map(
                          (e) =>
                            `• **${e.action}** by ${e.executor?.username} (${new Date(e.createdTimestamp).toLocaleString()})`
                        )
                        .slice(0, 25)
                        .join('\n')
                    : 'No recent activity',
                },
                {
                  name: '📊 Total Entries',
                  value: entries.length.toString(),
                  inline: true,
                }
              );
            break;

          case 'deletions':
            const deletionLogs = logs?.entries.filter(
              (e) => {
                const actionStr = String(e.action);
                return actionStr.toLowerCase().includes('delete') ||
                actionStr.toLowerCase().includes('remove');
              }
            );
            resultEmbed
              .setColor('#FF0000')
              .setDescription('🚨 Deletion & Removal Events')
              .addFields({
                name: '⚠️ Detected Deletions',
                value: deletionLogs?.size
                  ? deletionLogs
                      ?.first(10)
                      .map(
                        (e) =>
                          `• ${e.action} - ${e.executor?.username} (${e.changes?.map((c) => c.key).join(', ') || 'N/A'})`
                      )
                      .join('\n')
                  : 'No deletions found',
              });
            break;

          case 'bans':
            const banLogs = logs?.entries.filter(
              (e) => String(e.action).toLowerCase().includes('ban')
            );
            resultEmbed
              .setColor('#FF4444')
              .setDescription('👥 Ban & Kick Events')
              .addFields({
                name: '🔨 Bans & Kicks',
                value: banLogs?.size
                  ? banLogs
                      ?.first(10)
                      .map(
                        (e) => {
                          const targetName = (e.target as any)?.username || (e.target as any)?.name || 'Unknown';
                          return `• **${e.targetType}** ${targetName} by ${e.executor?.username}`;
                        }
                      )
                      .join('\n')
                  : 'No bans/kicks found',
              });
            break;

          case 'changes':
            const changeLogs = logs?.entries.filter(
              (e) => String(e.action).toLowerCase().includes('update')
            );
            resultEmbed
              .setColor('#9900FF')
              .setDescription('🔧 Configuration Changes')
              .addFields({
                name: '⚙️ Server Changes',
                value: changeLogs?.size
                  ? changeLogs
                      ?.first(10)
                      .map((e) => `• **${e.action}** by ${e.executor?.username}`)
                      .join('\n')
                  : 'No recent changes',
              });
            break;

          case 'report':
            const allLogs = logs?.entries;
            const deletels = allLogs?.filter(
              (e) => {
                const actionStr = String(e.action);
                return actionStr.toLowerCase().includes('delete') ||
                actionStr.toLowerCase().includes('remove');
              }
            ).size || 0;
            const banlogs = allLogs?.filter(
              (e) => String(e.action).toLowerCase().includes('ban')
            ).size || 0;
            const updatelogs = allLogs?.filter(
              (e) => String(e.action).toLowerCase().includes('update')
            ).size || 0;

            resultEmbed
              .setColor('#00FF00')
              .setDescription('📊 Comprehensive Audit Report')
              .addFields(
                {
                  name: '📈 Statistics',
                  value: `Total Entries: ${allLogs?.size || 0}\nDeletions: ${deletels}\nBans/Kicks: ${banlogs}\nChanges: ${updatelogs}`,
                  inline: false,
                },
                {
                  name: '🔒 Risk Assessment',
                  value: deletels > 5 ? '⚠️ HIGH' : deletels > 2 ? '🟡 MEDIUM' : '✅ LOW',
                  inline: true,
                },
                {
                  name: '⏰ Report Generated',
                  value: new Date().toLocaleString(),
                  inline: true,
                }
              );
            break;
        }
      } catch (operationError) {
        console.error('[AUDIT LOG OPERATION ERROR]:', operationError);
        resultEmbed.setColor('#FF0000').addFields({
          name: '❌ Error',
          value: (operationError as any)?.message || 'Failed to fetch audit logs',
        });
      }

      resultEmbed
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [resultEmbed] });
      logger.info(
        `✅ Audit log accessed for ${interaction.guild?.name}: action=${action}`
      );
    } catch (error) {
      console.error('[AUDIT-LOG ERROR]:', error);
      logger.error('❌ Audit Log Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: `❌ Error: ${(error as any)?.message || 'Unknown error'}`,
        });
      }
    }
  },
};
