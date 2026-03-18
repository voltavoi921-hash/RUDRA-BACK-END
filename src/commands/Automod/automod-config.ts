import {
  SlashCommandBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX AUTOMOD CONFIG COMMAND
 * Interactive configuration panel for automod filters
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('automod-config')
    .setDescription('Configure automod filters and actions')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction: any) {
    try {
      // Permission check
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const deniedEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('❌ Permission Denied')
          .setDescription('You need **Administrator** permissions to use this command.')
          .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });

        return interaction.reply({ embeds: [deniedEmbed], ephemeral: true });
      }

      // Validate guild
      if (!interaction.guildId) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('❌ Guild Not Found')
          .setDescription('This command can only be used in a server.')
          .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });

        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      // Import Automod model
      const { default: mongoose } = await import('mongoose');
      const db = mongoose.connection;
      const AutomodModel = db.models['Automod'];

      if (!AutomodModel) {
        logger.error('❌ Automod model not registered');
        const errorEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('❌ Database Error')
          .setDescription('Automod system is not initialized. Please contact the bot owner.')
          .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      // Fetch or create automod config
      const config = await AutomodModel.findOneAndUpdate(
        { guildId: interaction.guildId },
        {
          $setOnInsert: {
            guildId: interaction.guildId,
            enabled: false,
            badWords: [],
            filters: {
              spam: false,
              caps: false,
              links: false,
              invites: false,
              phishing: false,
              mentions: false,
              nsfw: false,
            },
            actions: {
              deleteMessage: true,
              muteUser: false,
              kickUser: false,
              warnUser: true,
            },
            muteDuration: 5,
            maxWarnings: 3,
            createdAt: new Date(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      logger.info(`[AUTOMOD CONFIG] Opened config for guild: ${interaction.guildId}`);

      // Build filter status string
      const filterStatus = [
        `${config.filters.spam ? '✅' : '❌'} **Spam Detection**`,
        `${config.filters.caps ? '✅' : '❌'} **CAPS Lock Filter**`,
        `${config.filters.links ? '✅' : '❌'} **Link Filter**`,
        `${config.filters.invites ? '✅' : '❌'} **Discord Invite Filter**`,
        `${config.filters.phishing ? '✅' : '❌'} **Phishing Detection**`,
        `${config.filters.mentions ? '✅' : '❌'} **Mention Spam Filter**`,
        `${config.filters.nsfw ? '✅' : '❌'} **NSFW Content Filter**`,
      ].join('\n');

      // Build action status string
      const actionStatus = [
        `${config.actions.deleteMessage ? '✅' : '❌'} **Auto-Delete Messages**`,
        `${config.actions.warnUser ? '✅' : '❌'} **Warn User**`,
        `${config.actions.muteUser ? '✅' : '❌'} **Mute User**`,
        `${config.actions.kickUser ? '✅' : '❌'} **Kick User**`,
      ].join('\n');

      // Create select menu options
      const filterOptions = [
        {
          label: config.filters.spam ? '✅ Spam Detection (ON)' : '❌ Spam Detection (OFF)',
          value: 'toggle_spam',
          description: 'Toggle spam message detection',
          emoji: '📧',
        },
        {
          label: config.filters.caps ? '✅ CAPS Lock (ON)' : '❌ CAPS Lock (OFF)',
          value: 'toggle_caps',
          description: 'Toggle excessive CAPS lock filter',
          emoji: '🔤',
        },
        {
          label: config.filters.links ? '✅ Link Filter (ON)' : '❌ Link Filter (OFF)',
          value: 'toggle_links',
          description: 'Toggle URL/link detection',
          emoji: '🔗',
        },
        {
          label: config.filters.invites
            ? '✅ Invite Filter (ON)'
            : '❌ Invite Filter (OFF)',
          value: 'toggle_invites',
          description: 'Toggle Discord invite detection',
          emoji: '📨',
        },
        {
          label: config.filters.phishing
            ? '✅ Phishing Detection (ON)'
            : '❌ Phishing Detection (OFF)',
          value: 'toggle_phishing',
          description: 'Toggle phishing link detection',
          emoji: '🎣',
        },
        {
          label: config.filters.mentions
            ? '✅ Mention Filter (ON)'
            : '❌ Mention Filter (OFF)',
          value: 'toggle_mentions',
          description: 'Toggle mention spam detection',
          emoji: '📣',
        },
        {
          label: config.filters.nsfw ? '✅ NSFW Filter (ON)' : '❌ NSFW Filter (OFF)',
          value: 'toggle_nsfw',
          description: 'Toggle NSFW content detection',
          emoji: '🚫',
        },
      ];

      // Create select menu
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('automod_filter_toggle')
        .setPlaceholder('Click to toggle a filter')
        .addOptions(filterOptions);

      const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

      // Create config embed
      const configEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('⚙️ Automod Configuration Panel')
        .addFields(
          {
            name: '🛡️ Active Filters',
            value: filterStatus || 'No filters enabled',
            inline: false,
          },
          {
            name: '⚡ Enforcement Actions',
            value: actionStatus || 'No actions configured',
            inline: false,
          },
          {
            name: '⏱️ Mute Duration',
            value: `${config.muteDuration} minutes`,
            inline: true,
          },
          {
            name: '⚠️ Max Warnings',
            value: `${config.maxWarnings} warnings`,
            inline: true,
          }
        )
        .setDescription('Select a filter below to toggle it ON/OFF')
        .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
        .setTimestamp();

      return interaction.reply({ embeds: [configEmbed], components: [actionRow] });
    } catch (error) {
      logger.error(`[AUTOMOD CONFIG] Error: ${error}`);

      const errorEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('❌ System Error')
        .setDescription('Failed to load automod configuration. Please try again.')
        .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
