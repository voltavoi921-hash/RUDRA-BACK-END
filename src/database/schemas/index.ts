import mongoose, { Schema, Document } from 'mongoose';
import { Antinuke, IAntinuke } from './AntinukeSchema.js';

/**
 * VIP SCHEMA
 * The Power Hierarchy - Stores VIP user information
 * Ashu is hardcoded as 'OWNER' for instant verification
 */
export interface IVIP extends Document {
  userId: string;
  tier: 'VIP' | 'VIP_PRTR' | 'OWNER';
  grantedBy?: string;
  expiresAt?: Date;
  createdAt: Date;
}

const VIPSchema = new Schema<IVIP>({
  userId: { type: String, required: true, unique: true, index: true },
  tier: { type: String, enum: ['VIP', 'VIP_PRTR', 'OWNER'], required: true },
  grantedBy: { type: String, default: null },
  expiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Auto-expire VIP status
VIPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const VIP = mongoose.model('VIP', VIPSchema);

/**
 * GUILD CONFIG SCHEMA
 * Server Settings - Stores per-guild configuration
 */
export interface IGuildConfig extends Document {
  guildId: string;
  prefix: string;
  antinukeConfig: Record<string, boolean>;
  whitelistedUsers: string[];
  logChannels: {
    modLogs?: string;
    vcLogs?: string;
    messageLogs?: string;
  };
  updatedAt: Date;
}

const GuildConfigSchema = new Schema<IGuildConfig>({
  guildId: { type: String, required: true, unique: true, index: true },
  prefix: { type: String, default: '+' },
  antinukeConfig: { type: Schema.Types.Mixed, default: {} },
  whitelistedUsers: [{ type: String }],
  logChannels: {
    modLogs: String,
    vcLogs: String,
    messageLogs: String,
  },
  updatedAt: { type: Date, default: Date.now },
});

export const GuildConfig = mongoose.model('GuildConfig', GuildConfigSchema);

/**
 * VOICE SETUP SCHEMA
 * Join-to-Create Engine - Manages custom voice channels
 */
export interface IVoiceSetup extends Document {
  guildId: string;
  masterChannelId: string;
  categoryId: string;
  activeVCs: Array<{
    ownerId: string;
    channelId: string;
    createdAt: Date;
  }>;
  updatedAt: Date;
}

const VoiceSetupSchema = new Schema<IVoiceSetup>({
  guildId: { type: String, required: true, unique: true, index: true },
  masterChannelId: { type: String, required: true },
  categoryId: { type: String, required: true },
  activeVCs: [
    {
      ownerId: String,
      channelId: { type: String, index: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

export const VoiceSetup = mongoose.model('VoiceSetup', VoiceSetupSchema);

/**
 * TICKET PANEL SCHEMA
 * Support System - Manages ticket creation and configuration
 */
export interface ITicketPanel extends Document {
  guildId: string;
  messageId: string;
  categoryId: string;
  supportRoleId: string;
  cooldowns: Map<string, Date>;
  updatedAt: Date;
}

const TicketPanelSchema = new Schema<ITicketPanel>({
  guildId: { type: String, required: true, unique: true, index: true },
  messageId: { type: String, required: true },
  categoryId: { type: String, required: true },
  supportRoleId: { type: String, required: true },
  cooldowns: { type: Map, of: Date, default: new Map() },
  updatedAt: { type: Date, default: Date.now },
});

export const TicketPanel = mongoose.model('TicketPanel', TicketPanelSchema);

/**
 * USER ECONOMY SCHEMA
 * Tracks user XP, leveling, and currency
 */
export interface IUserEconomy extends Document {
  userId: string;
  guildId: string;
  xp: number;
  level: number;
  wallet: number;
  bank: number;
  updatedAt: Date;
}

const UserEconomySchema = new Schema<IUserEconomy>({
  userId: { type: String, required: true, index: true },
  guildId: { type: String, required: true, index: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  wallet: { type: Number, default: 0 },
  bank: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index for fast queries
UserEconomySchema.index({ guildId: 1, userId: 1 });

export const UserEconomy = mongoose.model('UserEconomy', UserEconomySchema);

/**
 * USER STRIKES SCHEMA
 * Automod strike tracking for punishment escalation
 */
export interface IUserStrikes extends Document {
  userId: string;
  guildId: string;
  strikes: number;
  lastStrikeAt: Date;
  reason?: string;
  updatedAt: Date;
}

const UserStrikesSchema = new Schema<IUserStrikes>({
  userId: { type: String, required: true, index: true },
  guildId: { type: String, required: true, index: true },
  strikes: { type: Number, default: 0 },
  lastStrikeAt: { type: Date, default: Date.now },
  reason: String,
  updatedAt: { type: Date, default: Date.now },
});

UserStrikesSchema.index({ guildId: 1, userId: 1 });

export const UserStrikes = mongoose.model('UserStrikes', UserStrikesSchema);

/**
 * GIVEAWAY SCHEMA
 * Tracks active and completed giveaways
 */
export interface IGiveaway extends Document {
  guildId: string;
  messageId: string;
  channelId: string;
  prize: string;
  endTime: Date;
  winnersCount: number;
  winners: string[];
  requirements?: {
    roleId?: string;
    minimumLevel?: number;
  };
  createdAt: Date;
}

const GiveawaySchema = new Schema<IGiveaway>({
  guildId: { type: String, required: true, index: true },
  messageId: { type: String, required: true },
  channelId: { type: String, required: true },
  prize: { type: String, required: true },
  endTime: { type: Date, required: true, index: true },
  winnersCount: { type: Number, required: true },
  winners: [String],
  requirements: {
    roleId: String,
    minimumLevel: Number,
  },
  createdAt: { type: Date, default: Date.now },
});

// TTL index: Auto-delete giveaways 24 hours after they end
GiveawaySchema.index({ endTime: 1 }, { expireAfterSeconds: 86400 });

export const Giveaway = mongoose.model('Giveaway', GiveawaySchema);

// Export Antinuke model and interface
export { Antinuke, IAntinuke };
