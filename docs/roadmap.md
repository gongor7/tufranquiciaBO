# Roadmap maestro — Plataforma de inversión (Frane/Franep)

Fuente: "Resumen Ejecutivo de Requerimientos — Proyecto de Plataforma de
Inversión y Gestión de Negocios" (docs/, septiembre 2026) y la base ya
construida en `specs/001-tufranquiciabo-mvp/`.

## Nombre de marca
Durante el trámite ante SENAPI (≈6 meses de espera) el proyecto conserva el
nombre técnico **TuFranquiciaBO** y la UI usa textos neutros
("plataforma", "ecosistema"). El rebranding a **Frane/Franep** se ejecuta
solo tras la confirmación de disponibilidad de la marca.

## Flujo de trabajo (SDD)
Cada producto se desarrolla con el flujo completo:
Constitución → Spec → **Clarificación** → Plan → Tareas → Implementación
(una tarea a la vez, tests primero) → Validación → Cambio (primero la
spec, luego el código). Cada producto vive en `specs/NNN-<nombre>/` con
`spec.md`, `clarification.md`, `plan.md` y `tasks.md`.

## Productos entregables

| # | Producto | Alcance | Fase (reunión) | Dependencias |
|---|---|---|---|---|
| P1 | **Multisegmento local** (spec 002) | Los 4 segmentos de inversión en la app 100% local: franquicias (individual/departamental/nacional), sociedades SRL (capital social) y SA (acciones), sociedades accidentales (proyectos con vigencia), MIPEs/startups (perfil completo de incubación). Sin backend. | Fase 1 | — |
| P2 | **Backend y cuentas** | API + base de datos remota, registro/login real de usuarios, sincronización entre dispositivos. | Fase 1–2 | P1 |
| P3 | **Monitoreo contable** | "Internal Platform": carga contable obligatoria de franquiciados/socios, cálculo de regalías y utilidades en tiempo real, panel para inversionistas. | Fase 2 | P2 |
| P4 | **Mapa de Bolivia** | Mapa dinámico con pins por casa matriz y sucursales, densidad de mercado por departamento. | Fase 2 | P1 |
| P5 | **Monetización** | Corretaje (3% del canon de entrada), fee de cierre por inyección de capital, 20% sobre asesorías del marketplace interno (contadores/abogados/economistas), membresía anual de visibilidad. | Fase 2 | P2 |
| P6 | **Ciudadanía Digital (AGETIC) + NDA** | Integración de identidad con la API de Ciudadanía Digital, validación de identidad y Acuerdo de Confidencialidad (NDA) no repudiable antes de exponer datos sensibles (ROI real, manuales, recetas). **Último: requiere permiso y trámite previo con AGETIC.** | Fase 2–3 | P2 |
| P7 | **Expansión internacional** | Pasarelas de pago internacionales (PayPal), fiscalización digital transfronteriza, exportación de franquicias e inversión extranjera (Argentina/EE.UU.). | Fase 3 | P2, P5 |

## Alianzas (transversal, gestión comercial)
Mapeo de Gobernaciones, Alcaldías, CAINCO y Centros de Emprendimiento
(CAPs) para adopción institucional de la plataforma — fuera del alcance de
ingeniería, se gestiona en paralelo desde la Fase 2 (ver reunión, sección 5).

## Estado actual
- P1: **implementado** (spec 002, T17–T24 ✓). Base: spec 001 (T1–T16 ✓).
  Pendiente: demo manual en dispositivo Android.
- P2..P7: pendientes; se abre spec SDD por producto cuando corresponda.
