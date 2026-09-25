import { cpSync, createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, sep } from 'node:path';
import { defineConfig } from 'vite';

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.bin': 'application/octet-stream',
  '.webp': 'image/webp',
};

const assetsRoot = () => join(process.cwd(), 'assets');

function stashStaticAssets() {
  return {
    name: 'stash-static-assets',
    enforce: 'pre',
    // Vite hashes HTML asset URLs. The scripts fetch those files by a fixed
    // path, so a hashed preload is a second download. Hide the tags until
    // after the build, and drop source modulepreloads so they are not extra entries.
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        let out = html;
        if (!ctx.server) out = out.replace(/[ \t]*<link rel="modulepreload" href="js\/[^"]+" \/>\n?/g, '');
        return out.replace(/<link\b[^>]*\bhref="\/?assets\/[^"]+"[^>]*>/g, (tag) => {
          const abs = tag.replace('href="assets/', 'href="/assets/');
          return `<!--nv:${encodeURIComponent(abs)}-->`;
        });
      },
    },
  };
}

function restoreStaticAssets() {
  return {
    name: 'restore-static-assets',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(/<!--nv:([\s\S]*?)-->/g, (_, encoded) => decodeURIComponent(encoded));
      },
    },
  };
}

function northvaneAssets() {
  return {
    name: 'northvane-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = decodeURIComponent((req.url || '').split('?')[0]);
        if (!url.startsWith('/assets/')) return next();
        const file = join(server.config.root, url.slice(1));
        const root = join(server.config.root, 'assets') + sep;
        if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) return next();
        res.setHeader('Content-Type', MIME[extname(file)] || 'application/octet-stream');
        createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      cpSync(assetsRoot(), join(process.cwd(), 'dist', 'assets'), { recursive: true });
    },
  };
}

export default defineConfig({
  server: { port: 5194, strictPort: true },
  build: { outDir: 'dist', chunkSizeWarningLimit: 800 },
  plugins: [stashStaticAssets(), northvaneAssets(), restoreStaticAssets()],
});
