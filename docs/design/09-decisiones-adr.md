# 09 · Decisiones de arquitectura (ADR)

Cada decisión estructural, con lo que se descartó y por qué. Si dentro de dos años algo
parece una mala idea, aquí está el razonamiento que había detrás — y las condiciones
bajo las que habría que revisarlo.

---

## ADR-0001 · Reescritura desde cero

**Contexto.** Existe un sistema RAMS funcional con esquema, API y UI.

**Decisión.** Diseño y código nuevos. El sistema actual se mantiene en producción hasta
el fin de la fase 4 y luego se migran los datos.

**Por qué.** Los tres problemas del sistema actual son *estructurales*, no defectos:
(1) mezcla datos declarados y derivados en las mismas columnas; (2) jerarquía rígida de
tres niveles; (3) disponibilidad en JSONB no consultable ni auditable. Arreglar los tres
equivale a reescribir el esquema, los modelos, los controladores y las vistas — es
decir, a reescribir el sistema, pero arrastrando compromisos.

**Descartado.** Refactor incremental: dejaría un híbrido donde la mitad de las tablas
cumple P1 y la otra mitad no, que es peor que cualquiera de los dos extremos.

**Coste aceptado.** ~12 semanas y convivencia temporal de dos sistemas.

---

## ADR-0002 · Separación física entre lo declarado y lo derivado

**Decisión.** Tablas distintas, roles de base de datos distintos, permisos distintos.
El motor no puede escribir en lo declarado; la API no puede escribir en lo derivado.

**Por qué.** Es el principio P1 y la razón por la que la gente no se fía de Microsoft
Project. Hacerlo cumplir por convención falla en el tercer *hotfix*; hacerlo cumplir con
`GRANT` no falla nunca.

**Coste aceptado.** Más tablas, más JOINs, y siempre hay que saber de qué ejecución
vienen los números.

---

## ADR-0003 · Minutos y céntimos enteros

**Decisión.** Toda magnitud es un entero: minutos laborables, céntimos, puntos base.

**Por qué.** Exactitud por construcción al agregar miles de celdas. Los errores de
redondeo acumulados destruyen la confianza tan rápido como un error lógico y cuestan
mucho más diagnosticarlos.

**Descartado.** `NUMERIC(10,2)` en horas (arrastra redondeos al agregar), y coma
flotante (inaceptable para dinero y para sumas largas).

**Coste aceptado.** Conversiones en el borde de presentación y un tipo nominal por
unidad para que el compilador impida mezclarlas.

---

## ADR-0004 · Un árbol WBS recursivo

**Decisión.** Una tabla `wbs_node` auto-referenciada con `node_kind`, en lugar de
Proyecto → Paquete → Actividad.

**Por qué.** Cada nivel nuevo que pida la realidad es un `INSERT`, no una migración más
un despliegue. Es el principio P6 aplicado a la estructura.

**Descartado.** Tres tablas rígidas (el modelo actual): simple hoy, caro para siempre.

**Coste aceptado.** `path` materializado que la aplicación debe mantener al mover
subárboles, y consultas de agregación algo más complejas.

---

## ADR-0005 · Grano diario en la carga distribuida

**Decisión.** `assignment_timephased` a nivel de día; todo lo demás se agrega.

**Por qué.** El mes no es divisible uniformemente (festivos, calendarios distintos,
tareas que cruzan el cambio de mes). Guardar el día y agregar es exacto; guardar el mes
y prorratear es aproximado y no se puede deshacer. Además garantiza que ninguna vista
pueda contradecir a otra.

**Descartado.** Grano mensual (más pequeño, pero miente) y grano horario (exacto de más;
multiplica el volumen por 8 sin responder ninguna pregunta nueva).

**Coste aceptado.** ~100 000 filas por ejecución. Se gestiona con particionado y purga.

---

## ADR-0006 · SQL explícito, sin ORM

**Decisión.** `pg` + Kysely como constructor tipado. Las consultas de agregación se
escriben a mano.

**Por qué.** El valor del producto está concentrado en cinco consultas de agregación.
Un ORM las esconde tras una capa que hay que auditar *además* del SQL generado, y en
los casos con CTE recursivas y ventanas termina obligando a escribir SQL de todas
formas — pero peor integrado.

**Descartado.** Prisma (mal encaje con `daterange`, `EXCLUDE` y particionado), TypeORM.

**Coste aceptado.** Más código de mapeo, mitigado por la generación de tipos de Kysely
desde el esquema real.

---

## ADR-0007 · El motor es puro y corre en los dos lados

**Decisión.** `calculate()` sin I/O, empaquetado también para el navegador (web worker).

**Por qué.** Determinismo auditable (P2) y previsualización instantánea **sin** un
segundo motor aproximado. Dos motores siempre acaban dando dos números distintos, y el
usuario siempre cree al equivocado.

