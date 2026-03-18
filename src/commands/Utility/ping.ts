import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

/**
 * PING COMMAND - The First Strike Test
 * Verifies that the entire command system is working correctly
 * Displays bot latency and API ping with a premium dark embed
 *
 * Command: /ping
 * Location: src/commands/Utility/ping.ts
 */

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🏓 Check bot latency and API response time'),

  /**
   * Execute command - called when user runs the slash command
   */
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // Defer reply with ephemeral option
      await interaction.deferReply({ ephemeral: true });

      // Get bot's WebSocket latency (in milliseconds)
      const wsLatency = interaction.client.ws.ping;

      // Calculate the API latency (message to response time)
      const apiLatency = Date.now() - interaction.createdTimestamp;

      // Determine latency quality indicator
      let latencyEmoji = '🟢'; // Green - Excellent
      if (wsLatency > 100) latencyEmoji = '🟡'; // Yellow - Good
      if (wsLatency > 200) latencyEmoji = '🔴'; // Red - Poor

      // Create premium dark embed
      const embed = new EmbedBuilder()
        .setColor(0x2b2d31) // Dark embed color (Discord's dark theme)
        .setTitle('🏓 Pong!')
        .setDescription(
          `${latencyEmoji} RUDRA.OX is responding with low latency. All systems operational.`
        )
        .addFields(
          {
            name: '⚡ WebSocket Latency',
            value: `\`${wsLatency}ms\``,
            inline: true,
          },
          {
            name: '📡 API Latency',
            value: `\`${apiLatency}ms\``,
            inline: true,
          },
          {
            name: '🔧 Uptime',
            value: `\`${Math.floor(interaction.client.uptime! / 1000)}s\``,
            inline: true,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      // Reply with ephemeral message (only visible to user)
      await interaction.editReply({
        embeds: [embed],
      });
    } catch (error) {
      console.error('Error executing ping command:', error);

      // Error response
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Error')
        .setDescription('An error occurred while processing the ping command.')
        .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });

      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [errorEmbed],
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true,
        });
      }
    }
  },

  // Optional command properties
  cooldown: 3, // 3 second cooldown between uses
  requiresVIP: false, // Not a VIP-only command
  requiresOwner: false, // Not an owner-only command
};
