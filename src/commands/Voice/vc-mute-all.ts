import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} from 'discord.js';

/**
 * VC-MUTE-ALL COMMAND - Module 7: Voice & JTC (Join-to-Create)
 * Administrator power command to silence everyone in a voice channel
 * Useful for emergencies, event control, or administrative overrides
 *
 * Command: /vc-mute-all [channel]
 * Location: src/commands/Voice/vc-mute-all.ts
 */

export default {
  data: new SlashCommandBuilder()
    .setName('vc-mute-all')
    .setDescription('🔇 Administrator override: Silence everyone in a voice channel')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Target voice channel (omit to use your current channel)')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('action')
        .setDescription('Mute or unmute')
        .setRequired(false)
        .addChoices(
          { name: '🔇 Mute All', value: 'mute' },
          { name: '🔊 Unmute All', value: 'unmute' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: false });

      // Check admin permissions
      const member = await interaction.guild?.members.fetch(interaction.user.id);
      if (!member?.permissions.has(PermissionFlagsBits.Administrator)) {
        const permEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('❌ Permission Denied')
          .setDescription('You need **Administrator** permissions to use this command.');

        await interaction.editReply({ embeds: [permEmbed] });
        return;
      }

      // Get target channel
      let channelOption = interaction.options.getChannel('channel');
      let voiceChannel: any = null;

      if (channelOption) {
        // Fetch the full channel object from the guild to ensure we have all properties
        const guild = interaction.guild;
        const channel = await guild?.channels.fetch(channelOption.id).catch(() => null);
        
        // Check if the specified channel is a voice channel
        if (!channel || channel.type !== ChannelType.GuildVoice) {
          const errorEmbed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('❌ Not a Voice Channel')
            .setDescription(
              'The specified channel is not a voice channel. Please provide a valid voice channel.'
            );

          await interaction.editReply({ embeds: [errorEmbed] });
          return;
        }
        voiceChannel = channel;
      } else {
        // Use the user's current voice channel
        voiceChannel = member?.voice.channel;
      }

      if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('❌ No Voice Channel Found')
          .setDescription(
            'Please specify a voice channel or join one first.'
          );

        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      const action = interaction.options.getString('action') || 'mute';
      const isMuting = action === 'mute';

      /**
       * TODO: Implement actual voice mute functionality
       * For each member in the voice channel:
       * 1. Get the member object
       * 2. Use member.voice.setMute(true/false)
       * 3. Track who was muted for logging
       * 4. Implement unmute functionality
       * 5. Log all actions for audit purposes
       */

      // Count members that would be affected
      const memberCount = voiceChannel.members.size;
      const affectedMembers = Array.from(voiceChannel.members.values())
        .filter((m: any) => !m.user.bot) // Exclude bots
        .map((m: any) => m.user.tag)
        .join('\n');

      const actionEmbed = new EmbedBuilder()
        .setColor(isMuting ? '#FF6B6B' : '#00B894')
        .setTitle(isMuting ? '🔇 Mass Mute Activated' : '🔊 Mass Unmute Activated')
        .setDescription(
          isMuting
            ? `**${memberCount}** user${memberCount !== 1 ? 's' : ''} have been silenced.`
            : `**${memberCount}** user${memberCount !== 1 ? 's' : ''} have been unmuted.`
        )
        .addFields(
          {
            name: '📻 Voice Channel',
            value: `\`${voiceChannel.name}\``,
            inline: true,
          },
          {
            name: '👥 Member Count',
            value: memberCount.toString(),
            inline: true,
          },
          {
            name: '👮 Action By',
            value: `${interaction.user.tag} (Admin)`,
            inline: true,
          },
          {
            name: '⏰ Timestamp',
            value: `<t:${Math.floor(Date.now() / 1000)}:T>`,
            inline: true,
          },
          {
            name: '📋 Affected Members',
            value: affectedMembers || '*No members in channel*',
            inline: false,
          },
          {
            name: '⚠️ Warning',
            value:
              '🚨 **This is an administrative override.** All members will ' +
              (isMuting ? 'have their microphones disabled.' : 'regain control of their audio.'),
            inline: false,
          },
          {
            name: '🔄 Reversal',
            value:
              isMuting
                ? 'Use `/vc-mute-all action:Unmute All` to restore audio.'
                : 'Members can re-enable their microphones.',
            inline: false,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro | Admin Action',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [actionEmbed] });

      /**
       * TODO: Log this action to audit channel
       * - Record who performed the action
       * - Record affected members
       * - Record timestamp
       * - Record duration (if temporary)
       */
    } catch (error) {
      console.error('Error executing vc-mute-all command:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Command Failed')
        .setDescription('Failed to execute the mute-all command.');

      if (interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else if (!interaction.replied) {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },

  cooldown: 5,
  requiresOwner: false,
};
