import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  DiscordGatewayAdapterCreator,
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import ytdl from 'ytdl-core';
import yts from 'yt-search';

export type Track = {
  title: string;
  url: string;
  requestedBy: string;
};

const queue = new Map<string, Track[]>();
const players = new Map<string, AudioPlayer>();
const connections = new Map<string, VoiceConnection>();
const volumes = new Map<string, number>();

const DEFAULT_VOLUME = 0.15;

/**
 * Create or reuse a voice connection for a guild.
 */
async function getConnection(guildId: string, adapterCreator: DiscordGatewayAdapterCreator, channelId: string): Promise<VoiceConnection> {
  let connection = getVoiceConnection(guildId);
  if (!connection) {
    connection = joinVoiceChannel({
      channelId,
      guildId,
      adapterCreator,
      selfDeaf: false,
      selfMute: false,
    });

    connections.set(guildId, connection);

    connection.on('stateChange', (oldState, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        // Clean up on disconnect
        connection?.destroy();
        connections.delete(guildId);
        players.delete(guildId);
        queue.delete(guildId);
      }

      if (newState.status === VoiceConnectionStatus.Destroyed) {
        connections.delete(guildId);
        players.delete(guildId);
        queue.delete(guildId);
      }
    });

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
    } catch (error) {
      connection.destroy();
      connections.delete(guildId);
      throw error;
    }
  }

  return connection;
}

function getPlayer(guildId: string): AudioPlayer {
  let player = players.get(guildId);
  if (!player) {
    player = createAudioPlayer();
    players.set(guildId, player);

    player.on(AudioPlayerStatus.Idle, () => {
      // Play next track in queue
      playNext(guildId);
    });

    player.on('error', (error) => {
      console.error(`Music player error for guild ${guildId}:`, error);
      playNext(guildId);
    });
  }
  return player;
}

function setVolume(guildId: string, value: number) {
  volumes.set(guildId, value);
}

function getVolume(guildId: string): number {
  return volumes.get(guildId) ?? DEFAULT_VOLUME;
}

async function createResource(url: string, guildId: string): Promise<AudioResource> {
  const stream = ytdl(url, {
    quality: 'highestaudio',
    filter: 'audioonly',
    highWaterMark: 1 << 25,
  });

  const resource = createAudioResource(stream, {
    inputType: (stream as any).type ?? undefined,
    inlineVolume: true,
  });

  resource.volume?.setVolume(getVolume(guildId));
  return resource;
}

export async function resolveTrack(query: string, requestedBy: string): Promise<Track> {
  // If query looks like a YouTube URL, use it directly
  const urlMatch = query.match(/(https?:\/\/(www\.)?youtube\.com\/watch\?v=|https?:\/\/(www\.)?youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (urlMatch) {
    const url = query;
    let title = url;
    try {
      const info = await ytdl.getInfo(url);
      title = info.videoDetails.title;
    } catch {
      // ignore
    }
    return { title, url, requestedBy };
  }

  // Search on YouTube
  const searchResult = await yts(query);
  const first = searchResult.videos?.[0];
  if (!first) {
    throw new Error('No results found');
  }

  return { title: first.title, url: first.url, requestedBy };
}

export async function enqueueTrack(
  guildId: string,
  adapterCreator: DiscordGatewayAdapterCreator,
  channelId: string,
  track: Track
): Promise<void> {
  const guildQueue = queue.get(guildId) || [];
  guildQueue.push(track);
  queue.set(guildId, guildQueue);

  // Start playing if nothing is playing
  const player = getPlayer(guildId);
  if (player.state.status === AudioPlayerStatus.Idle) {
    await playNext(guildId, adapterCreator, channelId);
  }
}

export async function playNext(
  guildId: string,
  adapterCreator?: DiscordGatewayAdapterCreator,
  channelId?: string
): Promise<void> {
  const guildQueue = queue.get(guildId) || [];
  const nextTrack = guildQueue.shift();

  if (!nextTrack) {
    // Nothing left - disconnect
    const connection = getVoiceConnection(guildId);
    if (connection) {
      connection?.destroy();
    }
    queue.delete(guildId);
    players.delete(guildId);
    return;
  }

  queue.set(guildId, guildQueue);

  if (!adapterCreator || !channelId) {
    // Can't ensure connection: stop playback
    return;
  }

  const connection = await getConnection(guildId, adapterCreator, channelId);
  const player = getPlayer(guildId);

  connection.subscribe(player);

  try {
    const resource = await createResource(nextTrack.url, guildId);
    player.play(resource);
  } catch (error) {
    console.error('Failed to play track:', error);
    // Try next track
    await playNext(guildId, adapterCreator, channelId);
  }
}

export function getQueue(guildId: string): Track[] {
  return queue.get(guildId) || [];
}

export function clearQueue(guildId: string): void {
  queue.set(guildId, []);
}

export function shuffleQueue(guildId: string): void {
  const guildQueue = queue.get(guildId);
  if (!guildQueue || guildQueue.length <= 1) return;

  for (let i = guildQueue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [guildQueue[i], guildQueue[j]] = [guildQueue[j], guildQueue[i]];
  }

  queue.set(guildId, guildQueue);
}

export function skip(guildId: string): void {
  const player = players.get(guildId);
  if (player) {
    player.stop();
  }
}

export function setGuildVolume(guildId: string, volume: number): void {
  setVolume(guildId, volume);
  const player = players.get(guildId);
  const currentState = player?.state as any;
  if (currentState?.resource?.volume) {
    currentState.resource.volume.setVolume(volume);
  }
}

export function getGuildVolume(guildId: string): number {
  return getVolume(guildId);
}
