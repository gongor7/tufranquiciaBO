# Spec 001 — MVP de TuFranquiciaBO

## Contexto y objetivo
En Bolivia no existe una vía accesible para que inversionistas encuentren
oportunidades de franquicia y para que los franquiciadores lleguen a
inversionistas interesados. TuFranquiciaBO es una app móvil Android que
centraliza franquicias disponibles, permite explorarlas con filtros,
registrar nuevas, guardar favoritas y contactar al franquiciador, todo con
persistencia local (sin backend) como base para validar el concepto.

## Usuarios
Inversionistas que buscan una franquicia en Bolivia y franquiciadores que
quieren publicar y promocionar su modelo. Un solo dispositivo; sin cuentas
remotas ni sincronización. Dos roles locales: `inversionista` y
`franquiciador`.

## Historias de usuario
- H1: Como inversionista quiero hacer un onboarding guiado la primera vez
  para entender qué ofrece la app.
- H2: Como inversionista quiero ver franquicias destacadas y populares en
  la portada para descubrir oportunidades sin buscar.
- H3: Como inversionista quiero buscar y filtrar franquicias por industria,
  departamento y rango de inversión para encontrar las que encajan conmigo.
- H4: Como inversionista quiero ver el detalle completo de una franquicia
  para evaluarla antes de contactar.
- H5: Como inversionista quiero guardar franquicias en favoritos para
  compararlas después.
- H6: Como inversionista quiero contactar al franquiciador para pedir
  información sin intermediarios.
- H7: Como franquiciador quiero registrar una franquicia en pasos para
  publicarla en la plataforma.
- H8: Como inversionista/franquiciador quiero un perfil con mi rol para
  personalizar la experiencia.
- H9: Como usuario quiero un chat por franquicia para mantener un hilo de
  conversación con el franquiciador.

## Requisitos funcionales (criterios de aceptación en EARS)

### Onboarding (H1)
- RF-1: CUANDO el usuario abra la app por primera vez (onboarding no
  completado), EL SISTEMA mostrará un tutorial de 4 pasos en español con
  botones "Saltar", "Siguiente" y un indicador de progreso.
- RF-2: CUANDO el usuario complete el onboarding (avance al final o pulse
  "Saltar"), EL SISTEMA marcará el estado como completado en SQLite y no
  volverá a mostrarlo en arranques posteriores.

### Portada (H2)
- RF-3: CUANDO el usuario esté en la pantalla Inicio, EL SISTEMA mostrará
  una barra de búsqueda, un banner con la franquicia destacada
  (`featured = 1`), las categorías disponibles y un carrusel de
  franquicias populares ordenadas por vistas descendente.
- RF-4: MIENTRAS el usuario escribe en la barra de búsqueda, EL SISTEMA
  filtrará las franquicias por coincidencia de texto en nombre y
  descripción (ignorando mayúsculas).

### Marketplace (H3)
- RF-5: CUANDO el usuario aplique filtros (industria, departamento y rango
  de inversión) en la pantalla Explorar, EL SISTEMA mostrará solo las
  franquicias que cumplan todos los filtros, en un grid de 2 columnas.
- RF-6: CUANDO el usuario ordene, EL SISTEMA ordenará las franquicias por:
  recientes (fecha de creación), populares (vistas descendente) o inversión
  (mínima ascendente/descendente). El seed inicial usa fechas de creación
  escalonadas para que el orden "recientes" tenga efecto observable.
- RF-7: MIENTRAS no exista ninguna franquicia que cumpla los filtros, EL
  SISTEMA mostrará un estado vacío con mensaje en español y opción de
  limpiar filtros.

### Detalle (H4)
- RF-8: CUANDO el usuario abra una franquicia, EL SISTEMA mostrará: logo
  (emoji), nombre, ubicación (departamento, ciudad), rango de inversión,
  ROI estimado, royalty, empleados requeridos, semanas de entrenamiento,
  descripción y datos de contacto.
- RF-9: CUANDO el usuario abra una franquicia, EL SISTEMA incrementará su
  contador de vistas en 1.

### Favoritos (H5)
- RF-10: CUANDO el usuario pulse el icono de favorito en una franquicia, EL
  SISTEMA la añadirá o eliminará de favoritos y persistirá el cambio.
- RF-11: CUANDO el usuario pulse el icono de favorito, EL SISTEMA
  alternará su estado visual (corazón lleno/vacío) de forma inmediata.

### Contacto (H6)
- RF-12: CUANDO el usuario envíe un formulario de contacto (nombre, email y
  mensaje obligatorios), EL SISTEMA validará los datos y guardará el
  mensaje asociado a la franquicia, confirmándolo con un aviso.
- RF-13: SI el formulario de contacto tiene campos obligatorios vacíos o un
  email no válido, ENTONCES EL SISTEMA mostrará errores de validación y NO
  guardará el mensaje.

