import {
  AuditLogEvent,
  Guild,
  User,
  PartialUser,
  GuildAuditLogsEntry,
  Client,
} from 'discord.js';
import { logger } from '../utils/logger.js';

/**
 * RUDRA.OX ULTIMATE ANTINUKE EVENT LISTENER
 * Monitors server for unauthorized admin actions 24/7
 * 29-Trigger Protection Matrix
 * Version: 2.0.0 (God-Tier Security Engine)
 * Authors: Ashu & Zoro
 */

// ========== BAN & LOG UTILITIES ==========
async function banExecutor(
  guild: Guild,
  executor: User | PartialUser | null,
  reason: string
): Promise<boolean> {
  if (!executor) {
    logger.warn('⚠️ Cannot ban null executor');
   return false;
  }

  try {
    await guild.bans.create(executor.id, {
      reason: `RUDRA Antinuke: ${reason}`,
    });
    logger.info(
      `🔨 BANNED: ${executor.username} (${executor.id})`
    );
    return true;
  } catch (error) {
    logger.error(`❌ Failed to ban ${executor.username}:`, error);
    return false;
  }
}

async function logAction(
  guild: Guild,
  action: string,
  executor: User | PartialUser | null,
  details: string
): Promise<void> {
  try {
    logger.warn(`🚨 ANTINUKE [${action}] - ${details}`);
    logger.warn(
      `   Executor: ${executor?.username} (${executor?.id})`
    );
    logger.warn(`   Guild: ${guild.name} (${guild.id})`);
  } catch (error) {
    logger.error('Error logging antinuke action:', error);
  }
}

// ========== SIMPLIFIED TRIGGER HANDLERS ==========

async function handleChannelDelete(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Channel deletion');
  await logAction(guild, 'ChannelDelete', executor, 'Unauthorized channel deletion detected');
}

async function handleChannelCreate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized channel creation');
  await logAction(guild, 'ChannelCreate', executor, 'Unauthorized channel creation detected');
}

async function handleChannelUpdate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized channel modification');
  await logAction(guild, 'ChannelUpdate', executor, 'Unauthorized channel modification detected');
}

async function handleRoleDelete(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Role deletion');
  await logAction(guild, 'RoleDelete', executor, 'Unauthorized role deletion detected');
}

async function handleRoleCreate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized role creation');
  await logAction(guild, 'RoleCreate', executor, 'Unauthorized role creation detected');
}

async function handleRoleUpdate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized role modification');
  await logAction(guild, 'RoleUpdate', executor, 'Unauthorized role modification detected');
}

async function handleMemberBanAdd(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized member ban');
  await logAction(guild, 'MemberBanAdd', executor, 'Unauthorized member ban detected');
}

async function handleMemberKick(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized member kick');
  await logAction(guild, 'MemberKick', executor, 'Unauthorized member kick detected');
}

async function handleMemberRoleUpdate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized member role modification');
  await logAction(guild, 'MemberRoleUpdate', executor, 'Unauthorized role assignment detected');
}

async function handleMemberUpdate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized member modification');
  await logAction(guild, 'MemberUpdate', executor, 'Unauthorized member modification detected');
}

async function handleWebhookCreate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized webhook creation');
  await logAction(guild, 'WebhookCreate', executor, 'Unauthorized webhook creation detected');
}

async function handleWebhookDelete(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Webhook deletion');
  await logAction(guild, 'WebhookDelete', executor, 'Webhook deletion detected');
}

async function handleWebhookUpdate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized webhook modification');
  await logAction(guild, 'WebhookUpdate', executor, 'Unauthorized webhook modification detected');
}

async function handleGuildUpdate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized guild modification');
  await logAction(guild, 'GuildUpdate', executor, 'Unauthorized guild settings modification detected');
}

async function handleBotAdd(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized bot addition');
  await logAction(guild, 'BotAdd', executor, 'Unauthorized bot added to server');
}

