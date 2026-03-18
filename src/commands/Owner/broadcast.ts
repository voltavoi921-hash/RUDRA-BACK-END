import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ChannelType,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX BROADCAST COMMAND - GLOBAL ANNOUNCEMENT
 * Send a message to all servers where bot has permissions
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('broadcast')
    .setDescription('📢 Send a broadcast to all servers (Owner Only)')
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('Message content to broadcast')
        .setRequired(true)
        .setMaxLength(2000)
    )
    .addStringOption((option) =>
      option
        .setName('title')
        .setDescription('Embed title (optional)')
        .setRequired(false)
        .setMaxLength(256)
    )
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

      const message = interaction.options.getString('message', true);
      const title = interaction.options.getString('title') || '📢 Global Announcement';

      let successCount = 0;
      let failedCount = 0;
      let bots = 0;

      // Loop through all servers
      for (const [guildId, guild] of interaction.client.guilds.cache) {
        try {
          // Find first available text channel
          const textChannel = guild.channels.cache.find(
            (channel) =>
              channel.type === ChannelType.GuildText &&
              channel.permissionsFor(guild.members.me!)?.has('SendMessages')
          );

          if (!textChannel) {
            failedCount++;
            continue;
          }

          // Create broadcast embed
          const broadcastEmbed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle(title)
            .setDescription(message)
            .setFooter({
              text: '👑 Developed & Owned by Ashu & Zoro | Global Broadcast',
              iconURL: interaction.client.user?.displayAvatarURL(),
            })
            .setTimestamp();

          // Send the message
          // @ts-ignore - We've verified textChannel has send method
          await textChannel.send({
            embeds: [broadcastEmbed],
          });

          successCount++;

          logger.info(`✅ Broadcast sent to ${guild.name}`);
        } catch (guildError) {
          failedCount++;
          logger.warn(`⚠️ Failed to broadcast to ${guild.name}:`, guildError);
        }
      }

      // Create result embed
      const resultEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('✅ Broadcast Complete')
        .setDescription(`Global announcement has been sent.`)
        .addFields(
          {
            name: '✅ Successful',
            value: `${successCount} servers`,
            inline: true,
          },
          {
            name: '❌ Failed',
            value: `${failedCount} servers`,
            inline: true,
          },
          {
            name: '📊 Total Guilds',
            value: `${interaction.client.guilds.cache.size}`,
            inline: true,
          },
          {
            name: '📝 Message Preview',
            value: message.substring(0, 256),
            inline: false,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({
        embeds: [resultEmbed],
      });

      logger.info(
        `✅ Broadcast completed: ${successCount} successful, ${failedCount} failed by ${interaction.user.tag}`
      );
    } catch (error) {
      logger.error('❌ Broadcast Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while broadcasting.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while broadcasting.',
          ephemeral: true,
        });
      }
    }
  },
};
