import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
// vue-konva does not ship types; declare module in local d.ts if needed
import VueKonva from 'vue-konva'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(VueKonva)
app.mount('#app')
