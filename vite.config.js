import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const page = (file) => fileURLToPath(new URL(file, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      input: { main: page("index.html"), notFound: page("404.html") },
    },
  },
});
