# RAMS Planner — Diseño de sistema

> Nombre provisional. Herramienta de planificación y cálculo de carga de trabajo
> para equipos de ingeniería que trabajan en varios proyectos a la vez.

Este directorio contiene el **diseño completo** de la herramienta, escrito antes de
la primera línea de código de producción. Es un diseño **desde cero**: no reutiliza
el esquema ni el código del sistema RAMS actual del repositorio (ver
[ADR-0001](09-decisiones-adr.md)).

## Índice

| # | Documento | Qué responde |
|---|-----------|--------------|
| 01 | [Objetivos y principios](01-objetivos-y-principios.md) | Qué debe hacer, qué **no** debe hacer, y las 7 reglas que gobiernan todas las demás decisiones |
| 02 | [Modelo de dominio](02-modelo-de-dominio.md) | Los conceptos, sus invariantes y el vocabulario único del sistema |
| 03 | [Esquema de datos](03-esquema-de-datos.md) | Tablas, relaciones y por qué cada una es como es · DDL en [`schema.sql`](schema.sql) |
| 04 | [Motor de cálculo](04-motor-de-calculo.md) | Calendarios, CPM, distribución temporal de carga, nivelación. Con pseudocódigo |
| 05 | [Arquitectura técnica](05-arquitectura-tecnica.md) | Paquetes, capas, stack, API, despliegue, pruebas |
| 06 | [Auditoría y explicabilidad](06-auditoria-y-explicabilidad.md) | Cómo se responde a «¿de dónde sale este número?» |
| 07 | [Interfaz y vistas](07-interfaz-y-vistas.md) | Las 8 pantallas y qué pregunta contesta cada una |
| 08 | [Plan de implementación](08-plan-de-implementacion.md) | Fases, criterios de aceptación, esfuerzo |
| 09 | [Decisiones (ADR)](09-decisiones-adr.md) | Las 14 decisiones estructurales, con sus alternativas descartadas |
| — | [Prompt inicial](PROMPT-INICIAL.md) | Prompt autocontenido para arrancar el proyecto desde un repositorio vacío |

## Resumen en una página

**El problema real.** Un equipo de N ingenieros repartido entre M proyectos. La
pregunta que la herramienta debe contestar, en cualquier momento y sin ambigüedad:

> *¿Cuántas horas tiene comprometidas cada persona, cada mes, en cada proyecto —
> y cuánta capacidad le queda?*

Y la de segundo orden, que es la que decide contratos:

> *Si acepto este proyecto nuevo, ¿quién se satura, cuándo, y cuánto?*

**La idea central.** El sistema separa de forma absoluta tres cosas que Microsoft
Project mezcla, y esa mezcla es la razón por la que nadie se fía de sus números:

```
   DECLARADO                 DERIVADO                   REAL
   lo que tú afirmas    →    lo que el motor calcula  ←  lo que pasó
   (duración, trabajo,       (fechas, holgura,           (partes de horas,
    dependencias,             carga mensual,               avance reportado)
    disponibilidad)           saturación)

   editable                  NUNCA editable             editable, con fuente
   tabla `tasks`             tabla `*_results`          tabla `actuals`
                             ligada a un `calculation_run`
```

Nada derivado se guarda junto a lo declarado. Todo valor derivado pertenece a una
**ejecución de cálculo** (`calculation_run`) identificada, con versión de motor y
hash de entradas. Dos ejecuciones se pueden comparar campo a campo. Una línea base
no es un tipo de dato especial: es simplemente una ejecución congelada.

**El motor es una función pura.** `calcular(PlanSnapshot) → PlanResult`. Sin base de
datos dentro, sin reloj dentro, sin aleatoriedad. Mismo snapshot ⇒ mismo resultado,
bit a bit, hoy y dentro de tres años. Eso es lo que hace el sistema auditable: puedes
coger el snapshot de entrada de un cálculo de hace un año, pasarlo por la CLI y
reproducir exactamente el número que hay en aquel informe.

**Toda unidad es entera.** El tiempo se mide en **minutos laborables** (`integer`),
nunca en días decimales; el dinero en **céntimos** (`bigint`). Cero aritmética de
coma flotante en el núcleo, cero deriva de redondeo al agregar 250 días en un mes.

**La adaptabilidad es de diseño, no un parche.** Un único árbol WBS recursivo en vez
de la jerarquía rígida Proyecto→Paquete→Actividad; campos personalizados definidos
por el usuario como datos, no como migraciones de esquema; reglas de aviso
declarativas. Lo que hoy es «tag RAMS» y mañana es «nivel SIL» o «centro de coste»
no debe tocar el esquema.
