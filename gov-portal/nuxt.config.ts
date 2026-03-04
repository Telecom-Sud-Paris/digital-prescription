import tailwindcss from "@tailwindcss/vite";
import {resolve} from "path";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  alias: {
    '#test-application': resolve(__dirname, '../test-application/javascript')
  },
  nitro: {
    externals: {
      traceInclude: [
        resolve(__dirname, '../test-application/javascript')
      ]
    }
  }
});