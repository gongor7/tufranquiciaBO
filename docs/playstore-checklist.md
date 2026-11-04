# Checklist — Publicación en Google Play Store

Guía de requerimientos técnicos y políticas para publicar la app (estado:
noviembre 2026, previo a la primera publicación).

## 1. Cuenta de desarrollador
- [ ] Crear **Google Play Developer Console** (pago único US$ 25).
- [ ] Verificar identidad del desarrollador (persona o empresa; para el
      ecosistema comercial conviene cuenta de **organización** con
      documentación legal de la sociedad constituida).
- [ ] Definir nombre visible del desarrollador y datos de contacto públicos.

## 2. Identidad y marca
- [ ] Confirmar la marca ante **SENAPI** (trámite en curso; ver
      docs/roadmap.md) antes de fijar el nombre público definitivo
      (Frane/Franep/TuFranquiciaBO).
- [ ] Ícono de app en alta resolución (512×512) con la identidad burdeos.
- [ ] Feature graphic (1024×500) y capturas de pantalla mínimo 2 (teléfono):
      - Onboarding/registro, Inicio (destacados), Explorar por segmento,
        Detalle con carrusel, Solicitudes, Perfil.
- [ ] Descripción corta (80 car.) y completa (4000 car.) en español.

## 3. Políticas de datos y privacidad (crítico)
- [ ] **Política de privacidad** pública (URL): qué datos se guardan
      (nombre, usuario, correo, celular, favoritos, solicitudes), dónde
      (SQLite local en el dispositivo), y el cambio futuro al backend.
- [ ] **Data safety** en Play Console: declarar recolección de nombre,
      correo y teléfono; declarar que hoy los datos **no salen del
      dispositivo**; cifrado en tránsito: NO aplica (sin red) hasta el
      backend (spec 004).
- [ ] Permisos solicitados: hoy **ninguno** sensible (expo-sqlite no
      requiere permisos; los enlaces de WhatsApp usan el navegador).
      Mantener así mientras se pueda.
- [ ] Cuenta de publicidad: no aplica (sin ads).

## 4. Requisitos técnicos
- [ ] **Target API level** vigente según Play Console (Expo SDK 57 cumple;
      verificar en cada actualización anual).
- [ ] Firma: keystore remoto de **EAS Build** ya fijado — exportar copia de
      respaldo y guardarla segura (sin ella no se pueden actualizar builds).
- [ ] Versión: `versionCode` incremental en cada release (actual: 3).
- [ ] AAB (bundle) para distribución en tienda: perfil `production` de
      eas.json (ya configurado); la APK actual es solo para distribución
      directa (perfil `preview`).
- [ ] Probar instalación limpia Y actualización sobre versión anterior
      ( SQLite migra por reconstrucción — verificar datos de registro y
      tickets tras actualizar).

## 5. Contenido y clasificación
- [ ] Cuestionario de clasificación de contenido (esperado: "Todos").
- [ ] Declarar contenido financiero: la app **no gestiona pagos ni
      inversiones reales** (catálogo + contacto) — aclarar en descripción
      para evitar revisión como servicio financiero regulado. Cuando se
      agreguen pagos (P5/P7), revisar políticas de servicios financieros.
- [ ] Términos y Condiciones internos: la casilla del registro enlaza el
      documento; publicar versión web del TyC y enlazarla (hoy el texto es
      local).

## 6. Pre-lanzamiento
- [ ] Ejecutar **pre-launch report** de Play Console en pista interna.
- [ ] Pruebas en dispositivo real (Redmi/HyperOS ✓, y un equipo gama baja).
- [ ] Cerrar pista interna → prueba cerrada (equipo) → producción.

## 7. Pendientes de producto antes de tienda (recomendado)
- [ ] Logo oficial de marca (imagen de referencia del sponsor) como ícono
      de app definitivo.
- [ ] Reemplazar `SUPPORT_WHATSAPP` (src/constants/support.ts) por el
      número oficial de atención.
- [ ] Pantalla "Acerca de / Términos" completa dentro de la app.
