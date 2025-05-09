
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "robots.txt", "lovable-uploads/*.png"],
      manifest: {
        id: "app.circl.pwa",
        name: "Circl - Your Personal Relationship Manager",
        short_name: "Circl",
        description: "Circl helps you organize, update, and strengthen your professional and personal relationships.",
        theme_color: "#1E88E5",
        background_color: "#ffffff",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone"],
        orientation: "portrait",
        start_url: "/",
        dir: "ltr",
        categories: ["productivity", "business", "social", "utilities"],
        iarc_rating_id: "e84b072d-71b3-4d3e-86ae-31a8ce4e53b7",
        prefer_related_applications: false,
        related_applications: [
          {
            platform: "webapp",
            url: "https://circl.app"
          },
          {
            platform: "play",
            url: "https://play.google.com/store/apps/details?id=app.circl.pwa",
            id: "app.circl.pwa"
          }
        ],
        scope_extensions: [
          { origin: "https://app.circl.com" }
        ],
        // App Shortcuts
        shortcuts: [
          {
            name: "Add New Contact",
            short_name: "New Contact",
            description: "Create a new contact in your network",
            url: "/circles?action=add",
            icons: [{ src: "lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png", sizes: "192x192" }]
          },
          {
            name: "My Circles",
            short_name: "Circles",
            description: "View your relationship circles",
            url: "/circles",
            icons: [{ src: "lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png", sizes: "192x192" }]
          },
          {
            name: "Keystones",
            short_name: "Keystones",
            description: "Manage your relationship keystones",
            url: "/keystones",
            icons: [{ src: "lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png", sizes: "192x192" }]
          }
        ],
        // Screenshot array for better app store presence
        screenshots: [
          {
            src: "lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png",
            sizes: "1280x720",
            type: "image/png",
            label: "Circl Home Screen"
          },
          {
            src: "lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png", 
            sizes: "1280x720",
            type: "image/png",
            label: "Relationship Management"
          }
        ],
        icons: [
          {
            src: "lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        // Launch handler configuration
        launch_handler: {
          client_mode: ["focus-existing", "auto"]
        },
        // Edge side panel integration
        edge_side_panel: {
          preferred_width: 400
        },
        // File handling capabilities
        file_handlers: [
          {
            action: "/import",
            accept: {
              "text/csv": [".csv"],
              "application/vcard+json": [".vcf", ".vcard"]
            }
          }
        ],
        // Link handling
        handle_links: "preferred",
        // Protocol handler
        protocol_handlers: [
          {
            protocol: "web+circl",
            url: "/%s"
          }
        ],
        // Share target capabilities
        share_target: {
          action: "/share-target",
          method: "POST",
          enctype: "multipart/form-data",
          params: {
            title: "title",
            text: "text",
            url: "url",
            files: [
              {
                name: "contacts",
                accept: ["text/csv", "text/vcard", ".vcf", ".csv"]
              }
            ]
          }
        }
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        // Instead of using backgroundSync directly, we configure it through Workbox recipes
        // This is standard way to register background sync in Workbox
        clientsClaim: true,
        skipWaiting: true,
      },
      // Separate configuration for periodic background sync
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      // Enable push notifications
      devOptions: {
        enabled: true,
        type: 'module'
      }
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
