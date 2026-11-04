# Tareas — Spec 003

- [x] T25. Docs SDD (spec, clarification, plan, tasks), constitución y
      roadmap actualizados. Hecho cuando: docs reflejan las decisiones del
      sponsor y los RF reemplazados están anotados.
- [x] T26. Esquema v3: `users` con registro (full_name, username,
      accepted_terms, registered) y tabla `tickets`; `messages` eliminada;
      reconstrucción versionada. (RF-37 datos, RF-40 soporte, RF-43) Hecho
      cuando: tests de reconstrucción v3 y presencia/ausencia de tablas en
      verde.
- [x] T27. Auth gate + WelcomeScreen: registro obligatorio con 4 campos +
      checkbox TyC; gate reactivo en navegación. (RF-37, RF-38, RF-39)
      Hecho cuando: tests de registrationSchema y user.repository en verde
      y la app bloquea hasta registrarse.
- [x] T28. Tickets + WhatsApp: botón "Solicitar información" crea ticket
      del perfil; "Conversar" abre WhatsApp; pestaña Solicitudes con
      contador; chat eliminado (pantallas, store, repo, ruta). (RF-40,
      RF-41, RF-42, RF-43, RF-44) Hecho cuando: tests de ticket.repository
      en verde y no quedan referencias a chat.
- [x] T29. Perfil simplificado: sin selector de rol ni "Publicadas";
      contacto editable + Favoritos + Solicitudes con contador. (RF-45)
      Hecho cuando: demo manual del perfil y tests de perfil en verde.
- [x] T30. Explorador simple + favoritos transversales: sin filtros de
      industria/rango; favorito en tarjetas de las 4 verticales. (RF-46,
      RF-47) Hecho cuando: tests de buildWhereClause reducido en verde y
      botón visible en Explorar/Portada.
- [x] T31. Detalle estilo Play Store: MediaCarousel con dots, logo
      cabecera, Requisitos clave (royalty + capacitación + rango con
      subtipo), video por enlace, ocultar empleados/hitos/plan. (RF-48,
      RF-49, RF-50, RF-51) Hecho cuando: demo manual del detalle de cada
      vertical.
- [x] T32. Identidad visual: paleta extraída de la imagen de referencia
      aplicada a theme y app.json. Hecho cuando: la app en dev refleja la
      nueva paleta y tsc/eslint/jest siguen en verde.
- [x] T33. Cierre: docs/playstore-checklist.md, `tsc`+`eslint`+`jest`
      verde, demo manual completa, versión 1.2.0 (versionCode 3). Hecho
      cuando: checklist documentado y matriz RF→test completa. ✓

- [x] T34. Iconografía profesional: reemplazo total de emojis de UI por
      iconos vectoriales (Ionicons vía @expo/vector-icons, dependencia
      justificada: pedido explícito del sponsor de look profesional;
      paquete oficial de Expo con fuentes incluidas). Componente Icon,
      mapas por industria/segmento, tabs, tarjetas, detalle, solicitudes,
      perfil, registro y onboarding. Hecho cuando: sin emojis en UI,
      tsc/eslint/jest en verde y verificación visual en dev.

## Matriz RF → tarea → test

| RF | Tarea | Test |
|---|---|---|
| RF-37 | T26/T27 | `registration.test.ts` (gate) |
| RF-38 | T27 | `segmentValidators`/`validators` → registrationSchema |
| RF-39 | T27 | `user.repository` (register/isRegistered) |
| RF-40 | T28 | `ticket.repository.test.ts` |
| RF-41 | T28 | demo manual (deep link) |
| RF-42 | T28 | `ticket.repository.test.ts` (count) |
| RF-43 | T26/T28 | `schema` v3 (messages ausente) |
| RF-44 | T28 | demo manual (CTA WhatsApp) |
| RF-45 | T29 | demo manual + tests perfil |
| RF-46 | T30 | `franchiseQueries` reducido |
| RF-47 | T30 | demo manual + favoritos existentes |
| RF-48..RF-51 | T31 | demo manual |
