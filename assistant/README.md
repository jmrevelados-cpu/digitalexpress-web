# Tarifario y asistente de DIGITAL EXPRESS

El asistente guiado y el cotizador usan la misma fuente: tarifario/precios-foto-2026-10-15.mjs. La conexión de IA sigue aplazada por indicación del titular; apiEndpoint permanece vacío.

## Fuente comercial

El titular entregó una fotografía de su lista y confirmó que los precios por cantidad son por cada foto. Se transcribieron 37 precios de lista, 30 tramos y 5 ofertas Jumbo. Los importes se guardan en céntimos. La fecha 2026-10-15 corresponde a recepción y confirmación, no a una fecha de emisión impresa.

La foto se conserva en tarifario/fuente-precios-2026-10-15.jpg. El Excel digitalizado incluye la fotografía y los puntos pendientes. El Excel es editable, pero no se sincroniza automáticamente con la web.

- El importe unitario de un tramo se aplica a todas las fotos del pedido.
- No se suman descuentos porcentuales del prototipo.
- Las medidas en horizontal y vertical se reconocen como la misma impresión.
- Los precios de lista se aplican a una foto. Cantidades omitidas necesitan confirmación.
- Exactamente 1.000 fotos coincide con S/ 0,90 y S/ 0,85: el motor devuelve ambigüedad y deriva al asesor. A partir de 1.001, la fuente es inequívoca.
- No aplicar las ofertas Jumbo hasta confirmar medida Jumbo, regalo, condiciones y vigencia.
- No figuran precios de marcos ni especificaciones de acabados.
- Se conservan solo los extremos explícitos 5x7 y 10x15 del grupo pequeño. Otros tamaños intermedios necesitan confirmación.
- La fuente no indica fecha de caducidad: validUntil es null. Si el negocio aporta una fecha final, registrarla en knowledge.mjs y verificar el rechazo al vencer.

## Actualizar precios

Editar la fuente, incrementar version y registrar quién/qué confirmó el cambio. No corregir solapamientos por deducción. knowledge.mjs genera las filas del cálculo a partir de basePrices y quantityGroups. Las promociones permanecen separadas del cálculo.

Comprobar en una versión de prueba:

    node --test assistant/core.test.mjs

Además, probar cotizador y asistente en un navegador: una unidad, extremos de cada tramo, cantidades omitidas, exactamente 1.000, formatos grandes y derivación a las tres sedes. El cambio reemplaza 15x21/S/9 del prototipo por 15x20/S/8 de la fuente.

## IA aplazada

El servidor Node está preparado, pero no está conectado ni desplegado con una cuenta real. Usa Responses API con JSON Schema estricto: la IA interpreta intención/datos, mientras que el código consulta las tarifas y calcula. Se consultó [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) y [API overview](https://developers.openai.com/api/reference/overview).

Para revisar localmente con Node.js 22 o posterior:

    node assistant/server.mjs

Cuando se decida activar IA:

1. Configurar OPENAI_API_KEY y OPENAI_MODEL solo en el servidor. Nunca poner una clave en el código público.
2. Usar alojamiento Node con HTTPS; GitHub Pages no ejecuta el servidor.
3. Configurar ALLOWED_ORIGIN, PORT y BIND_HOST para el alojamiento.
4. Añadir límites de gasto y de tráfico. El límite incluido es 20 solicitudes/minuto por IP en un proceso; con proxy o réplicas se necesita un límite centralizado.
5. Cambiar apiEndpoint a /api/assistant y desplegar frontend y servidor juntos.
6. Probar con la cuenta real. Las pruebas incluidas usan un proveedor simulado.

La conversación se mantiene solo en memoria del navegador. El contacto humano abre un resumen en WhatsApp para que el cliente lo revise y envíe; no crea una cola de atención ni integra WhatsApp Business API.
