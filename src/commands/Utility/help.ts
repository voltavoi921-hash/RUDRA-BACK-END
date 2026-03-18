import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX HELP COMMAND - THE ULTIMATE 19-MODULE SYSTEM
 * Displays a god-tier help menu with 19 advanced command categories
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 * 500+ Commands across 19 modules
 */

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('📚 Get help with RUDRA.OX commands and features')
    .setDMPermission(true),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // Defer the reply to allow time for processing
      await interaction.deferReply({ ephemeral: false });

      // Create main help embed
      const mainEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('🚀 RUDRA.OX | Advanced System')
        .setDescription(
          '**Welcome to RUDRA.OX - Your God-Tier Discord Bot**\n\n' +
          '**19 Advanced Modules • 500+ Commands • Enterprise Grade**\n\n' +
          'Select a module from the dropdown to explore commands and features.\n\n' +
          '```\n' +
          '⚡ Lightning-fast responses\n' +
          '🤖 AI-powered intelligence\n' +
          '🛡️  Enterprise-grade security\n' +
          '♾️  Unlimited scalability\n' +
          '👑 Absolute Owner Control\n' +
          '```'
        )
        .addFields(
          {
            name: '📊 Statistics',
            value: '• **19 Modules**\n• **500+ Commands**\n• **1000+ Features**',
            inline: true,
          },
          {
            name: '🏔️ Peak Performance',
            value: '• **Sub-100ms Latency**\n• **99.9% Uptime**\n• **Enterprise Ready**',
            inline: true,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      // Create select menu with all 19 modules
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help_select')
        .setPlaceholder('🎯 Select a module (19 available)...')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('👑 Absolute Owner')
            .setValue('owner')
            .setEmoji('👑')
            .setDescription('Owner-only powerful commands'),
          new StringSelectMenuOptionBuilder()
            .setLabel('💎 Premium & VIP')
            .setValue('vip')
            .setEmoji('💎')
            .setDescription('VIP exclusive features'),
          new StringSelectMenuOptionBuilder()
            .setLabel('🛡️ Security & Antinuke')
            .setValue('antinuke')
            .setEmoji('🛡️')
            .setDescription('Anti-raid and security'),
          new StringSelectMenuOptionBuilder()
            .setLabel('🤖 AI & Automod')
            .setValue('automod')
            .setEmoji('🤖')
            .setDescription('AI-powered moderation'),
          new StringSelectMenuOptionBuilder()
            .setLabel('🔨 Advanced Moderation')
            .setValue('mod')
            .setEmoji('🔨')
            .setDescription('Powerful moderation tools'),
          new StringSelectMenuOptionBuilder()
            .setLabel('🎵 High-Fidelity Music')
            .setValue('music')
            .setEmoji('🎵')
            .setDescription('Premium audio playback'),
          new StringSelectMenuOptionBuilder()
            .setLabel('🎙️ Voice & JTC')
            .setValue('voice')
            .setEmoji('🎙️')
            .setDescription('Voice chat controls'),
          new StringSelectMenuOptionBuilder()
            .setLabel('🎫 Ticket System')
            .setValue('tickets')
            .setEmoji('🎫')
            .setDescription('Support ticket management'),
          new StringSelectMenuOptionBuilder()
            .setLabel('🎭 Reaction Roles')
            .setValue('reactroles')
            .setEmoji('🎭')
            .setDescription('Reaction-based role assignment'),
          new StringSelectMenuOptionBuilder()
            .setLabel('👤 Self Roles & Config')
            .setValue('selfroles')
            .setEmoji('👤')
            .setDescription('User self-assignment'),
          new StringSelectMenuOptionBuilder()
            .setLabel('🎉 Giveaways')
            .setValue('giveaways')
            .setEmoji('🎉')
            .setDescription('Tournament & giveaway system'),
          new StringSelectMenuOptionBuilder()
            .setLabel('🪙 Global Economy')
            .setValue('economy')
            .setEmoji('🪙')
            .setDescription('Economic simulation'),
          new StringSelectMenuOptionBuilder()
            .setLabel('📊 Leveling & Ranks')
            .setValue('leveling')
            .setEmoji('📊')
            .setDescription('XP and ranking system'),
          new StringSelectMenuOptionBuilder()
            .setLabel('🗣️ Custom Messaging')
            .setValue('messaging')
            .setEmoji('🗣️')
            .setDescription('Say, TTS, and announcements'),
          new StringSelectMenuOptionBuilder()
            .setLabel('🧰 Utility & Info')
            .setValue('utility')
            .setEmoji('🧰')
            .setDescription('General utility commands'),
          new StringSelectMenuOptionBuilder()
            .setLabel('👁️ Logging & Audits')
            .setValue('logging')
            .setEmoji('👁️')
            .setDescription('Server activity tracking'),
          new StringSelectMenuOptionBuilder()
            .setLabel('📡 Social Media Alerts')
            .setValue('socials')
            .setEmoji('📡')
            .setDescription('YouTube, Twitch, Twitter'),
          new StringSelectMenuOptionBuilder()
            .setLabel('🕷️ Global Blacklist')
            .setValue('blacklist')
            .setEmoji('🕷️')
            .setDescription('User and server blacklisting'),
          new StringSelectMenuOptionBuilder()
            .setLabel('⚙️ Bot Configuration')
            .setValue('config')
            .setEmoji('⚙️')
            .setDescription('Server customization')
        );

      const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

      // Send initial message (use editReply since we deferred)
      const response = await interaction.editReply({
        embeds: [mainEmbed],
        components: [actionRow],
      });

      // Create collector for select menu interactions
      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 10 * 60 * 1000, // 10 minutes
      });

      collector.on('collect', async (selectInteraction) => {
        // Only allow the original user to interact
        if (selectInteraction.user.id !== interaction.user.id) {
          await selectInteraction.reply({
            content: '❌ Only the command user can change categories!',
            ephemeral: true,
          });
          return;
        }

        const selectedModule = selectInteraction.values[0];
        let categoryEmbed: EmbedBuilder;

        // Massive switch statement for all 19 modules
        switch (selectedModule) {
          case 'owner':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('👑 Absolute Owner Commands')
              .setDescription('**Maximum Authority Operations** - Owner Only\n\n')
              .addFields(
                {
                  name: '🎛️ System Control',
                  value:
                    '`/eval` - Execute JavaScript code\n' +
                    '`/restart` - Restart the bot safely\n' +
                    '`/shutdown` - Graceful shutdown\n' +
                    '`/reload-commands` - Reload all commands\n' +
                    '`/reload-events` - Reload all events\n' +
                    '`/clear-cache` - Clear bot cache\n' +
                    '`/status` - Set custom bot status\n' +
                    '`/broadcast` - Message all servers\n' +
                    '`/maintenance-mode` - Enable maintenance\n' +
                    '`/force-deploy` - Force command deployment\n' +
                    '`/database-backup` - Backup all data\n' +
                    '`/database-restore` - Restore from backup\n' +
                    '`/cluster-info` - View cluster stats\n' +
                    '`/memory-usage` - Monitor memory\n' +
                    '`/performance-stats` - View metrics',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'vip':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('💎 Premium & VIP Commands')
              .setDescription('**Exclusive VIP Member Features** - Premium Only\n\n')
              .addFields(
                {
                  name: '💎 VIP Features',
                  value:
                    '`/addvip` - Grant VIP status (Owner)\n' +
                    '`/removevip` - Revoke VIP status (Owner)\n' +
                    '`/vipstatus` - Check your VIP status\n' +
                    '`/vipinfo` - View all VIP perks\n' +
                    '`/vipbadge` - Display VIP badge\n' +
                    '`/vip-credits` - Check remaining credits\n' +
                    '`/vip-boost` - Activate boost mode\n' +
                    '`/priority-support` - Get priority help\n' +
                    '`/exclusive-commands` - VIP-only commands\n' +
                    '`/vip-leaderboard` - Top VIP members\n' +
                    '`/custom-prefix` - Set custom prefix\n' +
                    '`/vip-theme` - Set custom theme\n' +
                    '`/early-access` - Access beta features\n' +
                    '`/bonus-xp` - Get XP multiplier\n' +
                    '`/vip-marketplace` - Exclusive shop',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'antinuke':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('🛡️ Security & Antinuke')
              .setDescription('**Advanced Server Protection** - Enterprise Grade\n\n')
              .addFields(
                {
                  name: '🛡️ Security Systems',
                  value:
                    '`/antinuke-enable` - Enable antinuke\n' +
                    '`/antinuke-disable` - Disable antinuke\n' +
                    '`/antinuke-config` - Configure settings\n' +
                    '`/authorize-user` - Whitelist user\n' +
                    '`/ban-user` - Blacklist user\n' +
                    '`/antiraid-setup` - Setup anti-raid\n' +
                    '`/rate-limit` - Set join rate limit\n' +
                    '`/webhook-monitor` - Monitor webhooks\n' +
                    '`/role-protect` - Protect important roles\n' +
                    '`/channel-lock` - Lock channel edits\n' +
                    '`/invite-filter` - Block invite links\n' +
                    '`/audit-log` - View security logs\n' +
                    '`/threat-level` - Current threat level\n' +
                    '`/security-status` - Full security report\n' +
                    '`/emergency-lockdown` - Full lockdown mode',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'automod':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('🤖 AI & Automod')
              .setDescription('**Intelligent Moderation** - AI Powered\n\n')
              .addFields(
                {
                  name: '🤖 Automod Features',
                  value:
                    '`@bot <message>` - Chat with AI\n' +
                    '`/automod-enable` - Enable automod\n' +
                    '`/automod-config` - Configure rules\n' +
                    '`/badwords-add` - Add banned word\n' +
                    '`/badwords-remove` - Remove banned word\n' +
                    '`/badwords-list` - View all banned words\n' +
                    '`/spam-filter` - Anti-spam settings\n' +
                    '`/caps-filter` - Excessive caps filter\n' +
                    '`/link-filter` - Block external links\n' +
                    '`/invite-blocker` - Block Discord invites\n' +
                    '`/ai-response` - Configure AI replies\n' +
                    '`/content-filter` - NSFW content filter\n' +
                    '`/phishing-detect` - Phishing detection\n' +
                    '`/mention-spam` - Prevent mention spam\n' +
                    '`/automod-logs` - View mod logs',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'mod':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('🔨 Advanced Moderation')
              .setDescription('**Powerful Moderation Tools** - Full Control\n\n')
              .addFields(
                {
                  name: '🔨 Moderation Commands',
                  value:
                    '`/ban <user>` - Ban user permanently\n' +
                    '`/kick <user>` - Remove from server\n' +
                    '`/mute <user>` - Mute user\n' +
                    '`/unmute <user>` - Unmute user\n' +
                    '`/warn <user>` - Issue warning\n' +
                    '`/unwarn <user>` - Remove warning\n' +
                    '`/purge <count>` - Delete messages\n' +
                    '`/slowmode <seconds>` - Set slowmode\n' +
                    '`/lock` - Lock channel\n' +
                    '`/unlock` - Unlock channel\n' +
                    '`/timeout <user>` - Timeout user\n' +
                    '`/unban <user>` - Unban user\n' +
                    '`/banlist` - View all bans\n' +
                    '`/moderator-info` - Mod statistics\n' +
                    '`/case-info <id>` - View case details',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'music':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('🎵 High-Fidelity Music')
              .setDescription('**Premium Audio System** - Crystal Clear Sound\n\n')
              .addFields(
                {
                  name: '🎵 Music Features',
                  value:
                    '`/play <song>` - Play song or playlist\n' +
                    '`/pause` - Pause playback\n' +
                    '`/resume` - Resume playback\n' +
                    '`/skip` - Skip current song\n' +
                    '`/queue` - View song queue\n' +
                    '`/lyrics` - Display song lyrics\n' +
                    '`/volume <level>` - Adjust volume\n' +
                    '`/loop <mode>` - Enable/disable loop\n' +
                    '`/shuffle` - Shuffle queue\n' +
                    '`/seek <time>` - Jump to timestamp\n' +
                    '`/nowplaying` - Current track info\n' +
                    '`/playlist-save` - Save playlist\n' +
                    '`/playlist-load` - Load saved playlist\n' +
                    '`/radio <station>` - Stream radio\n' +
                    '`/8d-filter` - 8D audio effect',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'voice':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('🎙️ Voice & JTC')
              .setDescription('**Voice Channel Management** - Join-to-Create\n\n')
              .addFields(
                {
                  name: '🎙️ Voice Features',
                  value:
                    '`/vc-lock` - Lock voice channel\n' +
                    '`/vc-unlock` - Unlock voice channel\n' +
                    '`/vc-slowmode` - Set slowmode\n' +
                    '`/vc-limit <count>` - User limit\n' +
                    '`/vc-name <name>` - Rename channel\n' +
                    '`/vc-bitrate <bps>` - Set bitrate\n' +
                    '`/vc-mute-all` - Mute everyone\n' +
                    '`/vc-unmute-all` - Unmute everyone\n' +
                    '`/vc-deafen` - Deafen yourself\n' +
                    '`/vc-undeafen` - Undeafen yourself\n' +
                    '`/jtc-setup` - Setup JTC system\n' +
                    '`/jtc-config` - Configure JTC\n' +
                    '`/stage-event` - Create stage event\n' +
                    '`/recording-mode` - Enable recording\n' +
                    '`/voice-activity` - View activity',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'tickets':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('🎫 Ticket System')
              .setDescription('**Support & Ticket Management** - Enterprise Support\n\n')
              .addFields(
                {
                  name: '🎫 Ticket Features',
                  value:
                    '`/ticket-setup` - Initialize ticket system\n' +
                    '`/ticket-create` - Create new ticket\n' +
                    '`/ticket-close` - Close ticket\n' +
                    '`/ticket-reopen` - Reopen ticket\n' +
                    '`/ticket-add` - Add member to ticket\n' +
                    '`/ticket-remove` - Remove member\n' +
                    '`/ticket-claim` - Claim ticket\n' +
                    '`/ticket-unclaim` - Unclaim ticket\n' +
                    '`/ticket-transfer` - Transfer ticket\n' +
                    '`/ticket-priority` - Set priority\n' +
                    '`/transcript` - Generate transcript\n' +
                    '`/ticket-stats` - View statistics\n' +
                    '`/ticket-category` - Create category\n' +
                    '`/ticket-rename` - Rename ticket\n' +
                    '`/ticket-lock` - Lock ticket channel',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'reactroles':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('🎭 Reaction Roles')
              .setDescription('**Reaction-Based Role Assignment** - Interactive\n\n')
              .addFields(
                {
                  name: '🎭 Reaction Role Features',
                  value:
                    '`/rr-add` - Create reaction role\n' +
                    '`/rr-remove` - Remove reaction role\n' +
                    '`/rr-list` - View all reaction roles\n' +
                    '`/rr-set-message` - Set target message\n' +
                    '`/rr-set-role` - Assign role\n' +
                    '`/rr-set-emoji` - Set emoji trigger\n' +
                    '`/rr-bulk-add` - Add multiple roles\n' +
                    '`/rr-config` - Configure settings\n' +
                    '`/rr-toggle` - Enable/disable\n' +
                    '`/rr-test` - Test reaction role\n' +
                    '`/rr-clean` - Clean inactive roles\n' +
                    '`/rr-preview` - Preview reactions\n' +
                    '`/rr-reset` - Reset all roles\n' +
                    '`/rr-migration` - Migrate from other bot\n' +
                    '`/rr-analytics` - View usage stats',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'selfroles':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('👤 Self Roles & Config')
              .setDescription('**User Self-Assignment & Profile** - Customization\n\n')
              .addFields(
                {
                  name: '👤 Self Role Features',
                  value:
                    '`/selfrole-add <role>` - Add to self roles\n' +
                    '`/selfrole-remove <role>` - Remove from list\n' +
                    '`/selfrole-list` - View all available\n' +
                    '`/selfrole-join <role>` - Self assign\n' +
                    '`/selfrole-leave <role>` - Remove self\n' +
                    '`/myprofile` - View your profile\n' +
                    '`/bio <text>` - Set bio\n' +
                    '`/pronouns <pronouns>` - Set pronouns\n' +
                    '`/status <status>` - Set status\n' +
                    '`/color <color>` - Set profile color\n' +
                    '`/avatar <url>` - Set avatar\n' +
                    '`/aboutme` - Edit about section\n' +
                    '`/interests <interests>` - Set interests\n' +
                    '`/toggle-dm` - Toggle DM notifications\n' +
                    '`/privacy-settings` - Configure privacy',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'giveaways':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('🎉 Giveaways & Tournaments')
              .setDescription('**Prize Distribution & Contests** - Fair & Transparent\n\n')
              .addFields(
                {
                  name: '🎉 Giveaway Features',
                  value:
                    '`/giveaway <prize>` - Start giveaway\n' +
                    '`/giveaway-end <id>` - End giveaway\n' +
                    '`/giveaway-reroll <id>` - Reroll winner\n' +
                    '`/giveaway-pause <id>` - Pause giveaway\n' +
                    '`/giveaway-resume <id>` - Resume giveaway\n' +
                    '`/giveaway-list` - Active giveaways\n' +
                    '`/giveaway-history` - Past giveaways\n' +
                    '`/tournament-create` - Create tournament\n' +
                    '`/tournament-join` - Join tournament\n' +
                    '`/tournament-bracket` - View bracket\n' +
                    '`/tournament-schedule` - Match schedule\n' +
                    '`/tournament-announce` - Auto-announce\n' +
                    '`/giveaway-notify` - Get notifications\n' +
                    '`/giveaway-required` - Set requirements\n' +
                    '`/giveaway-multiplier` - Bonus entries',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'economy':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('🪙 Global Economy')
              .setDescription('**Economic Simulation System** - Earn & Trade\n\n')
              .addFields(
                {
                  name: '🪙 Economy Features',
                  value:
                    '`/balance` - Check your balance\n' +
                    '`/transfer <user> <amount>` - Send money\n' +
                    '`/shop` - View shop items\n' +
                    '`/buy <item>` - Purchase item\n' +
                    '`/sell <item>` - Sell item\n' +
                    '`/inventory` - View items\n' +
                    '`/daily` - Daily bonus\n' +
                    '`/work` - Earn money\n' +
                    '`/crime` - Risky money earning\n' +
                    '`/gamble` - Gambling games\n' +
                    '`/bank-deposit` - Secure savings\n' +
                    '`/bank-withdraw` - Withdraw funds\n' +
                    '`/leaderboard` - Richest users\n' +
                    '`/invest <amount>` - Stock investments\n' +
                    '`/business` - Run a business',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'leveling':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('📊 Leveling & Ranks')
              .setDescription('**XP & Ranking System** - Progression\n\n')
              .addFields(
                {
                  name: '📊 Leveling Features',
                  value:
                    '`/rank` - View your rank\n' +
                    '`/leaderboard` - Top members\n' +
                    '`/profile <user>` - User profile\n' +
                    '`/level-reset <user>` - Admin reset\n' +
                    '`/xp-add <user>` - Add XP\n' +
                    '`/xp-remove <user>` - Remove XP\n' +
                    '`/level-multiplier` - Set multiplier\n' +
                    '`/ignore-channel` - Exclude channel\n' +
                    '`/level-announce` - Celebration message\n' +
                    '`/rank-card` - Custom rank card\n' +
                    '`/stream-multiplier` - Streaming bonus\n' +
                    '`/boost-multiplier` - Server booster bonus\n' +
                    '`/prestige` - Prestige system\n' +
                    '`/level-config` - Configure settings\n' +
                    '`/statistics` - View XP stats',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'messaging':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('🗣️ Custom Messaging')
              .setDescription('**Say, TTS & Announcements** - Message Broadcasting\n\n')
              .addFields(
                {
                  name: '🗣️ Messaging Features',
                  value:
                    '`/say <message>` - Make bot speak\n' +
                    '`/tts <text>` - Text-to-speech\n' +
                    '`/announce <message>` - Server announce\n' +
                    '`/embed` - Create embed\n' +
                    '`/embed-builder` - Visual embed builder\n' +
                    '`/react-message` - Add reactions\n' +
                    '`/poll <question>` - Create poll\n' +
                    '`/webhook-send` - Send as webhook\n' +
                    '`/schedule-message` - Delayed send\n' +
                    '`/broadcast-all` - Message all servers\n' +
                    '`/welcome-msg` - Custom welcome\n' +
                    '`/goodbye-msg` - Custom goodbye\n' +
                    '`/subscribe-news` - News digest\n' +
                    '`/newsletter-send` - Send newsletter\n' +
                    '`/message-stats` - Messages sent',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'utility':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('🧰 Utility & Info')
              .setDescription('**General Utilities & Information** - Essential Tools\n\n')
              .addFields(
                {
                  name: '🧰 Utility Features',
                  value:
                    '`/ping` - Bot latency\n' +
                    '`/help` - This menu\n' +
                    '`/serverinfo` - Server details\n' +
                    '`/userinfo <user>` - User details\n' +
                    '`/avatar <user>` - Get avatar URL\n' +
                    '`/banner <user>` - Get banner\n' +
                    '`/id` - Get object IDs\n' +
                    '`/roleinfo <role>` - Role details\n' +
                    '`/channelinfo <channel>` - Channel info\n' +
                    '`/membercount` - Member statistics\n' +
                    '`/emoji` - Emoji information\n' +
                    '`/time <timezone>` - Time query\n' +
                    '`/calc <expression>` - Calculator\n' +
                    '`/translate <text>` - Language translation\n' +
                    '`/qrcode <text>` - Generate QR code',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'logging':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('👁️ Logging & Audits')
              .setDescription('**Activity Tracking & Auditing** - Full History\n\n')
              .addFields(
                {
                  name: '👁️ Logging Features',
                  value:
                    '`/audit-log <user>` - User activity\n' +
                    '`/modlog` - Moderation history\n' +
                    '`/log-channel <channel>` - Set log channel\n' +
                    '`/enable-logging` - Turn on logging\n' +
                    '`/disable-logging` - Turn off logging\n' +
                    '`/message-logs` - Message history\n' +
                    '`/member-logs` - Join/leave history\n' +
                    '`/role-logs` - Role change history\n' +
                    '`/channel-logs` - Channel changes\n' +
                    '`/ban-logs` - All bans\n' +
                    '`/export-logs` - Download logs\n' +
                    '`/clear-logs` - Delete old logs\n' +
                    '`/log-settings` - Configure logging\n' +
                    '`/webhook-logs` - Log webhook creation\n' +
                    '`/search-logs` - Search history',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'socials':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('📡 Social Media Alerts')
              .setDescription('**YouTube, Twitch, Twitter Integration** - Social Feeds\n\n')
              .addFields(
                {
                  name: '📡 Social Features',
                  value:
                    '`/youtube-notify <url>` - YouTube alerts\n' +
                    '`/twitch-notify <channel>` - Twitch live\n' +
                    '`/twitter-feed <handle>` - Twitter feed\n' +
                    '`/tiktok-notify <user>` - TikTok alerts\n' +
                    '`/instagram-notify <user>` - Instagram posts\n' +
                    '`/reddit-feed <subreddit>` - Reddit posts\n' +
                    '`/reddit-await-approval` - Get approved\n' +
                    '`/twitch-auto-role` - Streamer role\n' +
                    '`/social-settings` - Configure feeds\n' +
                    '`/disable-social` - Disable feed\n' +
                    '`/enable-social` - Enable feed\n' +
                    '`/notification-role` - Notify role\n' +
                    '`/social-stats` - View statistics\n' +
                    '`/rss-feed <url>` - RSS feed monitor\n' +
                    '`/social-channel <channel>` - Set alert channel',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'blacklist':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('🕷️ Global Blacklist')
              .setDescription('**User & Server Blocking** - Safety System\n\n')
              .addFields(
                {
                  name: '🕷️ Blacklist Features',
                  value:
                    '`/bl-add-user <user>` - Blacklist user\n' +
                    '`/bl-remove-user <user>` - Unblacklist user\n' +
                    '`/bl-add-server <serverid>` - Blacklist server\n' +
                    '`/bl-remove-server` - Unblacklist server\n' +
                    '`/bl-user-list` - View blacklisted users\n' +
                    '`/bl-server-list` - View blacklisted servers\n' +
                    '`/bl-check <user>` - Check if blacklisted\n' +
                    '`/bl-reason <user>` - View reason\n' +
                    '`/bl-appeal <reason>` - Appeal blacklist\n' +
                    '`/bl-pending-appeals` - Pending appeals\n' +
                    '`/bl-auto-kick` - Auto-kick blacklisted\n' +
                    '`/bl-sync` - Sync with global list\n' +
                    '`/bl-export` - Export blacklist\n' +
                    '`/bl-import` - Import blacklist\n' +
                    '`/bl-statistics` - View stats',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          case 'config':
            categoryEmbed = new EmbedBuilder()
              .setColor('#2b2d31')
              .setTitle('⚙️ Bot Configuration')
              .setDescription('**Server Customization & Settings** - Complete Control\n\n')
              .addFields(
                {
                  name: '⚙️ Configuration Features',
                  value:
                    '`/prefix <new-prefix>` - Change prefix\n' +
                    '`/language <lang>` - Set language\n' +
                    '`/welcome-channel <channel>` - Welcome messages\n' +
                    '`/welcome-msg <text>` - Custom welcome\n' +
                    '`/goodbye-msg <text>` - Custom goodbye\n' +
                    '`/autorole <role>` - Auto-assign role\n' +
                    '`/join-message` - Join announcements\n' +
                    '`/leave-message` - Leave announcements\n' +
                    '`/bot-channel <channel>` - Bot commands only\n' +
                    '`/disable-command <cmd>` - Disable command\n' +
                    '`/enable-command <cmd>` - Enable command\n' +
                    '`/reset-config` - Reset to default\n' +
                    '`/export-config` - Export settings\n' +
                    '`/import-config` - Import settings\n' +
                    '`/view-config` - Current settings',
                  inline: false,
                }
              )
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
            break;

          default:
            categoryEmbed = new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Module Not Found')
              .setDescription('The selected module could not be found.')
              .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
              .setTimestamp();
        }

        await selectInteraction.update({
          embeds: [categoryEmbed],
          components: [actionRow],
        });

        logger.info(`✅ ${selectInteraction.user.tag} viewed ${selectedModule} module`);
      });

      collector.on('end', () => {
        logger.debug('Help menu collector ended');
      });
    } catch (error) {
      logger.error('❌ Help Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while displaying the help menu.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while displaying the help menu.',
          ephemeral: true,
        });
      }
    }
  },
};
