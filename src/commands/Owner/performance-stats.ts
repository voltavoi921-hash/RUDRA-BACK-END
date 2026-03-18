import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';
import os from 'os';

/**
 * RUDRA.OX PERFORMANCE-STATS COMMAND - SYSTEM MONITOR
 * Display detailed system performance metrics
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('performance-stats')
    .setDescription('📊 View system performance metrics (Owner Only)')
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // CRITICAL SECURITY CHECK
      if (interaction.user.id !== process.env.OWNER_ID) {
        await interaction.reply({
          content: '❌ Access Denied.',
          ephemeral: true,
        });
        return;
      }

      // Defer reply
      await interaction.deferReply({ ephemeral: true });

      // Get memory usage
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      const heapPercentage = Math.round((heapUsedMB / heapTotalMB) * 100);

      // Get bot uptime
      const uptimeMs = interaction.client.uptime || 0;
      const uptimeDays = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
      const uptimeHours = Math.floor(
        (uptimeMs / (1000 * 60 * 60)) % 24
      );
      const uptimeMinutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
      const uptimeSeconds = Math.floor((uptimeMs / 1000) % 60);

      // Get OS information
      const cpuCount = os.cpus().length;
      const osType = os.type();
      const osRelease = os.release();
      const totalMemory = Math.round(os.totalmem() / 1024 / 1024 / 1024);
      const freeMemory = Math.round(os.freemem() / 1024 / 1024 / 1024);
      const usedMemory = totalMemory - freeMemory;
      const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

      // Get Discord statistics
      const guildCount = interaction.client.guilds.cache.size;
      const userCount = interaction.client.guilds.cache.reduce(
        (acc, guild) => acc + guild.memberCount,
        0
      );
      const commandCount = (interaction.client as any).commands?.size || 0;

      // Get system uptime
      const systemUptimeMs = os.uptime() * 1000;
      const systemUptimeDays = Math.floor(
        systemUptimeMs / (1000 * 60 * 60 * 24)
      );
      const systemUptimeHours = Math.floor(
        (systemUptimeMs / (1000 * 60 * 60)) % 24
      );

      // Create performance embed
      const performanceEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('📊 RUDRA.OX Performance Metrics')
        .setDescription('Complete system and bot statistics')
        .addFields(
          {
            name: '💾 Memory Usage',
            value:
              `🟢 Heap: \`${heapUsedMB}MB / ${heapTotalMB}MB (${heapPercentage}%)\`\n` +
              `🔵 System: \`${usedMemory}GB / ${totalMemory}GB (${memoryPercentage}%)\`\n` +
              `🟡 Free: \`${freeMemory}GB\``,
            inline: false,
          },
          {
            name: '⏱️ Uptime',
            value:
              `🤖 Bot: \`${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s\`\n` +
              `🖥️ System: \`${systemUptimeDays}d ${systemUptimeHours}h\``,
            inline: false,
          },
          {
            name: '🖧 System',
            value:
              `📊 OS: \`${osType} ${osRelease}\`\n` +
              `⚙️ CPU Cores: \`${cpuCount}\`\n` +
              `🌐 Platform: \`${os.platform()}\``,
            inline: false,
          },
          {
            name: '🤖 Bot Statistics',
            value:
              `🏢 Guilds: \`${guildCount}\`\n` +
              `👥 Total Users: \`${userCount}\`\n` +
              `📝 Commands: \`${commandCount}\`\n` +
              `🔌 WebSocket Ping: \`${interaction.client.ws.ping}ms\``,
            inline: false,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({
        embeds: [performanceEmbed],
      });

      logger.info(`✅ Performance stats requested by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('❌ Performance-Stats Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while fetching performance stats.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while fetching performance stats.',
          ephemeral: true,
        });
      }
    }
  },
};
