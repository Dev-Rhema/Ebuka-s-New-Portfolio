import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const page = (file) => fileURLToPath(new URL(file, import.meta.url));

const notFound = (req, res, next) => {
  const path = req.url.split("?")[0];
  const isPage = req.method === "GET" && req.headers.accept?.includes("text/html");
  // Mirrors the rewrite in vercel.json: /case-study/<id> serves the case study page.
  if (isPage && /^\/case-study\/[^/]+\/?$/.test(path)) {
    req.url = "/case-study.html";
  } else if (isPage && path !== "/" && !path.endsWith(".html")) {
    req.url = "/404.html";
    res.statusCode = 404;
  }
  next();
};

const notFoundPage = {
  name: "not-found-page",
  configureServer(server) {
    server.middlewares.use(notFound);
  },
  configurePreviewServer(server) {
    server.middlewares.use(notFound);
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), notFoundPage],
  server: {
    proxy: { "/api": "http://localhost:8080" },
  },
  preview: {
    proxy: { "/api": "http://localhost:8080" },
  },
  build: {
    rolldownOptions: {
      input: {
        main: page("index.html"),
        notFound: page("404.html"),
        caseStudy: page("case-study.html"),
      },
    },
  },
});
