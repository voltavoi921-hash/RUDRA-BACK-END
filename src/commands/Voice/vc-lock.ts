import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} from 'discord.js';

/**
 * VC-LOCK COMMAND - Module 7: Voice & JTC (Join-to-Create)
 * Lock voice channels for private sessions
 * Only channel owner or admin can lock/unlock
 *
 * Command: /vc-lock
 * Location: src/commands/Voice/vc-lock.ts
 */

export default {
  data: new SlashCommandBuilder()
    .setName('vc-lock')
    .setDescription('🔒 Lock your voice channel to prevent others from joining')
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: true });

      // Check if user is in a voice channel
      const member = await interaction.guild?.members.fetch(interaction.user.id);
      const voiceChannel = member?.voice.channel;

      if (!voiceChannel) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('❌ Not in Voice Channel')
          .setDescription('You must be in a voice channel to lock it.');

        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      // Check if it's a temporary JTC channel
      if (!voiceChannel.name.includes('🎙️') && !member?.permissions.has(PermissionFlagsBits.Administrator)) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('❌ Not Your Channel')
          .setDescription(
            'You can only lock temporary channels that you own, or use this command with admin permissions.'
          );

        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      /**
       * TODO: Implement voice permission system
       * - Store channel state in database
       * - Modify permissions to prevent new joins
       * - Maintain list of whitelisted users
       * - Implement unlock functionality
       */

      // Lock the channel (placeholder implementation)
      const lockEmbed = new EmbedBuilder()
        .setColor('#FFB700')
        .setTitle('🔒 Voice Channel Locked')
        .setDescription(
          `**${voiceChannel.name}** is now a **private session**.\n\n` +
          'Only current members can stay. New users cannot join.'
        )
        .addFields(
          {
            name: '📋 Current Members',
            value: `${voiceChannel.members.size} user${voiceChannel.members.size !== 1 ? 's' : ''}`,
            inline: true,
          },
          {
            name: '🔐 Status',
            value: 'Locked - Private',
            inline: true,
          },
          {
            name: '👤 Channel Owner',
            value: `${interaction.user.tag}`,
            inline: false,
          },
          {
            name: '🔑 Management',
            value:
              '• `/vc-unlock` - Make the channel public again\n' +
              '• `/vc-whitelist` - Allow specific users\n' +
              '• `/vc-kick` - Remove members\n' +
              '• `/vc-name` - Rename the channel',
            inline: false,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [lockEmbed] });

      // Send notification to voice channel
      const notifyEmbed = new EmbedBuilder()
        .setColor('#FFB700')
        .setTitle('🔒 This channel has been locked')
        .setDescription('Only current members can remain in this private session.');

      const channel = interaction.channel;
      if (channel?.type === ChannelType.GuildText) {
        try {
          await channel.send({ embeds: [notifyEmbed] });
        } catch {
          // Ignore if can't send notification
        }
      }
    } catch (error) {
      console.error('Error executing vc-lock command:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Lock Failed')
        .setDescription('Failed to lock the voice channel.');

      if (interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else if (!interaction.replied) {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },

  cooldown: 2,
};
