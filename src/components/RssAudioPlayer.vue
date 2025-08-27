<template>
  <div class="rss-player">
    <div class="controls">
      <button v-if="!isLive" class="btn-ctrl" @click="prev" :disabled="queue.length===0" aria-label="Previous" title="Previous">
        <SkipBack :size="14" />
      </button>
      <button class="btn-ctrl primary" @click="togglePlay" :disabled="!currentSrc" :aria-label="isPlaying ? 'Pause' : 'Play'" :title="isPlaying ? 'Pause' : 'Play'">
        <Pause v-if="isPlaying" :size="14" />
        <Play v-else :size="14" />
      </button>
      <button v-if="!isLive" class="btn-ctrl" @click="next" :disabled="queue.length===0" aria-label="Next" title="Next">
        <SkipForward :size="14" />
      </button>
    </div>
    <div class="display">
      <div class="marquee" :title="displayText">
        <span>{{ displayText }}</span>
      </div>
      <select class="feed-select" v-model="selectedFeedIndex" @change="loadFeed()" title="Select feed">
        <option v-for="(f,i) in feeds" :key="i" :value="i">{{ f.name }}</option>
      </select>
    </div>
    <audio ref="audioRef" :src="currentSrc || undefined" @ended="next" @error="onAudioError" preload="none" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, nextTick } from 'vue';
import { rssFeeds, corsProxy, type RssFeed } from '@/config/rssFeeds';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-vue-next';

type QueueItem = { title: string; author?: string; url: string };

const feeds = rssFeeds as RssFeed[];
const selectedFeedIndex = ref<number>(0);
const queue = ref<QueueItem[]>([]);
const currentIndex = ref<number>(0);
const isPlaying = ref(false);
const audioRef = ref<HTMLAudioElement | null>(null);

const currentTrack = computed(() => queue.value[currentIndex.value]);
const currentSrc = computed(() => currentTrack.value?.url || '');
const isLive = computed(() => feeds[selectedFeedIndex.value]?.type === 'live');
// no-op computed removed (unused)
const displayText = computed(() => {
  const f = feeds[selectedFeedIndex.value]?.name || '';
  const t = currentTrack.value?.title || '—';
  const a = currentTrack.value?.author ? ` · ${currentTrack.value.author}` : '';
  return `${f}: ${t}${a}`;
});

onMounted(async () => {
  await loadFeed();
});

function proxify(u: string, useCors: boolean): string {
  if (!useCors || !corsProxy) return u;
  try { return corsProxy + encodeURIComponent(u); } catch { return corsProxy + u; }
}

function shouldUseStrict(feed: RssFeed): boolean {
  // Rebel Beat: enclosure-only to avoid unrelated audio from descriptions
  return /rebel\s*beat/i.test(feed.name) || /rebelbeatradio/i.test(feed.url);
}