**Coste aceptado.** El snapshot completo debe caber en memoria del navegador para el
subgrafo editado. Mitigado: la previsualización sólo carga el subgrafo afectado.

---

## ADR-0008 · Las derivaciones son una salida de primera clase

**Decisión.** El motor emite trazas de derivación como parte de su resultado, no como
logging.

**Por qué.** P4 no se puede añadir después: exigiría reescribir cada paso del motor.
Un `console.log` no es una explicación navegable.

**Coste aceptado.** Volumen y algo de rendimiento. Mitigado con un sink desactivable
(coste cero en modo rápido) y purga por política.

---

## ADR-0009 · Las líneas base son ejecuciones congeladas

**Decisión.** `baseline` es una fila que apunta a un `calculation_run` inmutable.

**Por qué.** Evita las 11 series de columnas duplicadas de Microsoft Project
(`baseline1_start`, `baseline2_start`…), permite un número ilimitado de líneas base y
hace que comparar contra cualquiera de ellas sea el mismo `JOIN`.

**Coste aceptado.** Hay que retener los datos de las ejecuciones congeladas
indefinidamente, snapshot de entrada incluido.

---

## ADR-0010 · Nivelación heurística, desactivada por defecto

**Decisión.** Heurística determinista y reproducible, opcional, que escribe en una
columna separada (`leveled_minutes`) y nunca sobre `planned_minutes`.

**Por qué.** El problema es NP-duro. Prometer optimalidad sería mentir; automatizarla
sería mover el plan del usuario sin su permiso. Reproducible sí es exigible, y se logra
con desempates explícitos hasta el UUID.

**Descartado.** Solver de programación entera: mejores resultados, pero opaco (no
explicable, contra P4), dependencia pesada y no determinista entre versiones.

---

## ADR-0011 · Restricciones explícitas, deadlines blandos

**Decisión.** Arrastrar una barra del Gantt **nunca** crea una restricción en silencio:
abre un diálogo. Los deadlines no mueven nada, sólo generan hallazgos.

**Por qué.** Las restricciones fantasma son la causa nº 1 de planes de Project que nadie
consigue explicar. Un clic extra hoy evita semanas de desconcierto después.

**Coste aceptado.** Fricción deliberada en el Gantt.

---

## ADR-0012 · Campos personalizados como datos

**Decisión.** `field_definition` + `field_value`, con campos calculados en un DSL
acotado. Nada específico del dominio es una columna.

**Por qué.** Principio P6 y criterio de aceptación nº 5. Hoy es `rams_tag`; mañana será
SIL, norma, centro de coste o algo que aún no existe.

**Descartado.** Columnas con `ALTER TABLE` por cada necesidad (migración + despliegue), y
un JSONB libre (sin validación, sin metadatos, sin UI genérica).

**Coste aceptado.** Consultas más complejas y filtros que requieren un planificador de
consultas propio. Se mitiga con índices por `entity_id` y proyecciones materializadas de
los campos más usados.

---

## ADR-0013 · Sin escritura de `.mpp`

**Decisión.** El intercambio va por MS Project XML, Excel y CSV. `.mpp` se puede *leer*
vía MPXJ si algún día hace falta; no se escribe.

**Por qué.** `.mpp` es cerrado, no documentado y cambia entre versiones. Es un pozo sin
fondo que no sirve a ninguna de las 10 preguntas.

---

## ADR-0014 · Historial append-only con soft delete

**Decisión.** `change_event` inmutable, sin `UPDATE` ni `DELETE` para nadie. El borrado
de entidades es `deleted_at`.

**Por qué.** Principio P7. Un historial que se puede editar no es un historial.

**Coste aceptado.** Crecimiento lineal e ilimitado (particionado mensual; archivado a
almacenamiento frío por política), y todas las consultas deben filtrar `deleted_at IS NULL`
— se encapsula en vistas para que no se olvide.

---

## Decisiones abiertas

Requieren tu criterio antes de la fase 4:

| # | Pregunta | Recomendación |
|---|----------|---------------|
| A1 | ¿Autenticación propia o SSO del homelab (Authentik/Authelia)? | SSO si ya lo tienes montado; propia sólo si no |
| A2 | ¿Los ingenieros imputan horas en la herramienta o se importan de otro sistema? | Importar; un módulo de partes de horas es otro producto |
| A3 | ¿Multiusuario concurrente real o edición mayoritariamente individual? | Afecta a cuánta ingeniería merece la concurrencia optimista |
| A4 | ¿Hace falta el módulo de costes en la v1? | Está diseñado; se puede aplazar a la fase 6 sin deuda |
| A5 | ¿Idioma de la interfaz: español, inglés o ambos? | i18n desde el principio si la respuesta es «ambos» — añadirla después es caro |
