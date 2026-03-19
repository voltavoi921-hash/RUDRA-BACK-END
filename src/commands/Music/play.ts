import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import {
  enqueueTrack,
  resolveTrack,
} from '../../utils/musicManager.js';

/**
 * PLAY COMMAND - Module 6: High-Fidelity Music
 * Search and play music from YouTube
 *
 * Command: /play <query>
 * Location: src/commands/Music/play.ts
 */

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('🎵 Search and play music from YouTube')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Song name, artist, or search query')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: false });

      const query = interaction.options.getString('query', true);

      // Ensure the user is in a voice channel
      const member = await interaction.guild?.members.fetch(interaction.user.id);
      if (!member?.voice.channel) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('❌ Voice Channel Required')
          .setDescription('You must be in a voice channel to use this command.');

        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      const voiceChannel = member.voice.channel;

      // Fetch track info (search or direct URL)
      const track = await resolveTrack(query, interaction.user.tag);

      await enqueueTrack(
        interaction.guildId!,
        interaction.guild!.voiceAdapterCreator,
        voiceChannel.id,
        track
      );

      const successEmbed = new EmbedBuilder()
        .setColor('#00B894')
        .setTitle('🎵 Added to Queue')
        .setDescription(`Queued **${track.title}** for playback.`)
        .addFields(
          {
            name: '📌 Requested By',
            value: interaction.user.tag,
            inline: true,
          },
          {
            name: '🖇️ Track URL',
            value: track.url,
            inline: true,
          },
          {
            name: '🎧 Voice Channel',
            value: voiceChannel.name,
            inline: true,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('Error executing play command:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Music Playback Error')
        .setDescription(
          'Failed to play the requested music. Please ensure the query is valid and try again.'
        );

      if (interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else if (!interaction.replied) {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },

  cooldown: 3,
  requiresVIP: false,
};
