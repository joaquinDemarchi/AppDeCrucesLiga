# Cruces Liga Profesional

Simulador de los playoffs de la Liga Profesional de Fútbol Argentino (formato Apertura/Clausura 2026).

## Formato del torneo

- 30 equipos en dos zonas de 15. Clasifican los **8 primeros de cada zona**.
- **Octavos** cruzados entre zonas: 1A vs 8B, 2A vs 7B, 3A vs 6B, 4A vs 5B y, al revés, 1B vs 8A, 2B vs 7A, 3B vs 6A, 4B vs 5A.
- **Cuadro fijo**: los primeros de cada zona sólo pueden cruzarse en la final.

| Parte alta | Parte baja |
|---|---|
| C1: G(1A-8B) vs G(4B-5A) | C3: G(1B-8A) vs G(4A-5B) |
| C2: G(2B-7A) vs G(3A-6B) | C4: G(2A-7B) vs G(3B-6A) |
| S1: G(C1) vs G(C2) | S2: G(C3) vs G(C4) |

  Final: G(S1) vs G(S2), en cancha neutral.
- Partido único. Si hay empate en los 90', se juega alargue y después penales. Es local el equipo mejor ubicado.

## Uso

Abrí `index.html` en el navegador. No necesita instalación ni build.

1. **Ordená las zonas**: arrastrá los equipos (o usá ▲ ▼). Vienen precargados los 30 equipos de Primera con la tabla provisoria.
2. **Cargá los resultados** de cada partido. El marcador incluye el alargue. Si hay empate, aparecen los casilleros de penales. El ganador avanza solo.
3. **Simular pendientes** completa al azar los partidos sin resultado. Los mejor ubicados y los locales tienen algo más de chance.

Todo se guarda en el navegador (`localStorage`).

## Estructura

```
index.html
css/styles.css
js/data.js      equipos y orden inicial de cada zona
js/bracket.js   lógica del cuadro (sin DOM)
js/app.js       interfaz: arrastrar y soltar, carga de resultados
tests/          tests de la lógica (node --test tests/*.test.js)
```

Para actualizar los equipos o el orden inicial, editá `js/data.js`.
