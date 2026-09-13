# Tareas — Spec 002

Formato: tarea con RFs que cubre, criterios de aceptación ("Hecho cuando")
y verificación. Tests primero en T17–T19 (skill spec-driven-development:
cada tarea con Acceptance/Verify/Files).

- [x] T17. Esquema y seed multisegmento: columnas de segmento en
      `franchises`, tabla `milestones`, versión de esquema nueva,
      seed de 28 oportunidades (20 franquicias + 2 SRL + 2 SA + 2
      proyectos — uno vigente y uno vencido — + 2 MIPEs completos con
      hitos). (RF-28, RF-35, RF-36) Hecho cuando: tests de reconstrucción
      con esquema nuevo, conteo por segmento y persistencia de campos por
      segmento en verde. Archivos: `src/database/schema.ts`, `seed.ts`,
      `prepare.ts` (nuevo), `src/__tests__/multisegment.test.ts`. ✓
- [x] T18. Repositorio de oportunidades: filtro `segments` combinable con
      industria/departamento/inversión (rango sobre monto buscado),
      exclusión de proyectos vencidos en listados activos, creación por
      segmento y CRUD de hitos. (RF-29, RF-33, RF-34, RF-36) Hecho
      cuando: tests de filtros combinados por segmento, monto NULL/0,
      proyecto vencido y hitos en verde. Archivos:
      `src/database/repositories/opportunity.repository.ts` (ex
      franchise.repository.ts), `src/__tests__/`.
- [x] T19. Validadores Zod por segmento: sociedad (% 1–100), proyecto
      (fecha fin > inicio), MIPE (monto ≥ 0 opcional, pitch obligatorio),
      franquicia existente sin cambios. (RF-31, RF-31a) Hecho cuando:
      tests de validación por segmento en verde. Archivos:
      `src/utils/validators/`.
- [x] T20. Explorar y Portada multisegmento: chips de segmento combinables,
      accesos por segmento en portada, estados vacíos por segmento. (RF-29,
      RF-32) Hecho cuando: demo manual filtra por los 4 segmentos y la
      portada muestra los cuatro accesos. Archivos: `src/screens/`,
      `src/components/`.
- [x] T21. Detalle por segmento: secciones condicionales (sociedad,
      proyecto con vigencia, MIPE con pitch/video/hitos/plan). (RF-30,
      RF-34) Hecho cuando: demo manual muestra la sección propia de un
      ejemplo de cada segmento y el proyecto vencido figura como cerrado.
      Archivos: `src/screens/`, `src/components/features/`.
- [x] T22. Registro por segmento: selección de segmento en el paso 1 y
      pasos condicionales con validaciones propias. (RF-31, RF-31a) Hecho
      cuando: demo manual registra una sociedad y un MIPE, y los pasos
      bloquean con errores en español. Archivos: `src/screens/register/`.
- [x] T23. Perfil y estadísticas por segmento: contadores de favoritos y
      consultas siguen funcionando con oportunidades; textos neutros de
      plataforma. (RF-28) Hecho cuando: demo manual del perfil con datos
      de los 4 segmentos. Archivos: `src/screens/profile/`.
- [x] T24. Validación final: matriz RF→test (RF-1..RF-36), `npx tsc
      --noEmit`, `npx eslint .` y `npx jest` en verde + demo manual del
      flujo completo de los 4 segmentos (absorbe la T16 pendiente de la
      spec 001). (Todos) Hecho cuando: matriz completa y demo sin errores.

## Matriz de trazabilidad RF → tarea → test (completada en T24)

| RF | Tarea | Test |
|---|---|---|
| RF-1..RF-27 | spec 001 (T1–T15, hechas) | suites existentes en `src/__tests__/` |
| RF-28 | T17 | `src/__tests__/multisegment.test.ts` (subtipos por segmento) |
| RF-29 | T18 | `src/__tests__/opportunity.repository.test.ts` (segmento + combinados) |
| RF-30 | T21 | demo manual + datos de seed |
| RF-30 (MIPE) | T17/T21 | `src/__tests__/multisegment.test.ts` (perfil completo + hitos) |
| RF-31/31a | T19 | `src/__tests__/segmentValidators.test.ts` |
| RF-32 | T20 | demo manual: accesos por segmento en portada |
| RF-33 | T18 | `src/__tests__/opportunity.repository.test.ts` (monto NULL/0) |
| RF-34 | T18 | `opportunity.repository.test.ts` + `multisegment.test.ts` (vencido) |
| RF-35 | T17 | `src/__tests__/multisegment.test.ts` (28 registros + reconstrucción) |
| RF-36 | T17/T18 | `multisegment.test.ts` + `opportunity.repository.test.ts` |
