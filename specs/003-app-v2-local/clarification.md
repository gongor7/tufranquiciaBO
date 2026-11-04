# Clarificación — Spec 003 (App v2 local-first)

## Decisiones del sponsor (2026-11-03)

| Duda | Decisión |
|---|---|
| ¿Backend y panel admin ahora? | **No — local-first.** Tickets y registro viven en SQLite, diseñados para sincronizar cuando exista backend (spec 004 / P2). |
| ¿Paleta y logo nuevos? | **Sí, desde la imagen de referencia enviada por WhatsApp** (archivo en la raíz del proyecto). Extracción programática; constitución actualizada con visto bueno. |
| ¿Registro autoservicio de oportunidades? | **Se quita.** CTA "Quiero publicar mi negocio" → WhatsApp al canal de atención. Contenido gestionado por el panel admin (spec 004). |
| ¿Login con contraseña? | **No por ahora.** Registro local sin contraseña: nombre completo, usuario, correo, celular + checkbox de Términos y Condiciones. Migra a cuenta real con el backend. |

## Revisión QA de la spec
- Chat eliminado → la pestaña Mensajes se reemplaza por "Solicitudes"
  (tickets) para no perder el conteo de interacciones.
- El seed vuelve a sembrarse por reconstrucción de esquema v3: los datos
  de demo se regeneran (comportamiento ya conocido y aceptado en v2).
- TyC: se persiste la aceptación (timestamp implícito en created/updated)
  para evidencia futura.
- Filtros: se retiran industria y rango; texto + departamento + verticales
  es el conjunto mínimo sin resultados vacíos sorpresa.
- Empleados/hitos/planes se ocultan en UI pero se mantienen en BD y en el
  DTO para el panel administrativo (spec 004).

## Dudas abiertas
- Ninguna.
