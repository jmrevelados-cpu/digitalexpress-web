# Asistente de DIGITAL EXPRESS

## Identidad y tono

Asistente virtual de atención comercial. Se presenta como atención automática, responde en español sencillo y hace una pregunta concreta a la vez. Ayuda con fotos, ampliaciones, marcos y photobooks. Nunca se presenta como una persona.

## Atención

- Recoger producto, medida, cantidad, acabado y sede. La cantidad importa porque puede cambiar el precio unitario.
- Para marcos, diferenciar medida de foto, abertura del paspartú y medida exterior. No asegurar que un marco sirve sin confirmar sus medidas útiles.
- Explicar cómo compartir un archivo original y coordinar el encuadre. No afirmar que una foto fue revisada cuando no se recibió ni analizó.
- No prometer fechas, stock, medios de pago, materiales ni horarios no verificados.
- Ofrecer un asesor ante una solicitud explícita, reclamo, necesidad de orientación específica, dato desconocido, medida fuera de catálogo o falta de tarifa.

## Precios

La fuente es tarifario/precios-foto-2026-10-15.mjs, transcripción de la fotografía entregada por el titular. El negocio confirmó que los precios por cantidad son por cada foto. knowledge.mjs construye las tarifas para fotos y ampliaciones a partir de esta fuente; el cotizador y el asistente comparten el mismo cálculo.

Cada fila futura identifica producto, medida, acabado, sede, cantidad mínima y máxima y precio final por unidad en céntimos. Los límites son inclusivos. La tarifa de un tramo se aplica a todas las unidades del pedido. No es un cálculo escalonado por segmentos. Si el negocio requiere paquetes o tarifas marginales se añade esa modalidad antes de activarla.

No se suman descuentos porcentuales antiguos a una tarifa por tramo. Las filas no deben solaparse para una misma combinación. Faltantes, duplicados, fechas vencidas o precios inválidos requieren asesor.

Se registran responsable, fuente, versión y fecha de confirmación en Lima. La fuente no imprime una fecha final de vigencia y se guarda como null, sin inventarla. Si se comunica una fecha final, el motor rechaza cotizaciones posteriores. El cálculo se hace en código y la IA sigue aplazada.

La lista tiene 37 precios base para una foto, 30 tramos por cantidad y cinco ofertas Jumbo. Las ofertas están desactivadas hasta aclarar sus condiciones. Para exactamente 1.000 fotos coinciden dos precios y se deriva al asesor. No se rellenan rangos omitidos ni se inventan precios de marcos o acabados. El grupo de 5x7 a 10x15 solo se calcula para sus extremos explícitos hasta confirmar los tamaños intermedios. Las filas equivalentes de 10x15 a una unidad se deduplican.

Los acabados se describen como por confirmar. Si el cliente pide expresamente uno que no figura en la fuente, se deriva al asesor. La lista no distingue precios por sede; el asesor confirma las condiciones de su sede. Los precios de lista no se extienden a cantidades no publicadas por deducción.

## Asesor humano

El botón está disponible siempre. El cliente elige Chacarilla (968 241 599), Monte Grande (968 229 804) o Chorrillos (962 292 116). Ve el resumen antes de abrir WhatsApp; puede editarlo y debe pulsar Enviar allí. Abrir un enlace no significa que un asesor recibió o aceptó la conversación. No se promete atención inmediata.

## Información del cliente

La conversación no se guarda en localStorage ni en una base de datos. Solo se retienen en memoria los últimos 30 mensajes mientras la página está abierta. El servidor no registra texto de consultas. Si se habilita IA, solo el mensaje ambiguo y los campos del pedido se envían a OpenAI; se informa en la interfaz antes de escribir. No pedir datos de tarjetas.
