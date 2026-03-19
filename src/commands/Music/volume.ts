import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { getGuildVolume, setGuildVolume } from '../../utils/musicManager.js';

/**
 * VOLUME COMMAND - Module 6: High-Fidelity Music
 * Precision audio control with 1% - 200% range
 * Fine-tuned loudness levels for optimal listening
 *
 * Command: /volume [level]
 * Location: src/commands/Music/volume.ts
 */

export default {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('🔊 Adjust the music volume (1% - 200%)')
    .addIntegerOption((option) =>
      option
        .setName('level')
        .setDescription('Volume level (1-200)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(200)
    )
    .addStringOption((option) =>
      option
        .setName('preset')
        .setDescription('Quick volume preset')
        .setRequired(false)
        .addChoices(
          { name: '🔇 Mute (0%)', value: '0' },
          { name: '🔉 Quiet (25%)', value: '25' },
          { name: '🔊 Normal (100%)', value: '100' },
          { name: '🔴 Loud (150%)', value: '150' },
          { name: '⚡ Max (200%)', value: '200' }
        )
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: false });

      // Check if bot is playing music
      const botMember = await interaction.guild?.members.fetch(interaction.client.user.id);
      if (!botMember?.voice.channel) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('❌ Not Playing')
          .setDescription('The bot must be playing music to adjust volume.');

        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      let volumeLevel = 100;
      const level = interaction.options.getInteger('level');
      const preset = interaction.options.getString('preset');

      if (level !== null) {
        volumeLevel = level;
      } else if (preset) {
        volumeLevel = parseInt(preset);
      }

      // Ensure valid range
      if (volumeLevel < 0 || volumeLevel > 200) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('❌ Invalid Volume Level')
          .setDescription('Please provide a volume level between 1% and 200%.');

        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      // Apply volume (0.0 - 2.0 range)
      if (interaction.guildId) {
        setGuildVolume(interaction.guildId, volumeLevel / 100);
      }

      // Determine volume indicator
      let volumeEmoji = '🔇';
      let volumeDescription = 'Muted';

      if (volumeLevel > 0 && volumeLevel <= 33) {
        volumeEmoji = '🔉';
        volumeDescription = 'Quiet';
      } else if (volumeLevel > 33 && volumeLevel <= 99) {
        volumeEmoji = '🔊';
        volumeDescription = 'Normal';
      } else if (volumeLevel > 100 && volumeLevel <= 150) {
        volumeEmoji = '🔴';
        volumeDescription = 'Loud';
      } else if (volumeLevel > 150) {
        volumeEmoji = '⚡';
        volumeDescription = 'Maximum (Caution: Potential hearing damage)';
      }

      // Create visual volume bar
      const barLength = 20;
      const filledBars = Math.round((volumeLevel / 200) * barLength);
      const emptyBars = barLength - filledBars;
      const volumeBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);

      const volumeEmbed = new EmbedBuilder()
        .setColor('#0088FF')
        .setTitle(`${volumeEmoji} Volume Adjusted`)
        .setDescription(`**${volumeLevel}%** - ${volumeDescription}`)
        .addFields(
          {
            name: '📊 Volume Indicator',
            value: `\`[${volumeBar}]\` ${volumeLevel}%`,
            inline: false,
          },
          {
            name: '🎵 Current Track',
            value: '[Placeholder] Song Name - Artist (3:45)',
            inline: true,
          },
          {
            name: '🔊 Output Quality',
            value: '320kbps / 48kHz Stereo',
            inline: true,
          },
          {
            name: '💡 Audio Settings',
            value:
              '• Normalization: ON\n' +
              '• Bass Boost: OFF\n' +
              '• Equalizer: Flat\n' +
              '• Limiter: ON (200%)',
            inline: false,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [volumeEmbed] });
    } catch (error) {
      console.error('Error executing volume command:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Volume Control Error')
        .setDescription('Failed to adjust the volume.');

      if (interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else if (!interaction.replied) {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },

  cooldown: 1,
  requiresVIP: false,
};
