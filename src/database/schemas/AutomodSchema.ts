import mongoose, { Schema, Document } from 'mongoose';

/**
 * RUDRA.OX AUTOMOD SCHEMA
 * Stores automod & AI filter configuration for each guild
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export interface IAutomod extends Document {
  guildId: string;
  enabled: boolean;
  badWords: string[];
  filters: {
    spam: boolean;
    caps: boolean;
    links: boolean;
    invites: boolean;
    phishing: boolean;
    mentions: boolean;
    nsfw: boolean;
  };
  actions: {
    deleteMessage: boolean;
    muteUser: boolean;
    kickUser: boolean;
    warnUser: boolean;
  };
  muteDuration: number; // in minutes
  maxWarnings: number;
  createdAt: Date;
  updatedAt: Date;
}

const AutomodSchema = new Schema<IAutomod>(
  {
    guildId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    badWords: {
      type: [String],
      default: [],
    },
    filters: {
      spam: {
        type: Boolean,
        default: false,
      },
      caps: {
        type: Boolean,
        default: false,
      },
      links: {
        type: Boolean,
        default: false,
      },
      invites: {
        type: Boolean,
        default: false,
      },
      phishing: {
        type: Boolean,
        default: false,
      },
      mentions: {
        type: Boolean,
        default: false,
      },
      nsfw: {
        type: Boolean,
        default: false,
      },
    },
    actions: {
      deleteMessage: {
        type: Boolean,
        default: true,
      },
      muteUser: {
        type: Boolean,
        default: false,
      },
      kickUser: {
        type: Boolean,
        default: false,
      },
      warnUser: {
        type: Boolean,
        default: true,
      },
    },
    muteDuration: {
      type: Number,
      default: 5, // 5 minutes by default
    },
    maxWarnings: {
      type: Number,
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);

// Create or retrieve the model
const AutomodModel =
  mongoose.models.Automod || mongoose.model<IAutomod>('Automod', AutomodSchema);

export default AutomodModel;
