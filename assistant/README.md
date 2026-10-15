# Activación y mantenimiento

El asistente guiado funciona en el sitio estático: medidas, preparación de archivos, recopilación de solicitudes y derivación al WhatsApp oficial. La interpretación con IA es opcional y está preparada, pero NO está activada ni verificada con una cuenta real. Tampoco hay tarifas aprobadas.

## Tarifario

Completar la plantilla entregada al negocio. Revisar precios unitarios, tramos por cantidad, ampliaciones y marcos. Una fila por producto/medida/acabado/sede/tramo. Cantidades y precios vacíos no equivalen a cero ni a gratuidad. No acumular descuentos sobre los precios de los tramos.

Una vez aprobado, cargar las filas en knowledge.mjs:

    {
      product: "fotos",
      size: "10 x 15 cm",
      finish: "Mate",
      branch: "Todas",
      minQuantity: 1,
      maxQuantity: null,
      unitPriceCents: /* importe aprobado en céntimos */
    }

Los productos válidos son fotos, ampliaciones, marcos y photobooks. Toda fila debe usar un acabado concreto; si hay varios, el asistente preguntará. branch es Todas o una de las tres sedes oficiales. maxQuantity null significa sin límite superior.

Indicar version, approvedBy, source, validFrom y validUntil (YYYY-MM-DD), y cambiar approved a true solo con aprobación comercial. Validar con node --test assistant/core.test.mjs. La web anterior conserva su estimador y precios de referencia; deben revisarse también al aprobar el tarifario para evitar dos catálogos comerciales distintos. La hoja de cálculo no se sincroniza sola con el asistente.

## Conexión de IA

Se consultó OpenAI Docs: [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) y [API overview](https://developers.openai.com/api/reference/overview).

El servidor usa Responses API con JSON Schema estricto. El modelo clasifica intención y extrae datos, pero no genera precios ni respuestas comerciales libres. Se conserva store:false. Sin conexión, el asistente ofrece orientación guiada y contacto humano.

Para probar localmente, requiere Node.js 22 o posterior:

    node assistant/server.mjs

Antes de activar IA:

1. Configurar OPENAI_API_KEY y OPENAI_MODEL como secretos/variables del servidor. Nunca incluir una clave en HTML, JavaScript público ni Git. No se requiere para las pruebas simuladas.
2. Alojar el servidor en un servicio compatible con Node.js y HTTPS. Un sitio estático o GitHub Pages no ejecuta este servidor.
3. Configurar ALLOWED_ORIGIN con el origen exacto de producción, PORT y BIND_HOST según el alojamiento. No activar CORS abierto. El servidor actual exige mismo origen.
4. Configurar límites de gasto del proveedor y protección de tráfico en el alojamiento. El límite incluido es de 20 solicitudes/minuto por IP en un solo proceso; para réplicas o un proxy compartido se necesita un límite centralizado antes del servidor.
5. Cambiar apiEndpoint en knowledge.mjs a /api/assistant y desplegar frontend y servidor juntos. Al estar vacía, la web no envía consultas a un proveedor de IA.
6. Probar con la cuenta real: mensajes coloquiales, desconocidos, fallos del proveedor, cotización con una tarifa aprobada y derivación a las tres sedes. Los tests incluidos usan un proveedor simulado y no validan credenciales ni calidad lingüística de un modelo real.

La respuesta de atención humana depende de la sede. Esta integración abre un mensaje preparado en WhatsApp; no crea una cola ni conecta la API de WhatsApp Business.
