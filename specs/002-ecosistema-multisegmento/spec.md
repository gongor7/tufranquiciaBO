# Spec 002 — Ecosistema multisegmento

## Contexto y objetivo
La plataforma (nombre comercial pendiente de SENAPI; UI con textos neutros)
deja de ser un directorio de franquicias para convertirse en el punto de
encuentro de las cuatro formas de invertir en Bolivia descritas en el
resumen ejecutivo de requerimientos: franquicias, sociedades comerciales
(SRL/SA), sociedades accidentales o de cuentas en participación, y
emprendimientos (MIPEs/startups). Este producto extiende la app local
(sin backend) para que inversionistas exploren, filtren y evalúen los cuatro
segmentos, y franquiciadores/socios publiquen en el segmento que les
corresponde. La identidad digital y el NDA (AGETIC) quedan para un producto
posterior (docs/roadmap.md, P6).

## Usuarios
Los mismos de la spec 001 (inversionistas y publicadores con rol local
`inversionista`/`franquiciador`), ahora frente a cuatro segmentos:
- **Franquicia**: franquiciante que expande su marca (individual,
  departamental o nacional) y franquiciado que la adquiere.
- **Sociedad SRL**: socio capitalista que compra "capital social".
- **Sociedad SA**: inversionista que compra "acciones".
- **Sociedad accidental**: partes que se unen para un proyecto con
  fecha de inicio y fin (ej. stands de Fexpocruz).
- **MIPE/startup**: emprendimiento en incubación que busca visibilidad,
  formalización y una primera ronda.

## Historias de usuario
- H10: Como inversionista quiero filtrar el marketplace por segmento de
  inversión para comparar solo el tipo de oportunidad que me interesa.
- H11: Como inversionista quiero ver en el detalle los campos propios del
  segmento (royalty de franquicia, participación de una sociedad, vigencia
  de un proyecto, hitos de un MIPE) para evaluar correctamente.
- H12: Como publicador quiero registrar una oportunidad del segmento que
  corresponde, con un formulario adaptado a ese segmento.
- H13: Como inversionista quiero ver MIPEs con pitch, video e hitos de
  incubación para decidir si acompaño su formalización.
- H14: Como usuario quiero datos de ejemplo realistas de los cuatro
  segmentos al primer arranque para explorar la app sin cargar nada.

## Requisitos funcionales (criterios de aceptación en EARS)

### Segmentos (H10)
- RF-28: EL SISTEMA clasificará cada oportunidad en un segmento:
  `franquicia` (subtipo `individual`|`departamental`|`nacional`),
  `sociedad` (subtipo `srl` → participación = capital social | `sa` →
  participación = acciones), `proyecto` (sociedad accidental con fecha de
  inicio y fin) o `mipe` (emprendimiento en incubación).
- RF-29: CUANDO el usuario seleccione uno o más segmentos en Explorar, EL
  SISTEMA combinará ese filtro con industria, departamento y rango de
  inversión (para sociedades y proyectos el rango aplica sobre el monto de
  participación buscado).
- RF-30: CUANDO el usuario abra el detalle, EL SISTEMA mostrará la sección
  propia del segmento: franquicia → royalty, ROI, entrenamiento y subtipo;
  sociedad → tipo (SRL/SA), monto de participación buscado y porcentaje
  disponible (1–100); proyecto → objeto, fecha de inicio/fin y estado de
  vigencia; MIPE → etapa (`idea`|`validado`|`operativo`), pitch, video
  (enlace), hitos de incubación y plan de formalización.

### Registro por segmento (H12)
- RF-31: CUANDO el usuario con rol `franquiciador` registre una
  oportunidad, EL SISTEMA presentará el wizard adaptado al segmento
  elegido, con validaciones propias: porcentaje de participación entre 1 y
  100 (sociedades); fecha fin posterior a fecha inicio (proyectos); monto
  buscado opcional, admitiendo 0, para MIPEs.
- RF-31a: SI el usuario intenta avanzar de paso con campos inválidos para
  su segmento, ENTONCES EL SISTEMA no avanzará y mostrará los errores del
  paso actual en español.

### Portada (H14)
- RF-32: CUANDO el usuario esté en la portada, EL SISTEMA mostrará
  accesos por segmento (categorías) y carruseles/destacados que incluyan
  oportunidades de los cuatro segmentos.

### Reglas transversales y casos límite (H13, H14)
- RF-33: SI una sociedad se registra sin monto de participación definido,
  ENTONCES EL SISTEMA la listará normalmente pero solo la mostrará cuando
  no se aplique filtro de rango de inversión.
- RF-34: SI la fecha fin de un proyecto accidental ya venció, ENTONCES EL
  SISTEMA mostrará su estado como `cerrada` y lo excluirá de los listados
  activos (portada y explorar sin filtro explícito de vencidos).
- RF-35: CUANDO la base de datos se cree por primera vez, EL SISTEMA
  insertará 28 oportunidades de ejemplo (20 franquicias, 2 SRL, 2 SA,
  2 proyectos accidentales y 2 MIPEs) con datos realistas de Bolivia,
  reconstruyendo la BD existente con el mecanismo de la spec 001 (RF-25).
- RF-36: EL SISTEMA persistirá todos los campos nuevos de los segmentos
  (subtipo, monto de participación, porcentaje disponible, vigencia, etapa,
  pitch, video, hitos, plan de formalización) en SQLite entre reinicios.

## Requisitos no funcionales
- Los de la spec 001 siguen vigentes (Android, español, rendimiento,
  paleta azul/dorado, persistencia local íntegra).
- Sin nuevas dependencias: el mapa, video y pagos quedan fuera; el video
  del MIPE es un enlace externo (deep link al navegador).

## Casos límite
- MIPE con monto buscado 0 u omitido → visible salvo filtro de monto (RF-33).
- Proyecto con fecha fin = hoy → aún vigente; fecha fin < hoy → `cerrada`
  (RF-34).
- Porcentaje de participación fuera de 1–100 → error de validación (RF-31a).
- Filtro por segmento sin resultados → estado vacío con limpiar filtros
  (extensión de RF-7 de la spec 001).
- Segmento no elegido en el wizard → no se puede avanzar (RF-31a).

## Fuera de alcance (P1)
Backend y cuentas (P2), monitoreo contable (P3), mapa (P4), monetización
(P5), integración AGETIC/Ciudadanía Digital y NDA (P6), expansión
internacional (P7), edición/borrado de oportunidades, chat en tiempo real,
pagos, modo oscuro, multi-idioma.

## Criterios de finalización
- RF-28..RF-36 cubiertos por tests automáticos; `npx tsc --noEmit`,
  `npx eslint .` y `npx jest` en verde.
- Demo manual: explorar los 4 segmentos con filtros combinados, ver el
  detalle específico de un ejemplo de cada segmento, registrar una sociedad
  y un MIPE, y verificar persistencia tras reiniciar la app.

## Dudas abiertas
- Ninguna `[NECESITA ACLARACIÓN]`. Ver clarification.md (decisiones del
  2026-09-12: nombre neutral, seed de 28, MIPE perfil completo, AGETIC al
  final del roadmap).
