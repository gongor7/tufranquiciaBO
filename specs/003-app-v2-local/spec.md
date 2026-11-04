# Spec 003 — App v2 local-first

## Contexto y objetivo
La plataforma pasa de catálogo abierto a app de inversión orientada a leads:
el usuario se registra al abrir (obligatorio), explora oportunidades,
solicita información con un toque (ticket) y conversa por WhatsApp. Se
elimina el chat interno y el autoservicio de publicación; el contenido lo
gestionará el panel administrativo del backend (spec 004 / P2). Todo
sigue siendo local-first: registro, tickets y favoritos viven en SQLite
hasta que exista sincronización.

## Usuarios
- **Inversionista** (rol por defecto y único visible): registra sus datos,
  explora, guarda favoritos y genera solicitudes.
- **Administrador** (futuro, spec 004): recibe los tickets en el panel web.
- Publicadores/emprendedores: canal manual asistido por WhatsApp.

## Historias de usuario
- H15: Como usuario quiero registrarme al abrir la app con mis datos de
  contacto para acceder al catálogo.
- H16: Como inversionista quiero solicitar información de una oportunidad
  con un solo toque, sin completar formularios.
- H17: Como inversionista quiero conversar directo por WhatsApp con el
  responsable de la oportunidad.
- H18: Como inversionista quiero ver mis solicitudes enviadas y su estado.
- H19: Como inversionista quiero guardar oportunidades de cualquier
  vertical en favoritos desde cualquier listado.
- H20: Como usuario quiero explorar sin filtros combinados que den
  resultados vacíos (solo texto, departamento y verticales).
- H21: Como usuario quiero ver el detalle estilo tienda: carrusel de
  imágenes, logo, requisitos clave y video del pitch.

## Requisitos funcionales (EARS)

### Registro obligatorio (H15)
- RF-37: SI el usuario abre la app sin registro completado, ENTONCES EL
  SISTEMA bloqueará la exploración y mostrará la pantalla de bienvenida
  con el flujo de registro (nombre completo, nombre de usuario, correo
  electrónico, celular) y rol Inversionista por defecto.
- RF-38: SI el usuario intenta registrarse sin aceptar los Términos y
  Condiciones (checkbox) o con campos inválidos, ENTONCES EL SISTEMA no
  completará el registro y mostrará los errores en español.
- RF-39: CUANDO el registro se complete, EL SISTEMA persistirá los datos
  en SQLite (incluida la aceptación de términos) y no volverá a pedirlos.

### Solicitudes y WhatsApp (H16, H17)
- RF-40: CUANDO el usuario pulse "Solicitar información" en un detalle, EL
  SISTEMA generará un ticket con los datos del perfil activo (sin
  formulario adicional), lo persistirá localmente y confirmará con un
  aviso.
- RF-41: CUANDO el usuario pulse "Conversar" (o el CTA de contacto), EL
  SISTEMA abrirá WhatsApp con mensaje preconfigurado al número de la
  oportunidad, o al número de atención general si no existe.
- RF-42: EL SISTEMA mostrará la pestaña "Solicitudes" con los tickets del
  usuario, su estado (nuevo/atendido) y un contador en el tab.
- RF-43: EL SISTEMA ya no ofrecerá chat interno: se eliminan las vistas,
  la lógica de conversaciones y los mensajes almacenados.

### Publicación por canal asistido
- RF-44: SI el usuario quiere publicar una oportunidad, ENTONCES EL
  SISTEMA ofrecerá un CTA "Quiero publicar mi negocio" que abre WhatsApp
  al canal de atención (sin formulario de autoservicio).

### Perfil (simplificado)
- RF-45: EL SISTEMA mostrará en Perfil únicamente: datos de contacto
  editables (nombre, teléfono, correo), rol activo en lectura, acceso a
  Favoritos y a Solicitudes con su contador.

### Explorador y favoritos (H19, H20)
- RF-46: EL SISTEMA limitará el filtrado a búsqueda por texto,
  departamento y verticales (segmentos); se eliminan los filtros de
  industria y rango de inversión para evitar combinaciones vacías.
- RF-47: EL SISTEMA ofrecerá el botón de favorito en las tarjetas de las
  4 verticales (Explorar, Portada, Favoritos) con actualización visual
  inmediata.

### Detalle estilo tienda (H21)
- RF-48: CUANDO el usuario abra un detalle, EL SISTEMA mostrará un
  carrusel de imágenes con indicador de posición y el logo en cabecera.
- RF-49: EL SISTEMA mostrará una sección "Requisitos clave" con el
  esquema de royalty y la capacitación obligatoria, junto al rango de
  inversión con topes mín/máx y la etiqueta del subtipo
  (individual/departamental/nacional).
- RF-50: SI la oportunidad tiene video de pitch, ENTONCES EL SISTEMA lo
  ofrecerá como enlace externo (sin reproductor embebido).
- RF-51: EL SISTEMA ocultará del detalle el número de empleados y las
  secciones de hitos y plan de formalización (se conservan en BD para el
  panel administrativo futuro).

## Requisitos no funcionales
- Sin nuevas dependencias; mismas convenciones (tests, tsc, eslint).
- Identidad visual según imagen del sponsor (extraída de la referencia
  enviada); textos 100% en español.

## Casos límite
- Usuario sin registro → gate bloquea todo (RF-37).
- Ticket sin correo en perfil → se guarda con lo disponible (correo
  obligatorio en el registro, así que siempre existe).
- Oportunidad sin WhatsApp → fallback al número de atención general (RF-41).
- Carrusel con una sola imagen → se comporta como imagen fija.

## Fuera de alcance
Backend y panel admin con tickets sincronizados (spec 004), edición de
contenido en la app, reproductor de video embebido, push, modo oscuro.

## Criterios de finalización
- RF-37..RF-51 cubiertos por tests (los de lógica) y demo manual del
  flujo completo; `tsc`, `eslint` y `jest` en verde.

## Dudas abiertas
- Ninguna `[NECESITA ACLARACIÓN]`. Ver clarification.md.

## Requisitos que reemplaza
- Spec 001: RF-12/13 (formulario de contacto → ticket sin formulario,
  RF-40), RF-20..22 (chat → eliminado, RF-43), RF-14..16 (registro de
  franquicia autoservicio → canal asistido, RF-44), RF-17..19 parcial
  (perfil simplificado, RF-45), RF-5 parcial (filtros, RF-46).
- Spec 002: RF-31/31a parcial (wizard por segmento deja de ser público).
