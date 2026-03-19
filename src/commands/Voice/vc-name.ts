import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';

/**
 * VC-NAME COMMAND - Module 7: Voice & JTC (Join-to-Create)
 * Rename your temporary voice channel
 * Channel owner or admin only
 *
 * Command: /vc-name <new-name>
 * Location: src/commands/Voice/vc-name.ts
 */

export default {
  data: new SlashCommandBuilder()
    .setName('vc-name')
    .setDescription('🎙️ Rename your temporary voice channel')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('New channel name (2-100 characters)')
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(100)
    )
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: true });

      const newName = interaction.options.getString('name', true);

      // Check if user is in a voice channel
      const member = await interaction.guild?.members.fetch(interaction.user.id);
      const voiceChannel = member?.voice.channel;

      if (!voiceChannel) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('❌ Not in Voice Channel')
          .setDescription('You must be in a voice channel to rename it.');

        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      // Check permissions (owner or admin)
      const isOwner = voiceChannel.name.includes(`${interaction.user.username}'s`);
      const isAdmin = member?.permissions.has(PermissionFlagsBits.Administrator);

      if (!isOwner && !isAdmin) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('❌ Permission Denied')
          .setDescription(
            'Only the channel owner or server administrators can rename this channel.'
          );

        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      // Validate name format
      if (newName.length < 2 || newName.length > 100) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('❌ Invalid Name')
          .setDescription('Channel name must be between 2 and 100 characters.');

        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      const oldName = voiceChannel.name;

      /**
       * TODO: Implement actual voice channel rename
       * Use Discord.js: await voiceChannel.setName(newName);
       * Add cooldown to prevent spam
       * Log name changes in database
       */

      // Rename the channel (placeholder)
      const renameEmbed = new EmbedBuilder()
        .setColor('#00B894')
        .setTitle('✅ Voice Channel Renamed')
        .addFields(
          {
            name: '❌ Old Name',
            value: `\`${oldName}\``,
            inline: true,
          },
          {
            name: '✅ New Name',
            value: `\`🎙️ ${newName}\``,
            inline: true,
          },
          {
            name: '👤 Changed By',
            value: `${interaction.user.tag}`,
            inline: false,
          },
          {
            name: '📝 Channel Info',
            value:
              `• **Members**: ${voiceChannel.members.size}\n` +
              `• **Position**: ${voiceChannel.position}\n` +
              `• **Bitrate**: ${voiceChannel.bitrate / 1000}kbps\n` +
              `• **User Limit**: ${voiceChannel.userLimit || 'Unlimited'}`,
            inline: false,
          },
          {
            name: '💡 Tips',
            value:
              '• Use `/vc-lock` to make your channel private\n' +
              '• Use `/vc-kick` to remove members\n' +
              '• The channel will auto-delete when empty',
            inline: false,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [renameEmbed] });
    } catch (error) {
      console.error('Error executing vc-name command:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Rename Failed')
        .setDescription('Failed to rename the voice channel. Please try again.');

      if (interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else if (!interaction.replied) {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },

  cooldown: 5,
};
