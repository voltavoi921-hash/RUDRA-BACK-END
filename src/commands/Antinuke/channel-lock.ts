import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX CHANNEL-LOCK COMMAND
 * Lock channels to prevent unauthorized access during raids
 * Version: 1.0.0 (God-Tier Security)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('channel-lock')
    .setDescription('🔐 Lock or unlock channels to prevent unauthorized access')
    .addStringOption((option) =>
      option
        .setName('action')
        .setDescription('Lock or unlock action')
        .setRequired(true)
        .addChoices(
          { name: '🔐 Lock Channel', value: 'lock' },
          { name: '🔓 Unlock Channel', value: 'unlock' },
          { name: '🔐 Lock All', value: 'lockall' },
          { name: '🔓 Unlock All', value: 'unlockall' },
          { name: '📋 Status', value: 'status' }
        )
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Target channel (optional for lock/unlock)')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
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
            'Only the server owner can execute channel lock commands.'
          )
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [deniedEmbed] });
        logger.warn(
          `⛔ Unauthorized channel-lock attempt by ${interaction.user.tag}`
        );
        return;
      }

      const action = interaction.options.getString('action');
      const channel = interaction.options.getChannel('channel');
      const resultEmbed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('🔐 Channel Lock System');

      try {
        switch (action) {
          case 'lock':
            if (!channel) {
              await interaction.editReply({
                content:
                  '❌ Please specify a channel to lock.',
              });
              return;
            }

            if ('permissionOverwrites' in channel) {
              await channel.permissionOverwrites.create(
                interaction.guild!.roles.everyone,
                {
                  SendMessages: false,
                  Connect: false,
                  Speak: false,
                },
                { reason: 'RUDRA Channel Lock: Security lockdown' }
              );
            }

            resultEmbed
              .setColor('#FF0000')
              .setDescription('🔐 Channel Locked')
              .addFields({
                name: '📍 Channel',
                value: channel.toString(),
                inline: true,
              });
            break;

          case 'unlock':
            if (!channel) {
              await interaction.editReply({
                content: '❌ Please specify a channel to unlock.',
              });
              return;
            }

            if ('permissionOverwrites' in channel) {
              await channel.permissionOverwrites.delete(
                interaction.guild!.roles.everyone,
                'RUDRA Channel Unlock: Security protocol ended'
              );
            }

            resultEmbed
              .setColor('#00FF00')
              .setDescription('🔓 Channel Unlocked')
              .addFields({
                name: '📍 Channel',
                value: channel.toString(),
                inline: true,
              });
            break;

          case 'lockall':
            const textChannels = interaction.guild?.channels.cache.filter(
              (ch) => ch.type === ChannelType.GuildText
            );
            let lockedCount = 0;

            if (textChannels) {
              for (const [_, ch] of textChannels) {
                try {
                  await ch.permissionOverwrites.create(
                    interaction.guild!.roles.everyone,
                    {
                      SendMessages: false,
                      Connect: false,
                    },
                    { reason: 'RUDRA: Full guild lockdown' }
                  );
                  lockedCount++;
                } catch (e) {
                  // Skip channels we can't lock
                }
              }
            }

            resultEmbed
              .setColor('#FF0000')
              .setDescription('🔐 Lockdown Activated - All Channels Locked')
              .addFields({
                name: '🔒 Channels Locked',
                value: `${lockedCount} channels secured`,
                inline: true,
              });
            break;

          case 'unlockall':
            const allChannels = interaction.guild?.channels.cache.filter(
              (ch) => ch.type === ChannelType.GuildText
            );
            let unlockedCount = 0;

            if (allChannels) {
              for (const [_, ch] of allChannels) {
                try {
                  await ch.permissionOverwrites.delete(
                    interaction.guild!.roles.everyone,
                    'RUDRA: Lockdown ended'
                  );
                  unlockedCount++;
                } catch (e) {
                  // Skip
                }
              }
            }

            resultEmbed
              .setColor('#00FF00')
              .setDescription('🔓 Lockdown Deactivated - All Channels Unlocked')
              .addFields({
                name: '🔒 Channels Unlocked',
                value: `${unlockedCount} channels restored`,
                inline: true,
              });
            break;

          case 'status':
            const lockedChannels = interaction.guild?.channels.cache.filter(
              (ch) =>
                ch.type === ChannelType.GuildText &&
                !ch.permissionsFor(interaction.guild!.roles.everyone)?.has(
                  PermissionFlagsBits.SendMessages
                )
            );

            resultEmbed
              .setColor('#9900FF')
              .setDescription('📋 Channel Lock Status')
              .addFields(
                {
                  name: '📊 Total Channels',
                  value: (interaction.guild?.channels.cache.size || 0).toString(),
                  inline: true,
                },
                {
                  name: '🔐 Locked Channels',
                  value: (lockedChannels?.size || 0).toString(),
                  inline: true,
                },
                {
                  name: '✅ Unlocked Channels',
                  value: ((interaction.guild?.channels.cache.size || 0) - (lockedChannels?.size || 0)).toString(),
                  inline: true,
                }
              );
            break;
        }
      } catch (operationError) {
        console.error('[CHANNEL LOCK OPERATION ERROR]:', operationError);
        resultEmbed.setColor('#FF0000').addFields({
          name: '❌ Error',
          value: (operationError as any)?.message || 'Operation failed',
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
        `✅ Channel lock executed for ${interaction.guild?.name}: action=${action}`
      );
    } catch (error) {
      console.error('[CHANNEL-LOCK ERROR]:', error);
      logger.error('❌ Channel Lock Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: `❌ Error: ${(error as any)?.message || 'Unknown error'}`,
        });
      }
    }
  },
};
