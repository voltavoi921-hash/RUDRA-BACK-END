import { VoiceState, Client } from 'discord.js';
import { logger } from '../utils/logger.js';

/**
 * EXAMPLE EVENT: voiceStateUpdate
 * Fires when voice state changes (joining, leaving, moving VCs, mute/deafen)
 *
 * Event file location: src/events/voiceStateUpdate.ts
 * This is used for the Join-to-Create (JTC) voice channel engine
 */

export default {
  name: 'voiceStateUpdate',
  once: false, // Fires every time voice state changes

  /**
   * Execute event handler
   */
  async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
    try {
      // User joined a voice channel
      if (!oldState.channel && newState.channel) {
        await handleVoiceJoin(newState);
      }

      // User left a voice channel
      else if (oldState.channel && !newState.channel) {
        await handleVoiceLeave(oldState);
      }

      // User moved between voice channels
      else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
        await handleVoiceMove(oldState, newState);
      }

      // User muted/unmuted (but stayed in same VC)
      else if (oldState.mute !== newState.mute) {
        logger.debug(`${newState.member?.user.username} ${newState.mute ? 'muted' : 'unmuted'}`);
      }

      // User deafened/undeafened (but stayed in same VC)
      else if (oldState.deaf !== newState.deaf) {
        logger.debug(
          `${newState.member?.user.username} ${newState.deaf ? 'deafened' : 'undeafened'}`
        );
      }
    } catch (error) {
      logger.error('Error in voiceStateUpdate event:', error);
    }
  },
};

/**
 * Handle user joining a voice channel
 */
async function handleVoiceJoin(state: VoiceState): Promise<void> {
  const { member, channel } = state;

  if (!member || !channel) return;

  logger.info(`👤 ${member.user.username} joined voice channel: #${channel.name}`);

  // Future: Check if this is a Join-to-Create master channel
  // If yes: Create a new private VC for the user
  // Example:
  // if (channel.id === MASTER_CHANNEL_ID) {
  //   const newVC = await createPrivateVC(member, guild);
  //   await member.voice.setChannel(newVC);
  // }
}

/**
 * Handle user leaving a voice channel
 */
async function handleVoiceLeave(state: VoiceState): Promise<void> {
  const { member, channel } = state;

  if (!member || !channel) return;

  logger.info(`👤 ${member.user.username} left voice channel: #${channel.name}`);

  // Future: Check if this is a custom VC created by JTC
  // If yes and channel is empty: Delete the VC
  // Example:
  // if (isCustomVC(channel.id)) {
  //   if (channel.members.size === 0) {
  //     await channel.delete('JTC channel is empty');
  //   }
  // }
}

/**
 * Handle user moving between voice channels
 */
async function handleVoiceMove(oldState: VoiceState, newState: VoiceState): Promise<void> {
  const { member } = newState;
  const oldChannel = oldState.channel;
  const newChannel = newState.channel;

  if (!member || !oldChannel || !newChannel) return;

  logger.info(
    `👤 ${member.user.username} moved from #${oldChannel.name} to #${newChannel.name}`
  );

  // Future: Handle JTC logic when moving channels
}
