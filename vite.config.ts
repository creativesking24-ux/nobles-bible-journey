import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const appKey = env.YVP_APP_KEY || process.env.YVP_APP_KEY || ''

  return {
    plugins: [
      {
        name: 'youversion-dev-guard',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (!req.url?.startsWith('/api/youversion')) return next()
            if (!appKey) {
              res.statusCode = 503
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  error:
                    'YVP_APP_KEY not configured. Copy .env.example to .env and set your YouVersion App Key.',
                  code: 'NOT_CONFIGURED',
                }),
              )
              return
            }
            next()
          })
        },
      },
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icons.svg'],
        manifest: {
          name: "Noble's Bible Journey Tracker",
          short_name: 'Bible Journey',
          description:
            '90+ Day Bible Study Tracker — Epistles, Proverbs & Revelation (Jun 15 – Sep 20, 2026)',
          theme_color: '#0D1B2A',
          background_color: '#0D1B2A',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          categories: ['education', 'lifestyle'],
          icons: [
            {
              src: '/pwa-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: '/index.html',
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-static',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
            {
              // Public-domain Bible fallback — cache for offline rereads
              urlPattern: /^https:\/\/bible-api\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'bible-api-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
            {
              // YouVersion via same-origin proxy when online
              urlPattern: /\/api\/youversion\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'youversion-api-cache',
                networkTimeoutSeconds: 8,
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 14,
                },
              },
            },
          ],
        },
      }),
    ],
    server: {
      proxy: {
        // App Key stays on the server — never ship it in the browser bundle
        '/api/youversion': {
          target: 'https://api.youversion.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/youversion/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('X-YVP-App-Key', appKey)
              proxyReq.setHeader('x-yvp-app-key', appKey)
            })
          },
        },
      },
    },
  }
})
