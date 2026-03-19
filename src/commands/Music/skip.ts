import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { skip as skipTrack } from '../../utils/musicManager.js';

/**
 * SKIP COMMAND - Module 6: High-Fidelity Music
 * Skip to the next track in the queue
 *
 * Command: /skip
 * Location: src/commands/Music/skip.ts
 */

export default {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('⏭️ Skip to the next track in the queue'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: false });

      // Check if user is in a voice channel
      const member = await interaction.guild?.members.fetch(interaction.user.id);
      if (!member?.voice.channel) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('❌ Voice Channel Required')
          .setDescription('You must be in a voice channel to skip tracks.');

        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      // Skip the current track
      if (interaction.guildId) {
        skipTrack(interaction.guildId);
      }

      const skipEmbed = new EmbedBuilder()
        .setColor('#00B894')
        .setTitle('⏭️ Track Skipped')
        .setDescription('Skipped the current track and started the next one in the queue.')
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [skipEmbed] });
    } catch (error) {
      console.error('Error executing skip command:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Skip Failed')
        .setDescription('Failed to skip the current track.');

      if (interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else if (!interaction.replied) {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },

  cooldown: 2,
  requiresVIP: false,
};
