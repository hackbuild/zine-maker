import type { RssFeed } from './rssFeeds';
import stations from './pirateStations.json';

export const PIRATE_AUDIO_BASE = 'https://map.pirateradiomap.com/audio/';

type UnknownRecord = Record<string, unknown>;

interface PirateSoundEntry { id?: string; filename?: string; url?: string }

function toStringSafe(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function extractStationName(obj: UnknownRecord): string {
  return (
    toStringSafe(obj['Station']) ||
    toStringSafe(obj['station']) ||
    toStringSafe(obj['name']) ||
    toStringSafe(obj['Name']) ||
    'Unknown Station'
  ).trim();
}

function extractFreq(obj: UnknownRecord): string {
  return (toStringSafe(obj['freq']) || toStringSafe(obj['frequency']) || '').trim();
}

function listSoundEntries(obj: UnknownRecord): PirateSoundEntry[] {
  const entries: PirateSoundEntry[] = [];
  for (const key of Object.keys(obj)) {
    if (!/^sound\d+/i.test(key)) continue;
    const value = obj[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object') entries.push(item as PirateSoundEntry);
      }
    } else if (value && typeof value === 'object') {
      entries.push(value as PirateSoundEntry);
    }
  }
  return entries;
}

export type PlaylistItem = { title: string; url: string; author?: string };

export function generatePiratePlaylist(allStations: unknown): PlaylistItem[] {
  const result: PlaylistItem[] = [];
  const arr: unknown[] = Array.isArray(allStations) ? allStations : [];
  for (const entry of arr) {
    if (!entry || typeof entry !== 'object') continue;
    const rec = entry as UnknownRecord;
    const station = extractStationName(rec);
    const freq = extractFreq(rec);
    const sounds = listSoundEntries(rec);
    for (const s of sounds) {
      const id = toStringSafe(s.id);
      if (!id) continue;
      const filename = toStringSafe(s.filename, id + '.mp3');
      const url = `${PIRATE_AUDIO_BASE}${id}.mp3`;
      const stationPart = freq ? `${station} (${freq})` : station;
      const title = `${stationPart} · ${filename}`;
      result.push({ title, url });
    }
  }
  return result;
}

// Build a single playlist feed from all pirate stations
export const piratePlaylist = generatePiratePlaylist(stations);

export const piratePlaylistFeed: RssFeed = {
  name: 'Brooklyn Pirate Radio Map',
  url: '',
  type: 'playlist',
  cors: true,
  playlist: piratePlaylist,
};

// Also expose individual stations as simple live feeds if someone prefers them
export const pirateLiveFeeds: RssFeed[] = [];


