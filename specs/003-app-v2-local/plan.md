# Plan técnico — Spec 003 (App v2 local-first)

## Modelo de datos (esquema v3)
- `users` += `full_name TEXT`, `username TEXT`, `accepted_terms INTEGER
  0/1`, `registered INTEGER 0/1` (rol por defecto `inversionista`; el
  selector de rol desaparece de la UI).
- `tickets` (id, franchise_id FK, full_name, email, phone, status
  `nuevo|atendido`, created_at) — reemplaza a `messages` (tabla eliminada).
- Reconstrucción por `PRAGMA user_version` (SCHEMA_VERSION = 3), igual que
  la v2: al detectar versión anterior se dropea y re-seedea (28
  oportunidades). Los tickets/usuarios de demo no se preservan.

## Módulos
- `src/utils/validators.ts`: `registrationSchema` (Zod: 4 campos +
  `acceptedTerms` literal true).
- `src/database/repositories/user.repository.ts`: `isRegistered()`,
  `register(dto)` (marca registered + terms), `getProfile()` se mantiene.
- `src/database/repositories/ticket.repository.ts` (nuevo): `create(dto)`,
  `list()`, `countByStatus()`, `markAttended(id)`.
- `src/stores/useTicketStore.ts` (nuevo, sustituye a useMessageStore).
- `src/navigation/`: `AuthGate` reactivo en RootNavigator (estado del store
  en vez de initialRouteName). Stack: `Welcome` (registro+TyC) antes de
  MainTabs; rutas `Chat` y `Register` eliminadas.
- Pantallas: `WelcomeScreen` (nueva, auth), `TicketsScreen` (nueva, tab
  "Solicitudes"), eliminadas `ChatScreen`/`MessagesScreen`/`RegisterScreen`.
- `FranchiseCard`: implementar `showFavorite` con toggle optimista vía
  `useFranchiseStore.toggleFavorite`.
- `MediaCarousel` (nuevo): FlatList horizontal + dots, imágenes por slug
  (pool actual ampliado a 2–3 por oportunidad).
- Detalle: secciones "Requisitos clave" (royalty, capacitación, rango con
  subtipo), logo cabecera, video como Linking, ocultar empleados/hitos/plan.
- `src/theme/index.ts` + `app.json`: paleta extraída de la imagen de
  referencia (Pillow) y aplicada; constitución actualizada.
- WhatsApp: helper `openWhatsApp(phone, message)` en `src/utils/links.ts`;
  número de atención general en `src/constants/support.ts`.

## Decisiones técnicas
- Gate reactivo con Zustand (no navegación condicional one-shot) →
  soporta logout futuro sin re-architecture.
- Tickets como tabla propia (no reutilizar messages) → contrato limpio
  para el sync del spec 004.
- Carrusel sin dependencias (FlatList + pagingEnabled) → cumple regla de
  no añadir dependencias sin justificar.
- Video por Linking (ya usado para WhatsApp/MIPEs) → idem.

## Estrategia de tests
- Esquema v3: reconstrucción desde v2, tablas tickets presente, messages
  ausente, usuarios con campos nuevos.
- registrationSchema: casos válidos/inválidos/TyC sin marcar.
- user.repository: register marca registrado; isRegistered refleja estado.
- ticket.repository: crear desde perfil, listar, contar, atender.
- franchiseQueries.buildWhereClause: sin industry/min/max (se ignoran),
  con texto/departamento/segmentos.

## Orden
T26 esquema → T27 auth → T28 tickets/WhatsApp → T29 perfil → T30
explorador/favoritos → T31 detalle → T32 tema → T33 cierre.
