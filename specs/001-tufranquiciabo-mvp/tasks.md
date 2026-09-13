# Tareas — Spec 001

- [x] T1. Esqueleto del proyecto Expo: app creada con TypeScript, expo-sqlite,
      React Navigation (tabs + stack), Zustand, react-hook-form, zod, jest y
      eslint configurados. (RF: —) Hecho cuando: `npx tsc --noEmit`, `npx
      eslint .` y `npx jest` corren sin errores (0 tests).
- [x] T2. Capa de datos: db.ts (apertura + migración + seed), schema.ts y
      repositorios de user, franchise, message, favorite y onboarding.
      (RF-23, RF-24, RF-25) Hecho cuando: tests de crear BD, reconstrucción
      corrupta y seed de 20 franquicias en verde.
- [x] T3. Repositorio de franquicias: findAll con filtros combinados
      (industria, departamento, inversión), búsqueda por texto y orden
      recientes/populares/inversión; incremento de vistas. (RF-3..RF-9)
      Hecho cuando: tests de cada filtro, orden y búsqueda en verde.
- [x] T4. Repositorio de favoritos: añadir, quitar, listar y comprobar estado.
      (RF-10, RF-11) Hecho cuando: tests de añadir/eliminar/idempotente en verde.
- [x] T5. Repositorio de mensajes: crear conversación vía contacto, listar
      conversaciones con última acción, hilo por franquicia y marcar leído.
      (RF-12, RF-20, RF-21, RF-22) Hecho cuando: tests de crear, listar hilo y
      marcar leído en verde.
- [x] T6. Repositorio y lógica de usuario: perfil por defecto (rol
      inversionista), leer/actualizar perfil y comprobación de rol
      franquiciador. (RF-14, RF-14a, RF-17, RF-18, RF-19) Hecho cuando: tests
      de perfil por defecto, edición y rol en verde.
- [x] T7. Onboarding: carrusel de 4 pasos con "Saltar"/"Siguiente", indicador
      y persistencia del estado completado. (RF-1, RF-2) Hecho cuando: tests
      de estado (primera vez/completado) y demo manual del flujo OK.
- [x] T8. Portada (Home): barra de búsqueda, banner destacado, categorías y
      carrusel de populares con navegación al detalle. (RF-3, RF-4) Hecho
      cuando: demo manual muestra banner y carrusel; búsqueda filtra en vivo.
- [x] T9. Marketplace (Explorar): grid 2 columnas, filtros (industria,
      departamento, inversión), orden y estado vacío con limpiar filtros.
      (RF-5, RF-6, RF-7) Hecho cuando: tests de filtrado combinado y demo
      manual del grid con orden y vacío OK.
- [x] T10. Detalle de franquicia: métricas, descripción, contacto, incremento
      de vistas y botón de favorito alternante. (RF-8, RF-9, RF-10, RF-11)
      Hecho cuando: demo manual muestra toda la info, vista +1 y corazón
      alterna al tocar.
- [x] T11. Formulario de contacto: validación Zod y guardado del mensaje.
      (RF-12, RF-13) Hecho cuando: tests de validación (vacíos y email) y
      guardado correcto en verde.
- [x] T12. Registro de franquicia en 4 pasos con guard de rol franquiciador y
      vista previa. (RF-14, RF-14a, RF-15, RF-16) Hecho cuando: tests de
      validación por paso y demo manual publicando una franquicia nueva.
- [x] T13. Mensajes + Chat: lista de conversaciones, hilo con timestamp y
      respuestas. (RF-20, RF-21, RF-22) Hecho cuando: tests del hilo y demo
      manual enviando desde contacto y respondiendo OK.
- [x] T14. Perfil: mostrar datos, estadísticas (favoritos/consultas) y editar
      nombre/email/rol. (RF-17, RF-18, RF-19) Hecho cuando: tests de perfil
      por defecto y edición en verde.
- [x] T15. Tema y navegación global: paleta azul/dorado, tipografía, tabs y
      stack con las rutas de la spec. (RF-26, RF-27) Hecho cuando: demo manual
      recorre toda la app con el tema aplicado.
- [x] T16. Validación final: recorrer cada RF con su test, `tsc`, `eslint` y
      `jest` en verde + demo manual del flujo completo. (Todos) Hecho cuando:
      existe un test que cubre cada RF y la demo manual pasa sin errores.
      *(Absorbida por T24 de la spec 002.)*