async function handleEmojiCreate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized emoji creation');
  await logAction(guild, 'EmojiCreate', executor, 'Unauthorized emoji creation detected');
}

async function handleEmojiDelete(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Emoji deletion');
  await logAction(guild, 'EmojiDelete', executor, 'Emoji deletion detected');
}

async function handleEmojiUpdate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized emoji modification');
  await logAction(guild, 'EmojiUpdate', executor, 'Unauthorized emoji modification detected');
}

async function handleStickerCreate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized sticker creation');
  await logAction(guild, 'StickerCreate', executor, 'Unauthorized sticker creation detected');
}

async function handleStickerDelete(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Sticker deletion');
  await logAction(guild, 'StickerDelete', executor, 'Sticker deletion detected');
}

async function handleStickerUpdate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized sticker modification');
  await logAction(guild, 'StickerUpdate', executor, 'Unauthorized sticker modification detected');
}

async function handleInviteCreate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized invite creation');
  await logAction(guild, 'InviteCreate', executor, 'Unauthorized invite creation detected');
}

async function handleInviteDelete(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Invite deletion');
  await logAction(guild, 'InviteDelete', executor, 'Invite deletion detected');
}

async function handleIntegrationCreate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized integration creation');
  await logAction(guild, 'IntegrationCreate', executor, 'Unauthorized integration creation detected');
}

async function handleIntegrationDelete(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Integration deletion');
  await logAction(guild, 'IntegrationDelete', executor, 'Integration deletion detected');
}

async function handleIntegrationUpdate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized integration modification');
  await logAction(guild, 'IntegrationUpdate', executor, 'Unauthorized integration modification detected');
}

async function handleMemberPrune(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized member prune');
  await logAction(guild, 'MemberPrune', executor, 'Unauthorized member prune detected');
}

async function handleStageInstanceCreate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized stage instance creation');
  await logAction(guild, 'StageInstanceCreate', executor, 'Unauthorized stage instance creation detected');
}

async function handleStageInstanceDelete(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Stage instance deletion');
  await logAction(guild, 'StageInstanceDelete', executor, 'Stage instance deletion detected');
}

async function handleStageInstanceUpdate(guild: Guild, executor: User | PartialUser | null): Promise<void> {
  await banExecutor(guild, executor, 'Unauthorized stage instance modification');
  await logAction(guild, 'StageInstanceUpdate', executor, 'Unauthorized stage instance modification detected');
}

