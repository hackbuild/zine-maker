import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
// vue-konva does not ship types; declare module in local d.ts if needed
import VueKonva from 'vue-konva'
import './style.css'

// Import page components
import ZineMaker from './pages/ZineMaker.vue'
import MarkdownEditor from './pages/MarkdownEditor.vue'

const routes = [
  { path: '/', component: ZineMaker },
  { path: '/markdown', component: MarkdownEditor }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(VueKonva)
app.use(router)
app.mount('#app')
