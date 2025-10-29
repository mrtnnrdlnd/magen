# MaGen

Ett litet JavaScript-projekt för att generera matris-multiplikationsövningar via URL-parametrar eller UI.

## Live demo
Besök den publicerade versionen på GitHub Pages:

https://mrtnnrdlnd.github.io/magen/

## Snabb användning
- Ange dimensioner för matris A och B i formuläret (rader × kolumner).
- Använd sliders för att välja procentsats för "hide" (göm) och "cross" (kryssa ut).
- Klicka "Apply" för att uppdatera URL och förhandsvisning. "Clear" återställer formuläret.

## URL‑parametrar
- `A` — dimensioner för A: `rows,cols` eller `rowsxcols` eller `n` (n×n). Ex: `A=3,4` eller `A=4`
- `B` — dimensioner för B, samma format som A
- `fill` — `index` (standard) eller `random`
- `seed` — seed för deterministisk random; `date` för dagens datum (ÅÅÅÅ‑MM‑DD)
- `copies` — antal instanser (heltal ≥ 1)
- `hide-prob-A/B/C`, `cross-prob-A/B/C` — procent (0–100) för göm/kryss per matris

Exempel:
- `https://mrtnnrdlnd.github.io/magen/?A=4,4&B=4,4&fill=random&hide-prob-C=100`
- `https://mrtnnrdlnd.github.io/magen/?A=1,9&B=9,1&fill=index&cross-prob-C=50&copies=2`

## Licens / Bidrag
Använd fritt och bidra gärna via PR eller issues.
