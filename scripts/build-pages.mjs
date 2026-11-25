// Construye un directorio público mínimo para Cloudflare Pages.
// No altera el código, los precios, el logo ni los recursos originales.
import { cp, mkdir, rm, stat } from "node:fs/promises";
import { resolve, join } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = join(root, "dist");
const files = [
  "index.html",
  "assistant/ui.css",
  "assistant/ui.js",
  "assistant/core.mjs",
  "assistant/knowledge.mjs",
  "tarifario/precios-foto-2026-10-15.mjs"
];
const directories = ["assets/productos"];
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const path of files) {
  const source = join(root, path);
  if (!(await stat(source)).isFile()) throw new Error("Archivo requerido no válido: " + path);
  await mkdir(resolve(output, path, ".."), { recursive: true });
  await cp(source, join(output, path));
}
for (const path of directories) {
  const source = join(root, path);
  if (!(await stat(source)).isDirectory()) throw new Error("Directorio requerido no válido: " + path);
  await cp(source, join(output, path), { recursive: true });
}
console.log("Sitio público preparado en dist/ (sin servidor, pruebas, fotos de fuente ni Excel).");
