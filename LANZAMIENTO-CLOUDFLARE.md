# Preparación del lanzamiento gratuito de DIGITAL EXPRESS

Esta rama parte de `mejora/navegacion-y-pedidos` (PR #5), no de `main`. No fusionar hasta revisar y aprobar ambos cambios.

## Cloudflare Pages

- Conectar el repositorio privado de GitHub con autorización para este repositorio.
- Rama de producción **después de aprobar y fusionar**: `main`.
- Framework: **None**.
- Build command: `node scripts/build-pages.mjs`.
- Build output directory: `dist`.
- Root directory: raíz del repositorio.
- El script requiere Node.js moderno compatible con `import.meta.dirname` (Node 20.11+; se recomienda Node 22).

## Alcance del despliegue

`dist/` incluye exclusivamente HTML, CSS, JavaScript cliente, fuente de precios utilizada por el cliente y WebP de productos. No se copian `assistant/server.mjs`, pruebas, Excel, imagen original del tarifario ni documentación interna.

El asistente sigue en modo guiado: `apiEndpoint` vacío. No activar IA ni incorporar secretos en el frontend.

## Comprobación antes de publicar

1. Ejecutar `node --test assistant/core.test.mjs`.
2. Ejecutar `node scripts/build-pages.mjs`; comprobar `dist/index.html` y los recursos.
3. Verificar que NO existen `dist/assistant/server.mjs`, `dist/assistant/core.test.mjs`, `dist/tarifario/fuente-precios-2026-10-15.jpg` ni Excel.
4. Comprobar visualmente el logotipo original, nueve categorías y las imágenes en móvil.
5. Probar el cotizador, casos sin tarifa y derivación humana.
6. Verificar los WhatsApp: PRIMAVERA 51968241599, Monte Grande 51968229804 y Chorrillos 51962292116.
7. Comprobar que no se activan promociones Jumbo no confirmadas.
8. Revisar la dirección `*.pages.dev` y aprobar expresamente el lanzamiento.

**No se ha creado ningún despliegue ni fusionado ningún PR.**
