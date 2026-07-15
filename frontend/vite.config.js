import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // For most API requests
      "/api": { 
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      // Socket.io is used for the chat connection
      "/socket.io": { 
        target: "http://localhost:8080",
        ws: true, // treat as a web socket
        changeOrigin: true,
      },
    },
  },
});
