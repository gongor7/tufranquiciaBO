# Clarificación — Spec 002 (Ecosistema multisegmento)

Fase explícita de clarificación (revisión "como QA" antes de planificar),
siguiendo el flujo SDD. Incluye las dudas resueltas con el sponsor y la
revisión de ambigüedades de la spec.

## 1. Decisiones del sponsor (sesión del 2026-09-12)

| Duda | Decisión |
|---|---|
| ¿Renombrar la app a Frane/Franep? | **No por ahora.** Nombre técnico TuFranquiciaBO; UI con textos neutros ("plataforma", "ecosistema"). Rebranding solo tras confirmación de SENAPI. |
| ¿Cantidad y reparto del seed? | **28 registros**: 20 franquicias actuales + 2 SRL + 2 SA + 2 sociedades accidentales + 2 MIPEs, datos realistas de Bolivia. |
| ¿Nivel de detalle de MIPEs? | **Perfil completo**: pitch, URL de video, hitos de incubación, plan de formalización detallado; monto buscado opcional (puede ser 0). |
| ¿Integración AGETIC (Ciudadanía Digital)? | **Fuera de este producto.** Va al final del roadmap (P6) porque requiere permiso/trámite previo con AGETIC. Ver docs/roadmap.md. |

## 2. Revisión QA de la spec (ambigüedades detectadas y resueltas)

- **¿Sociedades sin rango de inversión?** Una SRL/SA publica una
  "participación ofertada" con monto buscado y porcentaje disponible; el
  filtro de inversión aplica sobre el monto buscado. Resuelto en RF-29/RF-30.
- **¿Qué pasa con un proyecto accidental vencido?** Su estado pasa a
  `cerrada` al consultar (o no aparece en listados activos). Resuelto en RF-33.
- **¿MIPE sin monto?** El monto buscado es opcional; en el filtro de
  inversión un MIPE sin monto solo aparece cuando no se aplica filtro de
  monto. Resuelto en RF-33.
- **¿Compatibilidad con datos existentes?** La BD local se reconstruye con
  el nuevo seed (mecanismo de RF-25 de la spec 001); no hay migración de
  datos de usuarios porque la app es de un solo dispositivo y sin backend.
- **¿Los subtipos de franquicia cambian algo en detalle?** Sí: el subtipo
  (individual/departamental/nacional) se muestra como chip informativo; el
  resto de campos de franquicia no cambian (RF-30).

## 3. Lista de verificación QA aplicada

- [x] Estados vacíos por segmento (sin sociedades registradas, etc.).
- [x] Validaciones por segmento (% participación 1–100, fechas de vigencia,
      MIPE con monto 0 permitido).
- [x] Persistencia de los campos nuevos entre reinicios.
- [x] Casos límite: monto no definido, proyecto vencido, filtros sin
      resultados por segmento.
- [x] Idioma: todo texto de UI nuevo en español.
- [x] Paleta: sin colores nuevos; chips reusan tema azul/dorado.

## 4. Dudas abiertas

- Ninguna `[NECESITA ACLARACIÓN]` pendiente. Las decisiones se registran en
  la sección 1 y quedan reflejadas en spec.md.