async function loadFeed() {
  isPlaying.value = false;
  currentIndex.value = 0;
  queue.value = [];
  const feed = feeds[selectedFeedIndex.value];
  if (!feed) return;
  // If feed is marked live or url looks like a direct stream, play it as a single source
  if (feed.type === 'live' || isDirectAudio(feed.url)) {
    const liveUrl = proxify(feed.url, !!feed.cors);
    queue.value = [{ title: feed.name, url: liveUrl }];
    nextTickPlay(false);
    return;
  }

  // Playlist feeds: consume provided items directly
  if (feed.type === 'playlist' && Array.isArray(feed.playlist)) {
    const q: QueueItem[] = [];
    for (const item of feed.playlist) {
      if (!item?.url) continue;
      const finalUrl = proxify(item.url, !!feed.cors);
      q.push({ title: item.title || feed.name, author: item.author, url: finalUrl });
    }
    queue.value = q;
    if (q.length) nextTickPlay(false);
    return;
  }

  const urlsToTry = [proxify(feed.url, !!feed.cors)];
  let xml: Document | null = null;
  for (const u of urlsToTry) {
    try {
      const res = await fetch(u);
      const text = await res.text();
      xml = new DOMParser().parseFromString(text, 'text/xml');
      if (xml) break;
    } catch {}
  }
  if (!xml) return;
  const items = Array.from(xml.querySelectorAll('item'));
  const q: QueueItem[] = [];
  for (const it of items) {
    const meta = getAudioFromItem(it, shouldUseStrict(feed));
    const url = meta?.url || null;
    const type = meta?.type || '';
    if (!url) continue;
    const finalUrl = proxify(url, !!feed.cors);
    const title = it.querySelector('title')?.textContent?.trim() || 'Untitled';
    const author = it.querySelector('itunes\\:author, author')?.textContent?.trim() || undefined;
    // Block obviously bad/unauthorized endpoints that some feeds emit (ex: Cashmere 400s)
    if (/cashmereradio\.airtime\.pro\/.+\/download\//.test(finalUrl)) continue;
    // Only accept audio mime or common extensions
    if (!(type && /audio\//.test(type)) && !finalUrl.match(/\.(mp3|m4a|aac|ogg)(\?|$)/i)) {
      continue;
    }
    q.push({ title, author, url: finalUrl });
  }
  queue.value = q;
  if (q.length) {
    // Autoload first
    nextTickPlay(false);
  }
}

function getAudioFromItem(item: Element, strict = false): { url: string; type?: string } | null {
  const enc = item.querySelector('enclosure');
  if (enc?.getAttribute('url')) return { url: enc.getAttribute('url')!, type: enc.getAttribute('type') || undefined };
  const media = item.querySelector('media\\:content, content');
  if (media?.getAttribute('url')) return { url: media.getAttribute('url')!, type: media.getAttribute('type') || undefined };
  if (strict) return null;
  // Fallbacks only when not strict
  const html = item.querySelector('content\\:encoded')?.textContent || item.querySelector('description')?.textContent || '';
  const inHtml = findAudioUrlInText(html);
  if (inHtml) return { url: inHtml } as any;
  const link = item.querySelector('link')?.textContent?.trim();
  if (link && /\.(mp3|m4a|aac|ogg)(\?|$)/i.test(link)) return { url: link } as any;
  return null;
}

function findAudioUrlInText(text: string): string | null {
  if (!text) return null;
  const match = text.match(/https?:[^\s\"]+\.(mp3|m4a|aac|ogg)(\?[^\s\"]*)?/i);
  return match ? match[0] : null;
}

function togglePlay() {
  const el = audioRef.value; if (!el) return;
  if (!currentSrc.value) return;
  if (isPlaying.value) { el.pause(); isPlaying.value = false; }
  else { el.play().catch(() => {}); isPlaying.value = true; }
}

async function next() {
  if (!queue.value.length) return;
  currentIndex.value = (currentIndex.value + 1) % queue.value.length;
  await nextTick();
  nextTickPlay(true);
}
async function prev() {
  if (!queue.value.length) return;
  currentIndex.value = (currentIndex.value - 1 + queue.value.length) % queue.value.length;
  await nextTick();
  nextTickPlay(true);
}

async function nextTickPlay(autoplay: boolean) {
  const el = audioRef.value; if (!el) return;
  el.pause();
  el.currentTime = 0;
  el.src = currentSrc.value || '';
  // Ensure the new src is applied before attempting playback
  try { el.load?.(); } catch {}
  if (!autoplay) { isPlaying.value = false; return; }
  try {
    await el.play();
    isPlaying.value = true;
  } catch {
    // Try again on next tick if immediate play fails
    await nextTick();
    el.play().then(() => { isPlaying.value = true; }).catch(() => { isPlaying.value = false; });
  }
}

function onAudioError() {
  const el = audioRef.value; if (!el) return;
  if (!corsProxy) return;
  // If not already proxied, retry via proxy, then attempt play
  if (!el.src.startsWith(corsProxy)) {
    el.src = corsProxy + currentSrc.value;
    el.play().catch(() => {});
    isPlaying.value = true;
  } else {
    // Skip to next playable item automatically
    const start = currentIndex.value;
    for (let i = 1; i < queue.value.length; i++) {
      const idx = (start + i) % queue.value.length;
      currentIndex.value = idx;
      const src = queue.value[idx]?.url;
      if (src) {
        el.src = src;
        el.play().catch(() => {});
        isPlaying.value = true;
        break;
      }
    }
  }
}

function isDirectAudio(u: string): boolean {
  // Shoutcast/Icecast streams or file extensions
  if (/\.m3u8(\?|$)/i.test(u)) return true;
  if (/\.(mp3|m4a|aac|ogg|opus)(\?|$)/i.test(u)) return true;
  if (/\.(pls|m3u)(\?|$)/i.test(u)) return true;
  // common live stream hosts
  if (/\.out\.airtime\.pro\//.test(u)) return true;
  return false;
}
</script>

<style scoped>
.rss-player {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  width: 100%;
  min-width: 180px;
  max-width: 420px;
}
.controls { display: flex; gap: 4px; }
.btn-ctrl { display:inline-flex; align-items:center; justify-content:center; border: 1px solid var(--border); background: var(--panel); color: var(--ui-ink); border-radius: 6px; padding: 0 6px; cursor: pointer; height: 24px; min-width: 28px; }
.btn-ctrl.primary { background: var(--accent-green); color: #000; box-shadow: 1px 1px 0 #000; }
.btn-ctrl:disabled { opacity: .5; cursor: not-allowed; }

.display { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 6px; }
.marquee { position: relative; overflow: hidden; white-space: nowrap; border: 1px dashed var(--border-soft); border-radius: 6px; padding: 1px 6px; background: var(--panel); color: var(--ui-ink); min-width: 120px; max-width: 100%; }
.marquee span { display: inline-block; padding-left: 100%; animation: scroll 14s linear infinite; }
@keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }

.feed-select { border: 1px solid var(--border-soft); background: var(--surface); color: var(--ui-ink); height: 24px; border-radius: 6px; padding: 0 6px; max-width: 150px; }

.rss-player audio { display: none; }

/* Hide marquee text under 1200px to preserve header space */
@media (max-width: 1200px) {
  .marquee { display: none; }
}
</style>


