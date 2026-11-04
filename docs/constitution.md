# Constitución — TuFranquiciaBO

Principios innegociables. Toda spec, plan y tarea debe cumplirlos.

1. **Frontend local y sin backend**: app React Native (Expo) para Android.
   Toda la persistencia es local en SQLite vía expo-sqlite. Nada de red,
   ni APIs, ni autenticación real mientras no exista el backend
   (spec 004 / P2 del roadmap). El registro de usuario y las solicitudes
   (tickets) son locales-first: viven en SQLite listos para sincronizar.
2. **La spec manda**: ningún comportamiento se implementa si no está en la
   spec activa. Si falta una decisión, se detiene el trabajo y se pregunta.
3. **Lógica separada de interfaz**: la capa de datos (repositorios) y la
   de estado (stores) no contienen nada de UI. Toda la lógica de negocio
   es testeable sin pantallas.
4. **Tests como puerta**: cada tarea termina con sus tests en verde.
   Prohibido avanzar con tests en rojo.
5. **Datos locales y transparentes**: SQLite único (`tufranquiciabo.db`)
   con 20 franquicias de ejemplo precargadas en el primer arranque.
6. **Idioma**: código e identificadores en inglés; todo el contenido de la
   app (UI, mensajes, datos de franquicias y documentación) en español.
7. **Diseño corporativo fijo**: la identidad visual oficial es la de la
   imagen de referencia del sponsor (enviada 2026-11-02, aplicada en la
   spec 003); antes de esa fecha era azul (#1B4965) + dorado (#D4A843).
   No se introducen colores o estilos nuevos sin consultar.