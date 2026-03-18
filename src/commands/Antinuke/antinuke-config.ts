import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX ANTINUKE CONFIG COMMAND
 * Interactive control panel for antinuke features
 * Version: 1.0.0 (God-Tier Security)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('antinuke-config')
    .setDescription('🎛️ Interactive antinuke configuration control panel')
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: true });

      // ========== CRITICAL PERMISSION CHECK ==========
      const isOwner = interaction.user.id === process.env.OWNER_ID;
      const isGuildOwner = interaction.user.id === interaction.guild?.ownerId;

      if (!isOwner && !isGuildOwner) {
        const deniedEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Access Denied')
          .setDescription(
            'Only the server owner can access the configuration panel.'
          )
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [deniedEmbed] });
        logger.warn(
          `⛔ Unauthorized antinuke-config attempt by ${interaction.user.tag}`
        );
        return;
      }

      try {
        // Import Antinuke model
        const { default: mongoose } = await import('mongoose');
        const db = mongoose.connection;

        // Get the Antinuke model (model must be registered)
        const AntinukeModel = db.models['Antinuke'];

        if (!AntinukeModel) {
          logger.error('❌ Antinuke model not registered');
          await interaction.editReply({
            content: '❌ Database initialization error. Please contact the bot owner.',
          });
          return;
        }

        // Upsert the antinuke configuration - automatically creates with defaults if doesn't exist
        const config = await AntinukeModel.findOneAndUpdate(
          { guildId: interaction.guildId },
          {
            $setOnInsert: {
              guildId: interaction.guildId,
              enabled: false,
              whitelistedUsers: [],
              antiRaid: true,
              massRoleDelete: true,
              massChannelDelete: true,
              webhookMonitor: true,
              botProtection: true,
              features: {
                antiBan: false,
                antiKick: false,
                antiChannel: false,
                antiRole: false,
                antiBot: false,
              },
              createdAt: new Date(),
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Create feature status string
        const featureStatus = `
**🛡️ Anti-Ban:** ${config.features.antiBan ? '✅ ON' : '❌ OFF'}
**🚫 Anti-Kick:** ${config.features.antiKick ? '✅ ON' : '❌ OFF'}
**📝 Anti-Channel:** ${config.features.antiChannel ? '✅ ON' : '❌ OFF'}
**👤 Anti-Role:** ${config.features.antiRole ? '✅ ON' : '❌ OFF'}
🤖 **Anti-Bot:** ${config.features.antiBot ? '✅ ON' : '❌ OFF'}
        `;

        // Create select menu options
        const options = [
          new StringSelectMenuOptionBuilder()
            .setLabel('Toggle Anti-Ban')
            .setValue('toggle_antiBan')
            .setDescription(
              config.features.antiBan ? 'Currently: ON' : 'Currently: OFF'
            )
            .setEmoji('🛡️'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Toggle Anti-Kick')
            .setValue('toggle_antiKick')
            .setDescription(
              config.features.antiKick ? 'Currently: ON' : 'Currently: OFF'
            )
            .setEmoji('🚫'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Toggle Anti-Channel')
            .setValue('toggle_antiChannel')
            .setDescription(
              config.features.antiChannel ? 'Currently: ON' : 'Currently: OFF'
            )
            .setEmoji('📝'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Toggle Anti-Role')
            .setValue('toggle_antiRole')
            .setDescription(
              config.features.antiRole ? 'Currently: ON' : 'Currently: OFF'
            )
            .setEmoji('👤'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Toggle Anti-Bot')
            .setValue('toggle_antiBot')
            .setDescription(
              config.features.antiBot ? 'Currently: ON' : 'Currently: OFF'
            )
            .setEmoji('🤖'),
        ];

        // Create select menu
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId(`antinuke_config_${interaction.guildId}`)
          .setPlaceholder('Select a feature to toggle...')
          .addOptions(options);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

        // Create control panel embed
        const configEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('🎛️ Antinuke Configuration Panel')
          .setDescription(featureStatus)
          .addFields({
            name: '⚙️ Instructions',
            value: 'Select a feature from the dropdown to toggle it ON/OFF',
            inline: false,
          })
          .setThumbnail(interaction.guild?.iconURL() || null)
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        // Send the response
        const message = await interaction.editReply({
          embeds: [configEmbed],
          components: [row],
        });

        // Collect select menu interactions
        const collector = message.createMessageComponentCollector({
          filter: (i) => i.user.id === interaction.user.id,
          time: 120000, // 2 minutes
        });

        collector.on('collect', async (i: StringSelectMenuInteraction) => {
          try {
            const selectedFeature = i.values[0];
            const featureName = selectedFeature.replace('toggle_', '') as keyof typeof config.features;

            // Toggle the feature
            config.features[featureName] = !config.features[featureName];
            await config.save();

            // Update the embed
            const updatedStatus = `
**🛡️ Anti-Ban:** ${config.features.antiBan ? '✅ ON' : '❌ OFF'}
**🚫 Anti-Kick:** ${config.features.antiKick ? '✅ ON' : '❌ OFF'}
**📝 Anti-Channel:** ${config.features.antiChannel ? '✅ ON' : '❌ OFF'}
**👤 Anti-Role:** ${config.features.antiRole ? '✅ ON' : '❌ OFF'}
🤖 **Anti-Bot:** ${config.features.antiBot ? '✅ ON' : '❌ OFF'}
            `;

            const updatedEmbed = new EmbedBuilder()
              .setColor('#00FF00')
              .setTitle('✅ Configuration Updated')
              .setDescription(updatedStatus)
              .addFields({
                name: '🔄 Action',
                value: `${String(featureName)} has been toggled to ${config.features[featureName] ? '**ON** ✅' : '**OFF** ❌'}`,
                inline: false,
              })
              .setFooter({
                text: '👑 Developed & Owned by Ashu & Zoro',
                iconURL: interaction.client.user?.displayAvatarURL(),
              })
              .setTimestamp();

            await i.update({
              embeds: [updatedEmbed],
              components: [row],
            });

            logger.info(
              `✅ Antinuke feature toggled: ${String(featureName)} in guild ${interaction.guild?.name}`
            );
          } catch (err) {
            console.error('[CONFIG TOGGLE ERROR]:', err);
            logger.error('❌ Error toggling feature:', err);
          }
        });

        collector.on('end', () => {
          // Collection ended either by user interaction or timeout
          logger.debug('Configuration panel timed out or was closed');
        });
      } catch (dbError) {
        console.error('[ANTINUKE CONFIG ERROR]:', dbError);
        logger.error('❌ Database error during antinuke config:', dbError);
        await interaction.editReply({
          content: `❌ Error: ${(dbError as any)?.message || 'Database error'}`,
        });
      }
    } catch (error) {
      console.error('[ANTINUKE CONFIG ERROR (OUTER)]:', error);
      logger.error('❌ Antinuke Config Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: `❌ Error: ${(error as any)?.message || 'Unknown error'}`,
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: `❌ Error: ${(error as any)?.message || 'Unknown error'}`,
          ephemeral: true,
        });
      }
    }
  },
};
