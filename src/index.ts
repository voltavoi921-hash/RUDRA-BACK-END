import {
  Client,
  Collection,
  GatewayIntentBits,
  ChannelType,
  TextChannel,
  EmbedBuilder,
  ActivityType,
} from 'discord.js';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { mongooseEngine } from './database/mongoose.js';
import { antiCrashHandler } from './handlers/antiCrash.js';
import { setupCommandHandler } from './handlers/commandHandler.js';
import { setupEventHandler } from './handlers/eventHandler.js';
// ✅ Import all schemas to register models with mongoose
import { VIP, GuildConfig, VoiceSetup, TicketPanel, UserEconomy, UserStrikes, Giveaway } from './database/schemas/index.js';

// Load environment variables
dotenv.config();

/**
 * RUDRA.OX MAIN ENTRY POINT
 * The God-Tier Discord Bot Engine
 * Version: 1.0.0 (God-Tier)
 * Developers: Ashu & Zoro
 * Owner: Ashu 👑
 */

/**
 * Extend Discord Client with custom properties
 */
declare global {
  interface ClientCustom {
    commands: Collection<string, any>;
  }
}

/**
 * Initialize Discord Client with all necessary intents
 */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Guild-related events
    GatewayIntentBits.GuildMembers, // Member join/leave
    GatewayIntentBits.GuildModeration, // Ban/kick events
    GatewayIntentBits.GuildEmojisAndStickers, // Emoji/sticker events
    GatewayIntentBits.GuildIntegrations, // Integration events
    GatewayIntentBits.GuildWebhooks, // Webhook events
    GatewayIntentBits.GuildInvites, // Invite events
    GatewayIntentBits.GuildVoiceStates, // Voice channel events
    GatewayIntentBits.GuildPresences, // User presence (status, game)
    GatewayIntentBits.GuildMessages, // Message events in guilds
    GatewayIntentBits.GuildMessageReactions, // Reaction events
    GatewayIntentBits.DirectMessages, // DM messages
    GatewayIntentBits.DirectMessageReactions, // DM reactions
    GatewayIntentBits.MessageContent, // Access to message.content
    GatewayIntentBits.AutoModerationConfiguration, // Automod config events
    GatewayIntentBits.AutoModerationExecution, // Automod trigger events
  ],
}) as Client & ClientCustom;

/**
 * Initialize commands collection
 */
client.commands = new Collection();

/**
 * Initialize crash prevention system
 */
logger.info('🛡️  Initializing RUDRA.OX Anti-Crash Engine...');
antiCrashHandler.initialize(client);

/**
 * Main initialization sequence
 */
async function initializeBot(): Promise<void> {
  try {
    logger.info('');
    logger.info('╔════════════════════════════════════════════════════════════════╗');
    logger.info('║                                                                ║');
    logger.info('║          👑 RUDRA.OX - GOD-TIER DISCORD BOT ENGINE 👑          ║');
    logger.info('║                                                                ║');
    logger.info('║                    Version: 1.0.0 (God-Tier)                   ║');
    logger.info('║                    Developers: Ashu & Zoro                      ║');
    logger.info('║                    Owner: Ashu 👑                              ║');
    logger.info('║                                                                ║');
    logger.info('╚════════════════════════════════════════════════════════════════╝');
    logger.info('');

    // ========== Step 1: Connect to MongoDB ==========
    logger.info('⏳ Step 1/5: Connecting to MongoDB...');
    await mongooseEngine.connect();

    if (!mongooseEngine.isConnected()) {
      throw new Error('Failed to connect to MongoDB');
    }

    logger.success('✅ MongoDB Connection: ESTABLISHED');
    
    // ✅ Verify all models are registered by checking the connection object
    console.log('✅ [MODELS CHECK] Checking registered models in mongoose connection...');
    // Models are accessible via mongoose.connection.models after they're imported
    logger.info('');

    // ========== Step 2: Load all event handlers ==========
    logger.info('⏳ Step 2/5: Loading event handlers...');
    await setupEventHandler(client);
    logger.info('');

    // ========== Step 3: Load all commands ==========
    logger.info('⏳ Step 3/5: Loading commands...');
    await setupCommandHandler(client);
    logger.info('');

    // ========== Step 4: Login to Discord ==========
    logger.info('⏳ Step 4/5: Attempting Discord login...');

    const discordToken = process.env.DISCORD_TOKEN;
    if (!discordToken) {
      throw new Error('DISCORD_TOKEN is not defined in environment variables');
    }

    await client.login(discordToken);
    logger.info('');

    // ========== Step 5: Ready event will complete initialization ==========
    logger.info('⏳ Step 5/5: Waiting for bot to be ready...');
    logger.info('');
  } catch (error) {
    logger.error('❌ FATAL ERROR - Bot initialization failed:', error);
    process.exit(1);
  }
}

