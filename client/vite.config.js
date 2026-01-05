import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // server : {
  //   host : true,
  //   proxy : {
  //     "/api" : "http://localhost:3000",
  //     changeOrigin : true,
  //     secure: false,
  //   }
  // }
})


// import { defineConfig } from 'vite'
// import tailwindcss from '@tailwindcss/vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   server: {
//     host: true,         // supaya bisa diakses dari IP/public
//     port: 5173,
//     strictPort: true,
//     allowedHosts: [
//       'localhost',
//       '127.0.0.1',
//       '.ngrok-free.app', // izinkan semua subdomain ngrok
//     ],
//   },
// })

