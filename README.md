# Atlas Astrológico

Prueba de concepto en Next.js de dos perspectivas de un mismo instante:

- **Global:** longitudes eclípticas tropicales geocéntricas de diez cuerpos y aspectos mayores con orbe máximo de 5°.
- **Local:** Ascendente y Medio Cielo aproximados, más altura sobre el horizonte de cada cuerpo para cuatro ciudades.

## Ejecutar

```bash
npm install
npm run dev
```

Abrir http://localhost:3000. Cambia fecha/hora local y ciudad. La fecha se convierte a UTC desde la zona horaria del navegador; los cálculos planetarios usan `astronomy-engine` en el servidor.

## Alcance y límites

Los aspectos, nombres y colores son convenciones astrológicas interpretativas, **no mediciones físicas de energía ni predicciones**. La bolita indica cuántos aspectos mayores entran en el orbe de 5°; no implica un índice validado de intensidad. Ascendente y Medio Cielo usan tiempo sidéreo local y oblicuidad media fija: son aproximados. No hay sistema de casas, astrocartografía, coordenadas libres, ni análisis estadístico. Antes de producir una carta completa, contrastar los ángulos con efemérides de referencia y decidir convenciones (zodiaco, casas, orbes y topocentría).

## Veredicto del prototipo

Validar con `npm run build` y probar `/api/chart` con dos ciudades: las longitudes planetarias deben permanecer iguales y ASC/MC deben variar. La interfaz permite comprobarlo cambiando el selector de ciudad.
# atlas-astrologico
