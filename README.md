# Planificador docent · Sessions i seguiment de curs

Versió: 0.2.0
Idioma: català
Pensada per a GitHub Pages i ús offline com a PWA.

## Finalitat

Aquesta PWA permet planificar sessions de classe per curs, grup i assignatura, assignar dates automàticament segons els dies de classe, registrar incidències i reprogramar les sessions futures quan un dia no es pot fer classe.

No substitueix una eina de programació didàctica completa. Està pensada per al dia a dia: saber què toca fer, què s'ha fet realment i què s'ha hagut d'ajornar.

## Novetats de la versió 0.2.0

- Migració automàtica de dades locals de la v0.1.0 quan existeixen.
- Filtres de sessions per estat, reprogramades i fora de calendari.
- Línia temporal de sessions i incidències.
- Avisos del grup: dates incompletes, sessions sense data, sessions fora de calendari i incidències sense motiu.
- Camp nou de bloc o unitat per sessió.
- Botons per moure sessions amunt o avall.
- Reprogramació més segura: les sessions fetes, parcials o substituïdes amb data real no es mouen.
- Estadístiques ampliades, incloent incidències per tipus i sessions fora de calendari.
- Importació JSON amb opció de substituir dades o afegir-les com a còpia.
- Resum imprimible més complet.
- Diagnòstic PWA amb recompte de caches detectades.

## Fitxers

- `index.html`: estructura de la interfície.
- `styles.css`: disseny visual responsive.
- `app.js`: lògica de dades, calendari, reprogramació, localStorage i exportació/importació.
- `manifest.json`: configuració PWA.
- `sw.js`: service worker i cache offline.
- `README.md`: documentació.

## Ús bàsic

1. Crea un grup.
2. Defineix nivell, grup, assignatura, dates del curs i dies de classe.
3. Crea sessions manualment o en bloc.
4. Prem `Recalcula dates` si canvies el calendari.
5. Registra incidències quan hi hagi vaga, sortida, festa, absència o activitat de centre.
6. Marca cada sessió com a feta, parcial, ajornada, cancel·lada o substituïda.
7. Exporta una còpia JSON periòdicament.

## Sessions ràpides

Pots crear sessions en bloc amb una línia per sessió.

Format simple:

```text
Presentació del projecte
Construcció de prototips
Avaluació final
```

Format complet:

```text
Títol; Què es treballarà; Objectiu; Bloc o unitat
```

## Publicació a GitHub Pages

1. Crea un repositori, per exemple `planificador-docent-sessions`.
2. Puja tots els fitxers d'aquest ZIP a l'arrel del repositori.
3. Ves a `Settings > Pages`.
4. Tria la branca principal i la carpeta `/root`.
5. Desa els canvis.
6. Obre l'URL de GitHub Pages.

## Còpies de seguretat

Les dades es desen al navegador amb `localStorage`. Això vol dir que són locals del dispositiu i del navegador. És recomanable exportar JSON sovint.

## Limitacions conegudes

- Encara no hi ha calendari mensual visual.
- No hi ha sincronització entre dispositius.
- Les icones PWA són mínimes.
- El PDF es genera amb la funció d'impressió del navegador.

## Properes versions suggerides

### v0.3.0

- Vista mensual de calendari.
- Colors visuals per estat dins el calendari.
- Exportació CSV.
- Resum per trimestre.

### v0.4.0

- Blocs o unitats didàctiques més avançades.
- Plantilles de sessions.
- Duplicació selectiva de sessions.

### v1.0.0

- Versió estable, polida i documentada per a ús continuat.
