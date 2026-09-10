# Plan técnico — Spec 001

## Estructura de módulos
- `src/database/` → capa de datos SQLite (expo-sqlite).
  - `db.ts` → apertura, migración, seed (RF-23, RF-24, RF-25)
  - `schema.ts` → definición de tablas e índices (RF-23)
  - `seed.ts` → 20 franquicias, categorías y departamentos (RF-24)
  - `repositories/` → repositorios por entidad
    - `user.repository.ts` → perfil, rol (RF-17..RF-19)
    - `franchise.repository.ts` → CRUD, filtros, orden, vistas (RF-3..RF-9, RF-14)
    - `message.repository.ts` → conversaciones, mensajes, leídos (RF-12, RF-20..RF-22)
    - `favorite.repository.ts` → favoritos (RF-10, RF-11)
    - `onboarding.repository.ts` → estado del tutorial (RF-1, RF-2)
- `src/constants/` → `industries.ts`, `departments.ts` (RF-24, RF-27)
- `src/theme/` → paleta y tipografía (RF-27)
- `src/components/` → componentes de UI reutilizables
  - `ui/` → Button, Card, Input, Badge, EmptyState, etc.
  - `features/` → OnboardingCarousel, FranchiseCard, FilterSheet,
    ContactForm, ValuationSummary, ChatBubble, etc.
- `src/screens/` → pantallas
  - `onboarding/` → tutorial 4 pasos (RF-1, RF-2)
  - `home/` → portada (RF-3, RF-4)
  - `explore/` → marketplace con filtros y orden (RF-5, RF-6, RF-7)
  - `franchise-detail/` → detalle (RF-8, RF-9)
  - `register/` → registro multi-paso (RF-14, RF-15, RF-16, RF-14a)
  - `messages/` → lista de conversaciones (RF-20)
  - `chat/` → hilo (RF-21, RF-22)
  - `profile/` → perfil (RF-17, RF-18, RF-19)
- `src/store/` → stores Zustand finos que usan los repositorios
  - `useFranchiseStore`, `useUserStore`, `useMessageStore`,
    `useFavoriteStore`, `useOnboardingStore`
- `src/utils/` → `validators.ts` (Zod), `formatters.ts` (moneda USD, fechas)
- `src/types/` → tipos y DTOs de dominio

## Modelo de datos (tufranquiciabo.db)
`users` (id, name, email, phone, role check in/out inversionista|franquiciador,
avatar_url, created_at, updated_at)
`franchises` (id, user_id FK nullable, name, slug unique, logo_emoji, tagline,
description, industry, industry_emoji, country default 'Bolivia', department,
city, min_investment, max_investment, currency default 'USD',
royalty_percentage 0-100, royalty_type mensual|anual, estimated_roi,
employees_required, training_weeks, support_level basico|avanzado|premium,
website, contact_name, contact_email, contact_phone, whatsapp, featured 0/1,
status activa|pausada|cerrada, views_count, inquiries_count, created_at,
updated_at)
`messages` (id, franchise_id FK cascade, sender_name, sender_email,
sender_phone, message, is_read 0/1, created_at)
`favorites` (id, franchise_id FK cascade unique, created_at)
`onboarding_completed` (id, completed 0/1, completed_at)
Índices: industry, department, investment, status, featured, messages(franchise),
messages(is_read) — RF-23.

El seed inserta 20 franquicias con `created_at` escalonado (días distintos),
`featured` en 1-2 de ellas y `views_count` inicial variado para que los
órdenes "recientes" y "populares" sean distinguibles — RF-24, RF-6.

## Lógica de negocio
- **Filtros combinados (RF-5)**: AND entre industria, departamento y rango de
  inversión `[min ≤ max_origen] ∧ [max ≥ min_origen]`. Implementado con SQL
  parametrizado en el repositorio.
- **Orden (RF-6)**: `recientes` → `created_at DESC`; `populares` →
  `views_count DESC`; `inversión` → `min_investment ASC|DESC`.
- **Búsqueda (RF-4)**: `LOWER(name) LIKE %x% OR LOWER(description) LIKE %x%`.
- **Vistas (RF-9)**: UPDATE `views_count = views_count + 1` al abrir detalle.
- **Rol en registro (RF-14a)**: antes de mostrar el formulario se comprueba
  `users.role = 'franquiciador'`; si no, pantalla de aviso con acción
  "Cambiar rol en Perfil".
- **Validación de formularios (RF-15)**: Zod con reglas: min ≤ max;
  royalty 0-100; email válido; campos obligatorios no vacíos.
- **Chat (RF-21, RF-22)**: una conversación por franquicia = queryset de
  `messages` filtrado por `franchise_id`; `is_read` se pone a 1 al abrir.
  Hilo único local, emisor sin distinción de rol.

## Decisiones técnicas (con alternativa descartada)
- **expo-sqlite** en vez de AsyncStorage/MMKV → permite consultas SQL con
  filtros y orden sin cargar todo en memoria (constitución 1 y 5).
- **Repositorios + stores finos** en vez de lógica enlazada en pantallas →
  lógica testeable sin UI (constitución 3 y 4).
- **Emoji como logo** en vez de archivos de imagen → sin assets binarios en
  el MVP; el `logo_url` queda para imagen real en iteraciones futuras (spec).
- **Slider de inversión** en el detalle se muestra como rango formateado en
  vez de component custom → menos dependencias; gráficos fuera de alcance.
- **Zustand** como capa de estado leyendo repositorios, en vez de usar los
  hooks de expo-sqlite directamente en pantallas → testabilidad y reactividad
  (RF-11 requiere estado visual inmediato).

## Estrategia de tests
- Unitarios de repositorios contra una BD SQLite en memoria (tmp) para:
  filtros, orden, búsqueda, favoritos, mensajes, vistas y rol (RF-1..RF-22).
- Unitarios de validación Zod (RF-13, RF-15).
- Test de seed: 20 franquicias insertadas, 8 industrias, 9 departamentos.
- Test de reconstrucción: archivo corrupto/inexistente → seed completo (RF-25).
- Test de onboarding: primera vez vs. completado (RF-1, RF-2).
- El core de repositorios se testea sin componentes; las pantallas se
  validan con demo manual en dispositivo (criterios de finalización).

## Contratos de datos (DTOs)
- `CreateFranchiseDTO`: name, tagline, industry, description, minInvestment,
  maxInvestment, royaltyPercentage, estimatedRoi, employeesRequired,
  trainingWeeks, supportLevel, website, contactName, contactEmail,
  contactPhone, whatsapp.
- `ContactMessageDTO`: franchiseId, senderName, senderEmail, senderPhone?,
  message.
- `FiltersDTO`: text?, industry?, department?, minInvestment?, maxInvestment?,
  sortBy: 'recent' | 'popular' | 'investment' | 'investmentDesc'.
- `UserDTO/ProfileDTO`: name, email, phone?, role.