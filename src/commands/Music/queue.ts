import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { clearQueue, getQueue, shuffleQueue } from '../../utils/musicManager.js';

/**
 * QUEUE COMMAND - Module 6: High-Fidelity Music
 * Display and manage the music playback queue
 *
 * Command: /queue [action]
 * Location: src/commands/Music/queue.ts
 */

export default {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('📜 View or manage the music queue')
    .addStringOption((option) =>
      option
        .setName('action')
        .setDescription('Queue action')
        .setRequired(false)
        .addChoices(
          { name: '📋 View Queue', value: 'view' },
          { name: '🧹 Clear Queue', value: 'clear' },
          { name: '🔀 Shuffle', value: 'shuffle' },
          { name: '🔁 Loop', value: 'loop' }
        )
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: false });

      const action = interaction.options.getString('action') || 'view';
      const guildId = interaction.guildId;

      // Check if bot is in a voice channel
      const botMember = await interaction.guild?.members.fetch(interaction.client.user.id);
      if (!botMember?.voice.channel) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('❌ Not Connected')
          .setDescription('The bot is not playing music in any channel.');

        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      const currentQueue = guildId ? getQueue(guildId) : [];
      let responseEmbed: EmbedBuilder;

      switch (action) {
        case 'view': {
          if (!currentQueue.length) {
            responseEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('📜 Music Queue')
              .setDescription('The queue is currently empty.')
              .setFooter({
                text: '👑 Developed & Owned by Ashu & Zoro',
                iconURL: interaction.client.user?.displayAvatarURL(),
              })
              .setTimestamp();
          } else {
            const nowPlaying = currentQueue[0];
            const upcoming = currentQueue.slice(1, 6);

            responseEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('📜 Music Queue')
              .addFields(
                {
                  name: '🎵 Now Playing',
                  value: `**${nowPlaying.title}**\n${nowPlaying.url}`,
                  inline: false,
                },
                {
                  name: `📋 Up Next (${upcoming.length})`,
                  value:
                    upcoming.length > 0
                      ? upcoming
                          .map((track, index) =>
                            `${index + 1}. [${track.title}](${track.url})`
                          )
                          .join('\n')
                      : 'No further tracks in queue.',
                  inline: false,
                },
                {
                  name: '🎧 Requested By',
                  value: nowPlaying.requestedBy,
                  inline: true,
                }
              )
              .setFooter({
                text: '👑 Developed & Owned by Ashu & Zoro',
                iconURL: interaction.client.user?.displayAvatarURL(),
              })
              .setTimestamp();
          }
          break;
        }

        case 'clear': {
          if (guildId) clearQueue(guildId);

          responseEmbed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('🧹 Queue Cleared')
            .setDescription('All queued tracks have been removed.')
            .setFooter({
              text: '👑 Developed & Owned by Ashu & Zoro',
              iconURL: interaction.client.user?.displayAvatarURL(),
            })
            .setTimestamp();
          break;
        }

        case 'shuffle': {
          if (guildId) shuffleQueue(guildId);

          responseEmbed = new EmbedBuilder()
            .setColor('#0088FF')
            .setTitle('🔀 Queue Shuffled')
            .setDescription('The current queue order has been randomized.')
            .setFooter({
              text: '👑 Developed & Owned by Ashu & Zoro',
              iconURL: interaction.client.user?.displayAvatarURL(),
            })
            .setTimestamp();
          break;
        }

        case 'loop': {
          responseEmbed = new EmbedBuilder()
            .setColor('#00B894')
            .setTitle('🔁 Loop Mode')
            .setDescription(
              'Looping is not yet supported. This feature will be added soon.'
            )
            .setFooter({
              text: '👑 Developed & Owned by Ashu & Zoro',
              iconURL: interaction.client.user?.displayAvatarURL(),
            })
            .setTimestamp();
          break;
        }

        default: {
          responseEmbed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('📜 Music Queue')
            .setDescription('Unknown action. Use `/queue` to view your current queue.');
        }
      }

      await interaction.editReply({ embeds: [responseEmbed] });
    } catch (error) {
      console.error('Error executing queue command:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Queue Error')
        .setDescription('Failed to manage the queue.');

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
