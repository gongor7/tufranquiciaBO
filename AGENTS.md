# AGENTS.md — TuFranquiciaBO

## Proyecto
App móvil Android (React Native + Expo) que conecta inversionistas con
franquicias disponibles en Bolivia. Persistencia 100% local en SQLite
(expo-sqlite) con 20 franquicias de ejemplo precargadas. Sin backend,
sin APIs y sin autenticación real en el MVP. Interfaz completa en español,
tema corporativo azul (#1B4965) y dorado (#D4A843).

## Comandos
- Instalar dependencias: `npx expo install`
- Ejecutar (dev): `npx expo start`
- Ejecutar (Android): `npx expo start --android`
- Tests: `npx jest`
- Lint: `npx eslint .`
- Tipos: `npx tsc --noEmit`

## Estilo y convenciones
- TypeScript en modo estricto. Nombres: `camelCase` (variables/funciones),
  `PascalCase` (componentes, tipos, clases), `SCREAMING_SNAKE` (constantes).
- Código e identificadores en inglés; UI, datos de franquicias y docs en español.
- Funciones puras fuera de los componentes; componentes sin lógica de datos.
- Uso de React Hook Form + Zod para formularios; Zustand para estado global.

## Reglas
- Lee `docs/constitution.md` y la spec activa (specs/001-*/spec.md) antes de tocar código.
- No se modifica la paleta de colores ni la tipografía sin consultar.
- No se añade ninguna dependencia sin justificarla en el plan.
- No se escribe ningún texto de UI en inglés.

## Al terminar cualquier tarea
- Ejecutar `npx tsc --noEmit`, `npx eslint .` y `npx jest` y confirmar que
  todo pasa. Verificar también que la tarea cumple su "Hecho cuando:" de tasks.md.