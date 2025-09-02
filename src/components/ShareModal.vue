<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-button" @click="$emit('close')">×</button>

      <div class="modal-header">
        <h3>Share to IPFS</h3>
        <p>Publish your project JSON to IPFS. Optionally include author details and sign with PGP.</p>
      </div>

      <div class="form-grid">
        <div class="field">
          <label>Project</label>
          <div class="value">{{ projectTitle }}</div>
        </div>

        <div class="field">
          <label>Description</label>
          <textarea v-model="description" rows="2" placeholder="Short summary of this zine"></textarea>
        </div>

        <div class="field">
          <label>Tags (comma-separated)</label>
          <input v-model="tags" placeholder="privacy, mutual-aid" />
        </div>

        <div class="section">
          <h4>Author (optional)</h4>
          <div class="field-2col">
            <div>
              <label>Name</label>
              <input v-model="authorName" placeholder="Your Name" />
            </div>
            <div>
              <label>Website</label>
              <input v-model="authorUrl" placeholder="https://example.org" />
            </div>
          </div>
          <div class="field-2col">
            <div>
              <label>Contact</label>
              <input v-model="authorContact" placeholder="you@example.org" />
            </div>
            <div>
              <label>PGP Fingerprint</label>
              <input v-model="pgpFingerprint" placeholder="ABCD EFGH ..." />
            </div>
          </div>
          <div class="field">
            <label>Public Key (armored, optional)</label>
            <textarea v-model="pgpPublicKey" rows="3" placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----"></textarea>
          </div>
          <div class="field">
            <label class="checkbox">
              <input type="checkbox" v-model="shouldSign" /> Sign manifest with my PGP private key (paste below; not saved)
            </label>
            <textarea v-if="shouldSign" v-model="pgpPrivateKey" rows="3" placeholder="-----BEGIN PGP PRIVATE KEY BLOCK-----"></textarea>
            <input v-if="shouldSign" v-model="pgpPassphrase" type="password" placeholder="PGP passphrase (if any)" />
          </div>
        </div>

        <div class="section">
          <h4>Pinning</h4>
          <div class="field">
            <label>Provider</label>
            <select v-model="pinProvider">
              <option value="web3">web3.storage (token)</option>
              <option value="pinata">Pinata (JWT)</option>
              <option value="none">Anonymous (gateway-only, not guaranteed)</option>
            </select>
          </div>
          <div class="field" v-if="pinProvider !== 'none'">
            <label>API Token</label>
            <input v-model="pinToken" type="password" placeholder="Enter token (stored locally for this session)" />
          </div>
        </div>

        <div class="field">
          <label class="checkbox">
            <input type="checkbox" v-model="includeBackup" /> Include portable backup (assets) snapshot
          </label>
        </div>
      </div>

      <div class="actions">
        <button class="btn" @click="onPublish" :disabled="publishing || publishDisabled">{{ publishing ? 'Publishing…' : 'Publish' }}</button>
        <a class="help-link" href="https://ssd.eff.org/module/creating-pgp-keys" target="_blank" rel="noopener noreferrer">How to create a PGP key</a>
      </div>

      <div v-if="result" class="result">
        <div class="row"><strong>Manifest CID:</strong> <code>{{ result.manifestCid }}</code></div>
        <div class="row" v-if="result.projectCid"><strong>Project CID:</strong> <code>{{ result.projectCid }}</code></div>
        <div class="row" v-if="result.backupCid"><strong>Backup CID:</strong> <code>{{ result.backupCid }}</code></div>
        <div class="links">
          <a v-if="result.manifestCid" :href="gatewayUrlSafe(result.manifestCid)" target="_blank" rel="noopener">Open Manifest</a>
          <a v-if="result.projectCid" :href="gatewayUrlSafe(result.projectCid)" target="_blank" rel="noopener">Open Project</a>
          <a v-if="result.backupCid" :href="gatewayUrlSafe(result.backupCid)" target="_blank" rel="noopener">Open Backup</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useProjectStore } from '@/stores/project';

defineEmits<{ (e: 'close'): void }>();
const projectStore = useProjectStore();

