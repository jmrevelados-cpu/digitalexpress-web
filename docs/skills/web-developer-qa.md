# DIGITAL EXPRESS — Web Developer & QA (v1)

## Objetivo
Evolucionar el sitio sin romper la versión actual, el cotizador ni el flujo de ventas por WhatsApp.

## Flujo de trabajo
1. Leer el estado actual y documentar el resultado esperado.
2. Crear una rama para cada cambio funcional; nunca modificar directamente `main` sin revisión.
3. Conservar los archivos originales y las rutas del logo e imágenes; no reformatear grandes bloques base64 de forma innecesaria.
4. Hacer cambios pequeños y reversibles. Abrir pull request con resumen, riesgos y pasos para probar.
5. Probar antes de proponer fusión: catálogo, cotizador, fórmulas, descuentos, formulario, enlaces WhatsApp, historial, accesibilidad y responsive.
6. Registrar errores encontrados, causas y pruebas de regresión en un documento de cambios.

## Puntos conocidos para verificar, NO corregir sin confirmación
- En `index.html` los enlaces de WhatsApp y su texto visible difieren en al menos dos sedes; confirmar números de cada sede antes de tocar enlaces.
- Revisar la constante `WHATSAPP_NUMERO` utilizada por el cotizador frente al destino comercial deseado.
- Verificar que precios, direcciones y servicios publicables estén aprobados; el propio HTML advierte que hay datos de sedes de referencia.
- El HTML contiene imágenes PNG en base64; revisar peso y carga sin alterar el logo original.
- Revisar manejo de datos de cliente almacenados en `localStorage` y cualquier inserción de texto del usuario mediante `innerHTML` para evitar exposición o inyección.
- Incorporar metadescripción, revisión de SEO, rendimiento y pruebas móviles después del diagnóstico.

## Criterios de aceptación
- [ ] No se modificaron los precios ni datos de contacto sin confirmación.
- [ ] Cotizador y WhatsApp funcionan como se espera en móvil y escritorio.
- [ ] No hay regresiones visuales ni errores JavaScript conocidos.
- [ ] Hay explicación de cambios, pruebas, riesgos y vía de reversión.
- [ ] Publicación solo con aprobación del propietario.
