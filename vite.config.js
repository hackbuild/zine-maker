import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        open: true,
        proxy: {
            // Dev-only RSS proxy to bypass CORS for feeds
            '/__rss_proxy__': {
                target: 'http://localhost',
                changeOrigin: true,
                configure: (proxy) => {
                    proxy.on('proxyReq', (proxyReq, req) => {
                        const urlParam = new URL(req.url || '', 'http://x').searchParams.get('url');
                        if (!urlParam)
                            return;
                        try {
                            const targetUrl = new URL(urlParam);
                            proxyReq.setHeader('host', targetUrl.host);
                            proxyReq.path = targetUrl.pathname + (targetUrl.search || '');
                            proxy.options.target = `${targetUrl.protocol}//${targetUrl.host}`;
                        }
                        catch { }
                    });
                }
            }
        }
    },
});
