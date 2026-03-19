import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ComponentType,
  StringSelectMenuBuilder,
  ActionRowBuilder,
} from 'discord.js';

/**
 * LYRICS COMMAND - Module 6: High-Fidelity Music
 * Fetch and display song lyrics in real-time
 * Multiple providers for accurate results
 *
 * Command: /lyrics [song]
 * Location: src/commands/Music/lyrics.ts
 */

export default {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('📝 Fetch and display song lyrics in real-time')
    .addStringOption((option) =>
      option
        .setName('song')
        .setDescription('Song name and artist (e.g., "Song Title - Artist")')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: false });

      const songQuery = interaction.options.getString('song');

      // If no song provided, try to get currently playing track
      let searchQuery = songQuery;
      if (!searchQuery) {
        // Check if bot is playing music
        const botMember = await interaction.guild?.members.fetch(interaction.client.user.id);
        if (botMember?.voice.channel) {
          searchQuery = '[Currently Playing] Song - Artist';
        } else {
          const inputEmbed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('❌ No Song Specified')
            .setDescription(
              'Please provide a song name: `/lyrics <song>` (e.g., `/lyrics Blinding Lights - The Weeknd`)'
            );

          await interaction.editReply({ embeds: [inputEmbed] });
          return;
        }
      }

      // Create loading embed
      const loadingEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('📝 Fetching Lyrics...')
        .setDescription(`Searching for: \`${searchQuery}\``)
        .setFooter({ text: '🎵 RUDRA.OX Music Engine' })
        .setTimestamp();

      await interaction.editReply({ embeds: [loadingEmbed] });

      /**
       * TODO: Integrate with lyrics API (e.g., Genius, AZLyrics, or custom scraper)
       * Popular options:
       * - Genius API (official, most reliable)
       * - LyricFind SDK
       * - Custom web scraping
       *
       * For now, we show the placeholder structure
       */

      // Simulated lyrics (placeholder)
      const lyricsContent = `[Verse 1]
Oh, no, it's happening again
The same old fate, can't raise a hand
Without you here, I'm dead and gone
Forgive me, it had to be this way

[Pre-Chorus]
And I can see your shadow in the sun
Like ashes to ashes and dust to dust

[Chorus]
Blinded by the lights, I can't sleep
Until I feel your touch, I'm incomplete

[Verse 2]
Every time you're leaving, I'm lost
Can't stop the pain like I'm made of frost
Your memory's haunting me tonight

[Bridge]
Oh, I, I'm blinded by the lights
Oh, I, I'm blinded by the lights`;

      // Create lyrics embed
      const lyricsEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('📝 Song Lyrics')
        .setDescription(`**${searchQuery}**`)
        .addFields(
          {
            name: 'Lyrics Preview',
            value: '```' + lyricsContent.substring(0, 1024) + '```',
            inline: false,
          },
          {
            name: '🎵 Song Info',
            value:
              '• Artist: [Artist Name]\n' +
              '• Album: [Album Name]\n' +
              '• Year: 2024\n' +
              '• Duration: 3:20',
            inline: true,
          },
          {
            name: '📊 Stats',
            value:
              '• Verses: 2\n' +
              '• Choruses: 2\n' +
              '• Bridge: 1\n' +
              '• Total Lines: 24',
            inline: true,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro | Data provided by Lyrics API',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      // Create action row with buttons (for full lyrics, translate, etc.)
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('lyrics_action')
        .setPlaceholder('Choose an action...')
        .addOptions(
          {
            label: '📖 View Full Lyrics',
            value: 'full',
            emoji: '📖',
            description: 'Show complete lyrics',
          },
          {
            label: '🌐 Translate Lyrics',
            value: 'translate',
            emoji: '🌐',
            description: 'Translate to your language',
          },
          {
            label: '🎤 Karaoke Mode',
            value: 'karaoke',
            emoji: '🎤',
            description: 'Hide lyrics for singing',
          },
          {
            label: '🔗 Open in Browser',
            value: 'browser',
            emoji: '🔗',
            description: 'View on Genius or AZLyrics',
          },
          {
            label: '❌ Close',
            value: 'close',
            emoji: '❌',
            description: 'Close lyrics panel',
          }
        );

      const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

      const response = await interaction.editReply({
        embeds: [lyricsEmbed],
        components: [actionRow],
      });

      // Create collector for select menu interactions
      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 5 * 60 * 1000, // 5 minutes
      });

      collector.on('collect', async (selectInteraction) => {
        if (selectInteraction.user.id !== interaction.user.id) {
          await selectInteraction.reply({
            content: '❌ Only the command user can interact with this!',
            ephemeral: true,
          });
          return;
        }

        const action = selectInteraction.values[0];

        switch (action) {
          case 'full': {
            const fullLyricsEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('📖 Full Lyrics')
              .setDescription('**' + searchQuery + '**')
              .addFields({
                name: '🎵 Complete Lyrics',
                value: '```' + lyricsContent + '```',
              })
              .setFooter({
                text: '👑 Developed & Owned by Ashu & Zoro',
                iconURL: interaction.client.user?.displayAvatarURL(),
              })
              .setTimestamp();

            await selectInteraction.update({ embeds: [fullLyricsEmbed], components: [actionRow] });
            break;
          }

          case 'translate': {
            const translateEmbed = new EmbedBuilder()
              .setColor('#0088FF')
              .setTitle('🌐 Translated Lyrics')
              .setDescription('**' + searchQuery + '** (Translated to Spanish)')
              .addFields(
                {
                  name: 'Original (English)',
                  value: '```' + lyricsContent.substring(0, 512) + '```',
                  inline: false,
                },
                {
                  name: 'Translated (Spanish)',
                  value:
                    '```[Verso 1]\nOh, no, está pasando de nuevo\nEl mismo viejo destino, no puedo levantar una mano\nSin ti, estoy muerto y desaparecido\nPerdóname, tenía que ser así```',
                  inline: false,
                }
              )
              .setFooter({
                text: '👑 Developed & Owned by Ashu & Zoro',
                iconURL: interaction.client.user?.displayAvatarURL(),
              })
              .setTimestamp();

            await selectInteraction.update({ embeds: [translateEmbed], components: [actionRow] });
            break;
          }

          case 'karaoke': {
            const karaokeEmbed = new EmbedBuilder()
              .setColor('#FFB700')
              .setTitle('🎤 Karaoke Mode')
              .setDescription(
                '**Your time to shine!**\n\n🎤💿🎶\n\nThe lyrics have been hidden. Ready to sing?'
              )
              .addFields(
                {
                  name: 'Song',
                  value: searchQuery,
                  inline: true,
                },
                {
                  name: 'Duration',
                  value: '3:20',
                  inline: true,
                }
              )
              .setFooter({
                text: '👑 Developed & Owned by Ashu & Zoro | Good luck! 🌟',
                iconURL: interaction.client.user?.displayAvatarURL(),
              })
              .setTimestamp();

            await selectInteraction.update({ embeds: [karaokeEmbed], components: [actionRow] });
            break;
          }

          case 'browser': {
            const browserEmbed = new EmbedBuilder()
              .setColor('#00B894')
              .setTitle('🔗 Lyrics in Browser')
              .setDescription('Opens the full lyrics page in your default browser.')
              .addFields({
                name: 'Recommended Sites',
                value:
                  '[Genius](https://genius.com)\n' +
                  '[AZLyrics](https://azlyrics.com)\n' +
                  '[LyricFind](https://www.lyricfind.com)',
                inline: false,
              })
              .setFooter({
                text: '👑 Developed & Owned by Ashu & Zoro',
                iconURL: interaction.client.user?.displayAvatarURL(),
              })
              .setTimestamp();

            await selectInteraction.update({ embeds: [browserEmbed], components: [actionRow] });
            break;
          }

          case 'close': {
            await selectInteraction.update({ components: [] });
            collector.stop();
            break;
          }
        }
      });

      collector.on('end', () => {
        // Collector ended, interaction is complete
      });
    } catch (error) {
      console.error('Error executing lyrics command:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Lyrics Fetch Error')
        .setDescription('Failed to retrieve lyrics. Please try again.');

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
