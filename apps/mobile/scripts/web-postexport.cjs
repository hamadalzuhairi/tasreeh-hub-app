// Prepares `expo export --platform web` output for Vercel.
//
// Vercel's CLI never uploads directories named node_modules, but Expo's web export keeps package
// assets (fonts, icons) under assets/__node_modules/**/node_modules/**. Without this step those
// fonts 404 in production and the app waits on its loading spinner forever.
//
// Copies the export into a clean output folder with those path segments renamed, rewrites the
// references in the bundle to match, and adds an SPA rewrite so deep links load index.html.
// Copying (rather than renaming in place) avoids file locks from synced folders like OneDrive.
//
// Usage: node scripts/web-postexport.cjs <export-dir> <output-dir>
const fs = require("fs");
const path = require("path");

const [src, out] = process.argv.slice(2).map((p) => path.resolve(p));
if (!src || !out) {
  console.error("Usage: node scripts/web-postexport.cjs <export-dir> <output-dir>");
  process.exit(1);
}

const renameSegments = (rel) =>
  rel
    .split(path.sep)
    // Vercel also skips dot-directories such as pnpm's .pnpm store folder.
    .map((segment) =>
      segment === "__node_modules" ? "__nm" : segment === "node_modules" ? "nm" : segment === ".pnpm" ? "pnpm" : segment
    )
    .join(path.sep);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

fs.rmSync(out, { recursive: true, force: true });

let renamed = 0;
for (const file of walk(src)) {
  const rel = path.relative(src, file);
  const target = path.join(out, renameSegments(rel));
  if (target !== path.join(out, rel)) renamed++;
  fs.mkdirSync(path.dirname(target), { recursive: true });

  if (/\.(js|html|css|json)$/.test(file)) {
    const text = fs.readFileSync(file, "utf8").replace(/\/__node_modules\//g, "/__nm/").replace(/\/node_modules\//g, "/nm/").replace(/\/\.pnpm\//g, "/pnpm/");
    fs.writeFileSync(target, text);
  } else {
    fs.copyFileSync(file, target);
  }
}

fs.writeFileSync(
  path.join(out, "vercel.json"),
  JSON.stringify({ rewrites: [{ source: "/(.*)", destination: "/index.html" }] }, null, 2) + "\n"
);

console.log(`Wrote ${out} (${renamed} asset paths renamed)`);
