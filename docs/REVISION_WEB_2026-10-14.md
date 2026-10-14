# Revisión de DIGITAL EXPRESS — 14 de octubre de 2026

## Alcance y evidencia
Lectura autenticada del repositorio privado confirmada. Base main: 70cca4b98f867c45e057a6d6cc61f544ef29a603. Blob index.html: 70a302002092478d589cbfa9aa356908c75a5739 (236615 bytes).
Árbol: README.md, index.html y Respaldo inicial de DIGITAL EXPRESS. HTML, CSS y JavaScript están en un único archivo, sin configuración de pruebas o compilación en el árbol. Esta propuesta solo agrega documentación; no corrige ni publica la web.

Revisión estática completa de index.html. No se ejecutaron pruebas visuales en navegador, envíos reales, Lighthouse ni auditoría del servidor. GitHub indica has_pages=false y no declara homepage: esto no descarta alojamiento externo.

## Hallazgos priorizados
- Alta — Inyección HTML/JavaScript del lado del cliente: pintarHistorial y mostrarResumenFinal interpolan cliente.nombre en innerHTML (aprox. líneas 911 y 988). El nombre viene del formulario y persiste en localStorage. Usar nodos/textContent; validar también datos recuperados. No se ejecutó una carga maliciosa.
- Alta — Confirmación desactualizada: actualizarResumenEnVivo cambia el resumen al editar campos, pero no elimina ni regenera href/show de whatsappBtn. Tras generar A y editar a B, puede verse B y enviarse A. Invalidar confirmación hasta regenerar o sincronizar el enlace.
- Alta comercial — Chacarilla (407) muestra 968 229 804 pero abre 968 241 599. Monte Grande (414) muestra 968 241 599 pero abre 968 229 804. Footer (635) muestra 968 248 599 pero tel: apunta a 968 241 599. Confirmar asignación con el propietario antes de corregir. Chorrillos (421) coincide: 962 292 116. Cotizador usa 968 241 599; diseño usa 968 229 804. Formato internacional de los destinos: 51 + nueve dígitos; titularidad y disponibilidad no verificadas.
- Media — novalidate en el formulario (439), validación de cantidad solo finita y >=1 (validarFormulario): acepta fracciones pese a step=1, sin límite máximo; puede producir importes fuera del rango representable. Teléfono solo exige al menos nueve dígitos, aunque el error anuncia nueve.
- Media — cargarPedidos verifica únicamente que el JSON sea un array. Entradas como [null] o total de tipo string pueden romper pintarHistorial. El historial crece sin límite; almacena nombre, teléfono y notas sin caducidad.
- Media — A <=880 px se oculta nav.links (264), pero no hay botón de menú en el HTML ni controlador. Se pierde el acceso directo a esa navegación; cabecera con logo, historial y CTA sin regla específica de ajuste: riesgo de desbordamiento a 320/375 px, pendiente de prueba visual.
- Media — Diapositivas inactivas se ocultan solo con opacity:0; sus enlaces siguen en el foco y pueden interceptar clics. FAQ no actualiza aria-expanded. No existe h1. Revisar teclado y semántica.
- Media — Facebook, TikTok y tres enlaces legales tienen href="#". Las anclas internas con destino no vacío sí existen. Instagram tiene URL concreta y enlaces externos usan rel=noopener; no se verificó respuesta remota.
- Contenido — Hero promete el mismo día y FAQ 24–48 horas; FAQ menciona subir/encuadrar fotos sin control de subida en la página. Sedes se declaran referenciales. Confirmar promesas y direcciones.
- Rendimiento — Dos copias iguales del logo PNG incrustado: aproximadamente 90.6 mil caracteres cada una, cerca del 77% del HTML. Impiden caché independiente de ese recurso. Fuentes externas con display=swap; sin medición real de velocidad. No transformar el logo durante una futura optimización; extraer mismos bytes solo en cambio autorizado y revisado.
- Flujo — El formulario guarda en este navegador y prepara un enlace de WhatsApp; no registra pedidos en servidor. El texto de confirmación incluye nombre, código, servicio, tamaño, cantidad y total, pero omite notas y teléfono ingresados. Confirmar qué información necesita recibir el negocio.

## Precios protegidos
Tabla visible y configuración coinciden: 10x15 S/5; 13x18 S/7; 15x21 S/9; 20x30 S/18; 30x40 S/35. Descuentos coinciden en texto y función: 20+ 5%, 50+ 10%, 100+ 20%. El resto se cotiza a medida. Para 10x15, los resultados de referencia son 19=95, 20=95, 49=232.75, 50=225, 99=445.50 y 100=400 soles. No son pruebas de integración en navegador.

## Próximos pasos
1. Revisar y aprobar estas instrucciones.
2. Confirmar teléfonos por sede y general, direcciones y plazos.
3. En otro PR autorizado, corregir inyección y confirmación desactualizada, después validación y navegación móvil.
4. Probar cotizador y móvil en copia de revisión, verificar logo y precios contra la base y revisar antes de publicar.
