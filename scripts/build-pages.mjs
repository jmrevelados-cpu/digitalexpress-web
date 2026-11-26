import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await copyFile('index.html', 'dist/index.html');
await copyFile('catalogo-preview.html', 'dist/catalogo-preview.html');
console.log('Cloudflare Pages: dist/ preparado');