### Registro de franquicia (H7)
- RF-14: CUANDO el perfil de usuario tenga rol `franquiciador` y complete el
  formulario de registro en 4 pasos (básica, financiero, operaciones,
  contacto), EL SISTEMA creará la franquicia con estado `activa` y la
  mostrará en el marketplace.
- RF-14a: SI el perfil de usuario no tiene rol `franquiciador`, ENTONCES EL
  SISTEMA mostrará un aviso pidiendo cambiar de rol en el Perfil antes de
  poder registrar una franquicia.
- RF-15: SI el usuario intenta avanzar de paso con campos obligatorios
  vacíos o valores inválidos (inversión mín > máx, royalty fuera de 0-100),
  ENTONCES EL SISTEMA no avanzará y mostrará los errores del paso actual.
- RF-16: CUANDO el usuario esté en el paso 4 del registro, EL SISTEMA
  mostrará una vista previa de la franquicia antes de confirmar la
  publicación.

### Perfil (H8)
- RF-17: CUANDO el usuario esté en la pantalla Perfil, EL SISTEMA mostrará
  su nombre, email, rol actual y estadísticas (número de favoritos y de
  consultas enviadas).
- RF-18: CUANDO el usuario edite su nombre/email/rol o cree su perfil, EL
  SISTEMA persistirá los cambios y actualizará la vista.
- RF-19: SI no existe un perfil de usuario, ENTONCES EL SISTEMA creará uno
  por defecto con rol `inversionista` y lo permitirá editar.

### Mensajes y chat (H9)
- RF-20: CUANDO el usuario envíe un mensaje por el formulario de contacto,
  EL SISTEMA creará una conversación con la franquicia y aparecerá en la
  lista de Mensajes.
- RF-21: CUANDO el usuario abra una conversación, EL SISTEMA marcará sus
  mensajes como leídos y mostrará el hilo con marca de tiempo y bandeja de
  texto para responder.
- RF-22: CUANDO el usuario responda dentro de una conversación, EL SISTEMA
  añadirá el mensaje al hilo con la fecha/hora actual. (Hilo único local por
  franquicia, sin distinción de rol en el emisor.)

### Reglas transversales
- RF-23: EL SISTEMA persistirá todos los datos (usuarios, franquicias,
  mensajes, favoritos, onboarding) en una única base SQLite local
  `tufranquiciabo.db`.
- RF-24: CUANDO la base de datos se cree por primera vez, EL SISTEMA
  insertará 20 franquicias de ejemplo (seed) con sus categorías y
  departamentos.
- RF-25: SI la base de datos local no existe o está corrupta, ENTONCES EL
  SISTEMA la reconstruirá con el seed inicial sin mostrar errores al usuario.
- RF-26: EL SISTEMA mostrará todo el contenido de la interfaz en español.
- RF-27: EL SISTEMA aplicará la paleta corporativa azul (#1B4965) y dorado
  (#D4A843) en toda la interfaz.

## Requisitos no funcionales
- Solo Android; orientación vertical.
- Respuesta de navegación fluida (sin bloqueos de UI al leer/escribir SQLite).
- Persistencia íntegra entre reinicios de la app.
- Interfaz en español, clara y accionable.
- Rendimiento: arranque con las 20 franquicias en <2 s en equipos medios.

## Casos límite ya cubiertos
- Primer arranque sin base de datos → se crea y se siembra (RF-24, RF-25).
- Base de datos corrupta → se reconstruye con el seed (RF-25).
- Búsqueda sin resultados → estado vacío (RF-7).
- Inversión min > max en registro → error de validación (RF-15).
- Perfil inexistente → se crea por defecto con rol inversionista (RF-19).
- Doble toque en favorito → comportamiento alternado, operación idempotente (RF-10, RF-11).
- Registro de nombre duplicado de franquicia → se permite (mismos nombres
  pueden existir; no se exige unicidad en el MVP).

## Fuera de alcance (MVP)
Autenticación real, backend, sincronización en la nube, pagos, subidas de
imágenes/logotipos reales (solo emoji), edición/borrado de franquicias,
chat en tiempo real con sockets, notificaciones push, modo oscuro y
multi-idioma.

## Criterios de finalización
- Todos los RF cubiertos por al menos un test automático y `npx jest` en
  verde, además de `npx tsc --noEmit` y `npx eslint .` sin errores.
- Demo manual en dispositivo/emulador Android del flujo: onboarding →
  portada → búsqueda con filtros → detalle → favorito → contacto →
  conversación → registro de franquicia → perfil.

## Dudas abiertas
- Ninguna. (Las dudas de la clarificación se resolvieron: registro exige rol
  `franquiciador` [RF-14a]; seed ordenable por criterio [RF-6]; chat como
  hilo único local [RF-22].)