export interface RssFeed {
  name: string;
  url: string;
  type: 'live' | 'rss' | 'playlist';
  cors?: boolean;
  playlist?: { title: string; url: string; author?: string }[];
}

// Optionally set a CORS proxy prefix if your browser blocks cross-origin RSS fetches
// Preferred CORS proxy
export const corsProxy: string | null = 'https://corsproxy.io/?url=';

import { pirateLiveFeeds, piratePlaylistFeed } from './pirateStations';

export const rssFeeds: RssFeed[] = [
  // Cashmere Radio: use direct live stream
  { name: 'Cashmere Radio (Live)', url: 'https://cashmereradio.out.airtime.pro/cashmereradio_a', type: 'live' },
  { name: 'Rebel Beat', url: 'https://feeds.feedburner.com/RebelBeatRadioPodcasts', type: 'rss', cors: true },
//   { name: 'DIY Conspiracy', url: 'https://diyconspiracy.net/feed/', type: 'rss', cors: true },
  { name: 'Punkirratia (Live)', url: 'https://punkirratia.net:8443/punk', type: 'live' },
  // Brooklyn Pirate Radio Map aggregated playlist
  piratePlaylistFeed,
  // Pirate Radio Map live stations (generated from JSON)
  ...pirateLiveFeeds,
];

// Additional proxies disabled; using corsproxy.io per preference
export const corsProxies: string[] = [];


