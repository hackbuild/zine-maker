<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <button class="close" @click="$emit('close')">×</button>
      <h3>Published Zines</h3>
      <div class="controls">
        <input v-model="cid" placeholder="Global index CID or IPNS name" />
        <button class="btn" @click="load">Load</button>
      </div>
      <ul class="list">
        <li v-for="item in items" :key="item.cid" class="row">
          <div class="info">
            <div class="title">{{ item.title }}</div>
            <div class="meta">{{ item.description }}</div>
            <div class="meta small">{{ item.cid }}</div>
          </div>
          <div class="actions">
            <a class="btn" :href="`https://gateway.pinata.cloud/ipfs/${item.cid}`" target="_blank" rel="noopener">Open</a>
          </div>
        </li>
      </ul>
      <div v-if="!items.length" class="empty">No items loaded</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

defineEmits<{ (e: 'close'): void }>();

const cid = ref('bafkreibozw3oc5a6vd5djsh5s22uguswes45dc4vpc5rvq5emgycjwyzsu');
const items = ref<{ cid: string; title: string; description?: string }[]>([]);

function toPinataPath(v: string): string {
  const x = (v || '').trim();
  if (!x) return 'ipfs/';
  if (x.startsWith('ipns/')) return x;
  if (x.startsWith('ipfs/')) return x;
  if (x.startsWith('ipns:')) return `ipns/${x.slice(5)}`;
  if (x.startsWith('ipfs:')) return `ipfs/${x.slice(5)}`;
  if (x.startsWith('k51')) return `ipns/${x}`; // IPNS name
  return `ipfs/${x}`;
}

async function load() {
  const v = cid.value.trim();
  if (!v) return;
  try {
    // Prefer Pinata gateway for the registry manifest (faster availability)
    const base = 'https://gateway.pinata.cloud';
    const url = `${base}/${toPinataPath(v)}`;
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data?.items) ? data.items : (Array.isArray(data?.entries) ? data.entries : []);
    items.value = list.map((i: any) => ({
      cid: i.cid || i.manifestCid || i.project?.cid || i.id,
      title: i.title || i.name || i.project?.title || (i.cid || i.manifestCid || ''),
      description: i.description
    })).filter((i: any) => typeof i.cid === 'string' && i.cid);
  } catch (e) {
    console.error(e);
    alert('Failed to load directory');
  }
}

onMounted(() => { load(); });
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 2200; }
.modal { background: var(--panel); width: min(720px, 95vw); border: 1.5px solid var(--border); border-radius: 10px; padding: .8rem; position: relative; box-shadow: 4px 4px 0 #000; }
.close { position: absolute; right: 10px; top: 10px; background: transparent; border: none; font-size: 20px; cursor: pointer; color: var(--ui-ink); }
.controls { display: flex; gap: .5rem; margin-bottom: .5rem; }
.controls input { flex: 1; padding: .45rem .6rem; border: 1px solid var(--border-soft); border-radius: 6px; background: var(--surface); color: var(--ui-ink); }
.btn { padding: .45rem .7rem; border: 1px solid var(--border); background: var(--panel); border-radius: 6px; cursor: pointer; }
.list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .4rem; max-height: 60vh; overflow: auto; }
.row { display: flex; justify-content: space-between; align-items: center; padding: .5rem; background: var(--surface); border: 1px solid var(--border-soft); border-radius: 8px; }
.info { display: flex; flex-direction: column; gap: .2rem; }
.title { font-weight: 600; }
.meta { font-size: .9rem; color: var(--ui-ink); }
.small { font-size: .75rem; opacity: .7; }
.empty { padding: .5rem; opacity: .8; }
</style>


