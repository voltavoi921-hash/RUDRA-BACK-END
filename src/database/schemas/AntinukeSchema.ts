import mongoose, { Schema, Document } from 'mongoose';

/**
 * ANTINUKE SCHEMA
 * Enterprise-grade security and raid protection for servers
 * The fortress against unauthorized admin actions
 */
export interface IAntinuke extends Document {
  guildId: string;
  enabled: boolean;
  whitelistedUsers: string[];
  features: {
    antiBan: boolean;
    antiKick: boolean;
    antiChannel: boolean;
    antiRole: boolean;
    antiBot: boolean;
  };
  protectedRoles: string[];
  antiInvite: boolean;
  antiRaid: boolean;
  actionRateLimit: number;
  antiWebhook: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AntinukeSchema = new Schema<IAntinuke>({
  guildId: { type: String, required: true, unique: true, index: true },
  enabled: { type: Boolean, default: false },
  whitelistedUsers: [{ type: String }],
  features: {
    antiBan: { type: Boolean, default: true },
    antiKick: { type: Boolean, default: true },
    antiChannel: { type: Boolean, default: true },
    antiRole: { type: Boolean, default: true },
    antiBot: { type: Boolean, default: true },
  },
  protectedRoles: [{ type: String }],
  antiInvite: { type: Boolean, default: false },
  antiRaid: { type: Boolean, default: false },
  actionRateLimit: { type: Number, default: 5 },
  antiWebhook: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-update the updatedAt field
AntinukeSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Antinuke = mongoose.model('Antinuke', AntinukeSchema);