const projectTitle = computed(() => projectStore.currentProject?.name || 'Untitled');
const description = ref(projectStore.currentProject?.metadata.description || '');
const tags = ref((projectStore.currentProject?.metadata.tags || []).join(', '));

const authorName = ref('');
const authorUrl = ref('');
const authorContact = ref('');
const pgpFingerprint = ref('');
const pgpPublicKey = ref('');
const shouldSign = ref(false);
const pgpPrivateKey = ref('');
const pgpPassphrase = ref('');

const includeBackup = ref(false);
const pinProvider = ref<'web3'|'pinata'|'none'>('none');
const pinToken = ref('');

const publishing = ref(false);
const result = ref<{ manifestCid: string; projectCid?: string; backupCid?: string } | null>(null);

function gatewayUrl(cid: string): string {
  return `https://ipfs.io/ipfs/${cid}`;
}

const publishDisabled = computed(() => {
  if (pinProvider.value === 'none') return true; // require provider for now
  return !pinToken.value.trim();
});

function gatewayUrlSafe(cid?: string): string {
  const v = (cid || '').trim();
  if (!v) return 'javascript:void(0)';
  return gatewayUrl(v);
}

async function onPublish() {
  if (!projectStore.currentProject || publishing.value) return;
  if (publishDisabled.value) {
    alert('Please select a pin provider and enter a valid API token.');
    return;
  }
  publishing.value = true;
  result.value = null;
  try {
    const { publishToIpfs } = await import('@/utils/useIpfs');
    const res = await publishToIpfs({
      project: projectStore.currentProject,
      description: description.value,
      tags: tags.value,
      author: {
        name: authorName.value,
        url: authorUrl.value,
        contact: authorContact.value,
        pgp: {
          fingerprint: pgpFingerprint.value,
          publicKeyArmored: pgpPublicKey.value || undefined
        }
      },
      sign: shouldSign.value ? { privateKeyArmored: pgpPrivateKey.value, passphrase: pgpPassphrase.value } : undefined,
      pin: { provider: pinProvider.value as any, token: pinToken.value },
      includeBackup: includeBackup.value
    });
    result.value = res;
  } catch (err) {
    console.error(err);
    alert((err as any)?.message || 'Publish failed. Check console for details.');
  } finally {
    publishing.value = false;
  }
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 2200; }
.modal-content { background: var(--panel); padding: 1.25rem; border-radius: 10px; width: min(820px, 95vw); border: 1.5px solid var(--border); box-shadow: 4px 4px 0 #000; position: relative; }
.close-button { position: absolute; right: 10px; top: 10px; background: transparent; border: none; font-size: 20px; cursor: pointer; color: var(--ui-ink); }
.modal-header { margin-bottom: .75rem; }
.modal-header h3 { margin: 0 0 .25rem 0; }
.form-grid { display: flex; flex-direction: column; gap: .6rem; }
.field { display: flex; flex-direction: column; gap: .35rem; }
.field-2col { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; }
label { font-size: .85rem; color: var(--ui-ink); }
input, textarea, select { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 6px; padding: .5rem .6rem; color: var(--ui-ink); }
.value { padding: .5rem .6rem; background: var(--surface); border: 1px solid var(--border-soft); border-radius: 6px; }
.checkbox { display: flex; gap: .5rem; align-items: center; }
.section { margin-top: .6rem; padding-top: .6rem; border-top: 1px solid var(--border-soft); }
.actions { display: flex; align-items: center; justify-content: space-between; margin-top: .75rem; }
.btn { padding: .6rem 1rem; border: 1px solid var(--border); background: var(--accent-green); color: #000; border-radius: 6px; cursor: pointer; box-shadow: 2px 2px 0 #000; }
.help-link { color: #2563eb; text-decoration: none; }
.result { margin-top: .8rem; background: var(--surface); border: 1px solid var(--border-soft); border-radius: 8px; padding: .6rem; display: flex; flex-direction: column; gap: .4rem; }
.row { display: flex; gap: .5rem; align-items: center; }
.links { display: flex; gap: .75rem; }

@media (max-width: 768px) {
  .field-2col { grid-template-columns: 1fr; }
}
</style>


