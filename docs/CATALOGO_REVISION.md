# Catálogo de revisión — Digital Express
Fecha: 14 de octubre de 2026.

## Qué incluye
Cinco fichas basadas en las láminas proporcionadas: álbum premium, álbum clásico, cuadros de madera, collage y paspartú.
Añade álbumes, restauración de fotos antiguas y fotos profesionales para LinkedIn al selector del cotizador. Los servicios nuevos no tienen precio automático.
Cada ficha permite indicar preferencias de color, tamaño/capacidad, cantidad, nombre, teléfono y notas. Preparar consulta genera un enlace codificado a 51968241599; el visitante revisa y envía el mensaje en WhatsApp. Editar campos invalida el enlace anterior. Las fichas no guardan datos del cliente.
El cotizador existente conserva su historial local.

## Imágenes
Son cinco PNG originales del catálogo aportado por el propietario; no fueron regenerados ni alterados. Las tarjetas usan un encuadre CSS y la ficha muestra la lámina completa. Se cargan con lazy loading y decoding async. Peso total aproximado: 10.3 MB sin compresión; optimizar para producción sigue pendiente. Los textos pequeños de las láminas no sustituyen las etiquetas del formulario.
Las fotografías de ambiente son referenciales. Se pide confirmar disponibilidad, medidas y capacidades porque las láminas contienen diferencias. No se agregaron tarifas ni capacidades fijas al cotizador.
Photobooks conserva su categoría propia, separada de álbumes. Las demás categorías existentes se mantienen.

## Comprobaciones ejecutadas
- Sintaxis válida de los dos scripts.
- Cinco fichas: abrir, cerrar, opciones, destinatario y mensaje con teléfono/notas/cantidad codificados.
- Editar invalida enlace; cantidades fraccionarias, no positivas o inseguras y teléfono inválido no generan enlace.
- Restauración y LinkedIn precargan el servicio del cotizador.
- Comparación exacta: logo incrustado, preciosImpresion y función de descuentos intactos. Respaldo sin cambios.
Pruebas funcionales con DOM simulado, sin envíos de mensajes.

## Pendiente de revisión
El navegador de revisión no pudo conectarse al servidor local. No se verificó visualmente en navegador ni móvil.
Antes de publicar: probar 320, 375, 768, 1024 y 1440 px, teclado/Escape, foco al cerrar ficha, zoom, encuadres de tarjetas y legibilidad. Optimizar peso de imágenes sin cambiar el aspecto del producto. Verificar medidas/capacidades con el propietario.
Este cambio parte del PR #2 y se revisa sobre su rama; integrar primero #2. Las guías reutilizables están en #1.
No fusionar ni desplegar automáticamente.

## Copia local
Abrir index.html en un navegador desde esta carpeta; conservar assets/catalogo junto al HTML. No requiere instalar dependencias. Los mensajes solo se envían cuando el visitante lo hace desde WhatsApp.
