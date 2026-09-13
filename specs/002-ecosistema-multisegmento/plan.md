# Plan técnico — Spec 002 (Ecosistema multisegmento)

## Clarificación aplicada
Decisiones registradas en `clarification.md` (2026-09-12): nombre neutral,
seed de 28 registros, MIPE con perfil completo, AGETIC fuera de este
producto (P6 del roadmap).

## Estrategia de modelo de datos
Se **mantiene la tabla `franchises`** como almacenamiento de la
oportunidad (evita reescribir FKs de `messages`/`favorites`, repositorios
y pantallas) y se generaliza a nivel de dominio con el tipo
`Opportunity`. La tabla se amplía con columnas explícitas por segmento
(sin JSON, para mantener queries SQL tipadas — constitución 3):

Columnas nuevas en `franchises`:
- `segment TEXT NOT NULL DEFAULT 'franquicia'` CHECK in
  (`franquicia`|`sociedad`|`proyecto`|`mipe`) — RF-28.
- `subtype TEXT` — franquicia: `individual`|`departamental`|`nacional`;
  sociedad: `srl`|`sa` (RF-28, RF-30).
- `sought_amount REAL` NULL — monto de participación buscado
  (sociedad/proyecto/MIPE). NULL = sin monto definido (RF-33). Se relaja el
  CHECK de `min_investment` a `>= 0` para admitir MIPEs con monto 0.
- `available_percentage REAL` CHECK 1–100 — % disponible en sociedades
  (RF-30, RF-31a).
- `project_start DATE` / `project_end DATE` NULL — vigencia de proyectos
  accidentales (RF-30, RF-34).
- `mipe_stage TEXT` CHECK in (`idea`|`validado`|`operativo`) (RF-30).
- `pitch TEXT` / `video_url TEXT` / `formalization_plan TEXT` NULL —
  perfil completo de MIPE (RF-30).

Tabla nueva:
- `milestones (id, franchise_id FK cascade, position, title,
  target_date NULL, completed 0/1)` — hitos de incubación del MIPE
  (RF-30, RF-36).

Nuevos índices: `segment`, `mipe_stage`.

**Migración**: se reutiliza el mecanismo de reconstrucción de la spec 001
(RF-25): se incrementa la versión del esquema; ante esquema viejo la BD se
recrea con el seed de 28 registros. No hay datos de usuario que preservar
(app de un dispositivo, sin cuentas).

## Cambios por módulo

### `src/database/`
- `schema.ts` → columnas/tabla/índices nuevos + versión de esquema (RF-28, RF-35, RF-36).
- `seed.ts` → seed de 28: 20 franquicias actuales + 2 SRL + 2 SA +
  2 proyectos (uno vigente, uno vencido para RF-34) + 2 MIPEs completos
  (con hitos). Datos realistas por departamento e industria (RF-35).
- `repositories/franchise.repository.ts` → renombrado a
  `opportunity.repository.ts`: `findAll` añade filtro `segments: string[]`
  combinable (RF-29); para sociedad/proyecto el rango de inversión aplica
  sobre `COALESCE(sought_amount, min_investment)`; exclusión de proyectos
  vencidos en listados activos (RF-34); creación de oportunidades por
  segmento; CRUD de hitos (RF-36).

### `src/types/index.ts`
- `Segment`, `FranchiseSubtype`, `SocietySubtype`, `MipeStage` (uniones).
- `Opportunity` = extensión de `Franchise` con campos de segmento +
  `milestones?: Milestone[]`.
- `CreateOpportunityDTO` por segmento (unión discriminada por `segment`).
- `Filters` añade `segments?: Segment[]`.

### `src/utils/validators/` (Zod)
- `franchiseSchema.ts` (existente, se conserva), `societySchema.ts`
  (participación 1–100), `projectSchema.ts` (fechas, fin > inicio),
  `mipeSchema.ts` (monto opcional ≥ 0, pitch obligatorio) — RF-31, RF-31a.

### Stores
- `useFranchiseStore` → `useOpportunityStore` (misma forma + filtro de
  segmentos); favoritos y mensajes no cambian.

### UI
- `ExploreScreen`: chips de segmento arriba de los filtros (RF-29); estado
  vacío menciona el segmento activo.
- `HomeScreen`: accesos por segmento en la fila de categorías y
  carrusel/destacados mixtos (RF-32).
- `FranchiseDetailScreen` → `OpportunityDetailScreen` con secciones
  condicionales por segmento: `SocietyDetailSection`,
  `ProjectVigenciaBadge`, `MipeProfileSection` (pitch, video como enlace,
  `MilestoneList`, plan de formalización) (RF-30).
- `RegisterScreen`: selección de segmento en el paso 1 y wizard con pasos
  condicionales según segmento (RF-31).
- Textos neutros ("plataforma"); sin colores nuevos (chips reusan tema).

## Decisiones técnicas (con alternativa descartada)
- **Columnas explícitas por segmento** en vez de tabla `opportunities`
  renombrada o campo JSON → menor riesgo sobre FKs existentes y queries
  SQL tipadas (constitución 3). El nombre técnico de tabla queda
  documentado como legacy.
- **Reconstrucción de BD en vez de migración incremental** → el mecanismo
  RF-25 ya existe y está testeado; la app es single-device sin datos que
  preservar.
- **Video de MIPE como enlace externo** en vez de reproductor → evita
  dependencias nuevas (regla: no añadir dependencias sin justificación).
- **Proyecto vencido calculado en consulta** (`project_end < date('now')`)
  en vez de job de fondo → determinístico y testeable.

## Estrategia de tests
- Repositorio contra BD en memoria: seed 28 por segmento (RF-35), filtro
  por segmento combinado (RF-29), rango sobre monto buscado (RF-33),
  proyecto vencido excluido (RF-34), hitos CRUD (RF-36), reconstrucción
  con esquema nuevo (RF-25/RF-35).
- Validadores Zod por segmento (RF-31a): % 1–100, fechas, MIPE monto 0.
- Persistencia: crear oportunidad de cada segmento, reabrir BD y verificar
  campos (RF-36).
- UI validada con demo manual (criterios de finalización).

## Orden de implementación (dependencias)
Esquema+seed (T17) → repositorio (T18) → validadores (T19) → pantallas
(T20–T23) → validación final (T24). Cada tarea con tests primero.
