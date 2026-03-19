import { VoiceState, VoiceChannel } from 'discord.js';
import { logger } from '../utils/logger.js';

/**
 * VOICE STATE UPDATE EVENT
 * Handles Join-to-Create (JTC) voice channel creation and cleanup.
 *
 * This listens for users joining the configured master channel and
 * automatically creates a temporary voice channel for them.
 * It also deletes empty temporary channels when they become unused.
 */

export default {
  name: 'voiceStateUpdate',
  once: false,

  async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
    try {
      // User joined a voice channel
      if (!oldState.channel && newState.channel) {
        await handleVoiceJoin(newState);
        return;
      }

      // User left a voice channel
      if (oldState.channel && !newState.channel) {
        await handleVoiceLeave(oldState);
        return;
      }

      // User moved between voice channels
      if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
        // Handle leaving old channel
        await handleVoiceLeave(oldState);
        // Handle joining new channel
        await handleVoiceJoin(newState);
        return;
      }

      // Mute/unmute or deaf/undeaf handled elsewhere or not relevant for JTC
    } catch (error) {
      logger.error('Error in voiceStateUpdate event:', error);
    }
  },
};

/**
 * Determine if a voice channel is a JTC-generated temporary channel
 */
async function isJTCChannel(channelId: string, guildId: string): Promise<boolean> {
  try {
    const { default: mongoose } = await import('mongoose');
    const db = mongoose.connection;
    if (!db.models['VoiceSetup']) return false;

    const VoiceSetupModel = db.models['VoiceSetup'];
    const setup = (await VoiceSetupModel.findOne({ guildId }).lean()) as any;
    return Boolean(setup?.activeVCs?.find((vc: any) => vc.channelId === channelId));
  } catch (error) {
    logger.warn('⚠️ Failed to check JTC channel status:', error);
    return false;
  }
}

/**
 * Handle user joining a voice channel
 */
async function handleVoiceJoin(state: VoiceState): Promise<void> {
  const { member, channel } = state;
  if (!member || !channel || !channel.guild) return;

  logger.info(`👤 ${member.user.tag} joined voice channel: #${channel.name}`);

  try {
    const { default: mongoose } = await import('mongoose');
    const db = mongoose.connection;
    if (!db.models['VoiceSetup']) return;

    const VoiceSetupModel = db.models['VoiceSetup'];
    const setup = await VoiceSetupModel.findOne({ guildId: channel.guild.id });
    if (!setup) return; // JTC not configured

    // Only trigger when joining the master channel
    if (channel.id !== setup.masterChannelId) return;

    // Create a temporary voice channel for the user
    const newChannel = await channel.guild.channels.create({
      name: `🎙️ ${member.user.username}`,
      type: 2, // GuildVoice
      parent: setup.categoryId || undefined,
      permissionOverwrites: [
        {
          id: channel.guild.roles.everyone,
          allow: ['Connect', 'ViewChannel'],
        },
        {
          id: member.user.id,
          allow: ['Connect', 'Speak', 'MuteMembers', 'DeafenMembers', 'MoveMembers'],
        },
      ],
    });

    // Move the user into the newly created channel
    await member.voice.setChannel(newChannel as unknown as VoiceChannel);

    // Track the temporary channel in the database
    setup.activeVCs = setup.activeVCs || [];
    setup.activeVCs.push({
      ownerId: member.user.id,
      channelId: newChannel.id,
      createdAt: new Date(),
    });
    await setup.save();

    logger.info(`✅ Created JTC channel ${newChannel.name} for ${member.user.tag}`);
  } catch (error) {
    logger.error('❌ Error creating JTC channel:', error);
  }
}

/**
 * Handle user leaving a voice channel
 */
async function handleVoiceLeave(state: VoiceState): Promise<void> {
  const { member, channel } = state;
  if (!member || !channel || !channel.guild) return;

  logger.info(`👤 ${member.user.tag} left voice channel: #${channel.name}`);

  try {
    const { default: mongoose } = await import('mongoose');
    const db = mongoose.connection;
    if (!db.models['VoiceSetup']) return;

    const VoiceSetupModel = db.models['VoiceSetup'];
    const setup = await VoiceSetupModel.findOne({ guildId: channel.guild.id });
    if (!setup) return;

    const isTemp = await isJTCChannel(channel.id, channel.guild.id);
    if (!isTemp) return;

    // If channel is empty, delete it and remove from activeVCs
    if (channel.members.size === 0) {
      try {
        await channel.delete('JTC temporary channel empty');
        setup.activeVCs = setup.activeVCs.filter(
          (vc: any) => vc.channelId !== channel.id
        );
        await setup.save();
        logger.info(`🗑️ Deleted empty JTC channel: ${channel.name}`);
      } catch (deleteError) {
        logger.warn('⚠️ Failed to delete empty JTC channel:', deleteError);
      }
    }
  } catch (error) {
    logger.error('❌ Error handling JTC leave event:', error);
  }
}