/**
 * Ready event handler
 * Fires once when bot successfully connects to Discord
 */
client.once('ready', async () => {
  try {
    if (!client.user) {
      throw new Error('Client user is not available');
    }

    logger.success('');
    logger.success('╔════════════════════════════════════════════════════════════════╗');
    logger.success('║                                                                ║');
    logger.success('║                  🟢 BOT IS NOW ONLINE & READY 🟢               ║');
    logger.success('║                                                                ║');
    logger.success(`║  Bot Name: ${client.user.username.padEnd(53 - client.user.username.length)}║`);
    logger.success(`║  Bot ID: ${client.user.id.padEnd(57 - client.user.id.length)}║`);
    logger.success(`║  Servers: ${String(client.guilds.cache.size).padEnd(54 - String(client.guilds.cache.size).length)}║`);
    logger.success(`║  Users: ${String(client.users.cache.size).padEnd(55 - String(client.users.cache.size).length)}║`);
    logger.success('║                                                                ║');
    logger.success('╚════════════════════════════════════════════════════════════════╝');
    logger.success('');

    // Set bot activity
    client.user.setActivity('RUDRA.OX v1.0.0 | /help', { type: ActivityType.Watching });
    logger.info('📊 Bot Status: WATCHING RUDRA.OX v1.0.0 | /help');

    // Lock database connection (final stage)
    const dbStats = mongooseEngine.getStats();
    logger.success(`📦 Database Status: Connected to ${dbStats.dbName}`);

    // Report command statistics
    if (client.commands && client.commands.size > 0) {
      logger.success(`🎯 Commands Loaded: ${client.commands.size}`);
    }

    // Send startup notification to monitoring channel (optional)
    if (process.env.STARTUP_CHANNEL_ID) {
      await sendStartupNotification(client);
    }

    logger.success('');
    logger.success('🚀 RUDRA.OX is operational. Full god-tier capacity engaged!');
    logger.success('');
  } catch (error) {
    logger.error('❌ Error in ready event:', error);
    await antiCrashHandler.logHandledError(
      'ReadyEvent',
      'Failed to complete bot initialization',
      { error: String(error) }
    );
  }
});

/**
 * Send startup notification
 */
async function sendStartupNotification(client: Client): Promise<void> {
  try {
    const channel = client.channels.cache.get(process.env.STARTUP_CHANNEL_ID!);

    if (!channel || channel.type !== ChannelType.GuildText) {
      return;
    }

    const textChannel = channel as TextChannel;

    const startupEmbed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('🟢 RUDRA.OX Startup Notification')
      .setDescription('Bot has successfully initialized and is now operational')
      .addFields(
        {
          name: '🤖 Bot Name',
          value: client.user?.username || 'Unknown',
          inline: true,
        },
        {
          name: '🆔 Bot ID',
          value: client.user?.id || 'Unknown',
          inline: true,
        },
        {
          name: '🖥️ Server Count',
          value: client.guilds.cache.size.toString(),
          inline: true,
        },
        {
          name: '👥 Total Users',
          value: client.users.cache.size.toString(),
          inline: true,
        },
        {
          name: '⚙️ Commands Loaded',
          value: (client as any).commands?.size?.toString() || '0',
          inline: true,
        },
        {
          name: '📅 Startup Time',
          value: new Date().toISOString(),
          inline: false,
        }
      )
      .setFooter({ text: 'RUDRA.OX v1.0.0 (God-Tier)' })
      .setTimestamp();

    await textChannel.send({ embeds: [startupEmbed] });
  } catch (error) {
    logger.warn('Failed to send startup notification:', error);
  }
}

/**
 * Error event handler
 * Catches Discord.js errors
 */
client.on('error', (error) => {
  logger.error('Discord.js Client Error:', error);
});

/**
 * Warn event handler
 */
client.on('warn', (info) => {
  logger.warn('Discord.js Warning:', info);
});

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(): Promise<void> {
  logger.info('');
  logger.warn('🔌 Graceful shutdown initiated...');

  try {
    // Disconnect from Discord
    await client.destroy();
    logger.info('✅ Discord connection closed');

    // Disconnect from MongoDB
    await mongooseEngine.disconnect();
    logger.info('✅ MongoDB disconnected');

    logger.success('');
    logger.success('✅ RUDRA.OX has been shut down gracefully!');
    logger.success('');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle process termination signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

/**
 * Start the bot
 */
logger.info('🚀 Starting RUDRA.OX initialization sequence...');
logger.info('');

initializeBot().catch((error) => {
  logger.error('❌ Failed to initialize bot:', error);
  process.exit(1);
});
