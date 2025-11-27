import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

export default defineConfig({
  plugins: [vue(), vueJsx()],
  // resolve: {
  //   alias: {
  //     '@': fileURLToPath(new URL('./src', import.meta.url)),
  //   },
  // },
  server: {
    port: 8000,
    host: "0.0.0.0",
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
});