// ========== MAIN EVENT HANDLER ==========
export async function guildAuditLogEntryCreateHandler(
  entry: GuildAuditLogsEntry,
  guild: Guild,
  client: Client
): Promise<void> {
  try {
    const executor = entry.executor;

    // ========== STEP 1: SKIP IF EXECUTOR IS BOT ==========
    if (executor?.id === client.user?.id) {
      logger.debug(`✅ Action by bot itself - skipping: ${entry.action}`);
      return;
    }

    // ========== STEP 2: FETCH ANTINUKE CONFIG ==========
    let config: any = null;
    try {
      const { default: mongoose } = await import('mongoose');
      const db = mongoose.connection;

      if (db.models['Antinuke']) {
        const AntinukeModel = db.models['Antinuke'];
        config = await AntinukeModel.findOne({ guildId: guild.id });
      }
    } catch (dbError) {
      logger.error('❌ Failed to fetch Antinuke config:', dbError);
      return;
    }

    if (!config || !config.enabled) {
      logger.debug(`⚠️ Antinuke not enabled for ${guild.name}`);
      return;
    }

    // ========== STEP 3: WHITELIST CHECK ==========
    const isGuildOwner = executor?.id === guild.ownerId;
    const isAbsoluteOwner = executor?.id === process.env.OWNER_ID;
    const isWhitelisted = config.whitelistedUsers?.includes(executor?.id || '');

    if (isGuildOwner || isAbsoluteOwner || isWhitelisted) {
      logger.info(`✅ Whitelisted user ${executor?.username} executing: ${entry.action}`);
      return;
    }

    // ========== STEP 4: PROCESS ACTION ==========
    logger.warn(`⚠️ UNAUTHORIZED: ${entry.action} by ${executor?.username}`);

    switch (entry.action) {
      case AuditLogEvent.ChannelDelete:
        await handleChannelDelete(guild, executor);
        break;
      case AuditLogEvent.ChannelCreate:
        await handleChannelCreate(guild, executor);
        break;
      case AuditLogEvent.ChannelUpdate:
        await handleChannelUpdate(guild, executor);
        break;
      case AuditLogEvent.RoleDelete:
        await handleRoleDelete(guild, executor);
        break;
      case AuditLogEvent.RoleCreate:
        await handleRoleCreate(guild, executor);
        break;
      case AuditLogEvent.RoleUpdate:
        await handleRoleUpdate(guild, executor);
        break;
      case AuditLogEvent.MemberBanAdd:
        await handleMemberBanAdd(guild, executor);
        break;
      case AuditLogEvent.MemberKick:
        await handleMemberKick(guild, executor);
        break;
      case AuditLogEvent.MemberRoleUpdate:
        await handleMemberRoleUpdate(guild, executor);
        break;
      case AuditLogEvent.MemberUpdate:
        await handleMemberUpdate(guild, executor);
        break;
      case AuditLogEvent.WebhookCreate:
        await handleWebhookCreate(guild, executor);
        break;
      case AuditLogEvent.WebhookDelete:
        await handleWebhookDelete(guild, executor);
        break;
      case AuditLogEvent.WebhookUpdate:
        await handleWebhookUpdate(guild, executor);
        break;
      case AuditLogEvent.GuildUpdate:
        await handleGuildUpdate(guild, executor);
        break;
      case AuditLogEvent.BotAdd:
        await handleBotAdd(guild, executor);
        break;
      case AuditLogEvent.EmojiCreate:
        await handleEmojiCreate(guild, executor);
        break;
      case AuditLogEvent.EmojiDelete:
        await handleEmojiDelete(guild, executor);
        break;
      case AuditLogEvent.EmojiUpdate:
        await handleEmojiUpdate(guild, executor);
        break;
      case AuditLogEvent.StickerCreate:
        await handleStickerCreate(guild, executor);
        break;
      case AuditLogEvent.StickerDelete:
        await handleStickerDelete(guild, executor);
        break;
      case AuditLogEvent.StickerUpdate:
        await handleStickerUpdate(guild, executor);
        break;
      case AuditLogEvent.InviteCreate:
        await handleInviteCreate(guild, executor);
        break;
      case AuditLogEvent.InviteDelete:
        await handleInviteDelete(guild, executor);
        break;
      case AuditLogEvent.IntegrationCreate:
        await handleIntegrationCreate(guild, executor);
        break;
      case AuditLogEvent.IntegrationDelete:
        await handleIntegrationDelete(guild, executor);
        break;
      case AuditLogEvent.IntegrationUpdate:
        await handleIntegrationUpdate(guild, executor);
        break;
      case AuditLogEvent.MemberPrune:
        await handleMemberPrune(guild, executor);
        break;
      case AuditLogEvent.StageInstanceCreate:
        await handleStageInstanceCreate(guild, executor);
        break;
      case AuditLogEvent.StageInstanceDelete:
        await handleStageInstanceDelete(guild, executor);
        break;
      case AuditLogEvent.StageInstanceUpdate:
        await handleStageInstanceUpdate(guild, executor);
        break;
      default:
        logger.debug(`⏭️ Unhandled: ${entry.action}`);
    }
  } catch (error) {
    console.error('[GUILDAUDITLOGENTRYCREATE ERROR]:', error);
    logger.error('❌ Antinuke Event Handler Error:', error);
  }
}

export default {
  name: 'guildAuditLogEntryCreate',
  async execute(entry: GuildAuditLogsEntry, client: Client) {
    await guildAuditLogEntryCreateHandler(entry, client.guilds.cache.first()!, client);
  },
};
