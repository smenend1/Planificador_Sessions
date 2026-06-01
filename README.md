# Planificador docent · Sessions i seguiment de curs

PWA educativa en català per planificar sessions de classe, fer seguiment del curs i reprogramar automàticament les sessions quan hi ha incidències.

## Funcions de la versió 0.1.0

- Creació de grups per nivell, grup i assignatura.
- Definició de curs acadèmic, dates d'inici/final i dies de classe.
- Sessions numerades amb títol, què es treballarà, objectiu, activitats, recursos i observacions.
- Assignació automàtica de dates segons els dies de classe.
- Incidències per vaga, falta del docent, excursió, festa, activitat de centre, avaluació o altres motius.
- Reprogramació automàtica de sessions futures quan una data queda bloquejada.
- Estats de sessió: prevista, feta, parcial, ajornada, cancel·lada i substituïda.
- Estadístiques bàsiques de final de curs.
- Exportació i importació JSON.
- Resum HTML imprimible/desable com a PDF amb `window.print()`.
- Desament local amb `localStorage`.
- Service worker i cache bàsica per funcionament offline.
- Diagnòstic PWA.

## Publicació a GitHub Pages

1. Crea un repositori, per exemple `planificador-docent-sessions`.
2. Puja aquests fitxers a l'arrel del repositori:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `manifest.json`
   - `sw.js`
   - `README.md`
3. Ves a **Settings > Pages**.
4. Selecciona la branca principal i la carpeta arrel.
5. Desa i obre l'URL que genera GitHub Pages.

## Dades

Les dades es desen al navegador amb `localStorage`. És recomanable exportar una còpia JSON regularment.

## Reprogramació automàtica

La reprogramació elimina del calendari els dies bloquejats per incidències amb acció `ajornar` o `cancel·lar` i assigna les sessions no completades als següents dies disponibles. Les sessions marcades com a `feta` conserven la seva data real.

## Limitacions de la versió 0.1.0

- No inclou encara vista mensual de calendari.
- El manifest no inclou icones pròpies; es poden afegir en una versió posterior.
- La generació de PDF es fa mitjançant la funció d'impressió del navegador.
- No sincronitza dades entre dispositius.

## Pla de versions

### 0.2.0

- Importació parcial per grup.
- Millor duplicació per al curs següent.
- Filtres per estat.
- Resums per trimestre.

### 0.3.0

- Vista mensual de calendari.
- Colors per estat en calendari.
- Millora de la impressió.

### 1.0.0

- Versió estable, documentada i optimitzada per mòbil, tauleta i portàtil.
