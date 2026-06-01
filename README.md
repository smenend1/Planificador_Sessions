# Planificador docent · Sessions i seguiment de curs

Versió 0.3.2.

PWA educativa en català per planificar sessions de classe per curs, grup i assignatura, fer seguiment del curs i reprogramar automàticament les sessions quan hi ha incidències.


## Novetats de la v0.3.2

- En clicar un dia buit del calendari, s'obre directament l'editor per crear una sessió en aquella data.
- El detall de qualsevol dia del calendari incorpora el botó **Afegeix sessió aquest dia**.
- Les sessions creades des del calendari mantenen la data triada com a data fixada manualment i no es mouen amb la reprogramació automàtica.
- Migració automàtica de dades locals de la v0.3.1, v0.3.0, v0.2.0 i v0.1.0.

## Correccions de la v0.3.1

- El botó **Reutilitza curs següent** ja no canvia el curs general actiu ni et mou automàticament a la còpia nova.
- Les sessions del calendari mensual ara obren un editor ràpid en clicar-hi.
- L’editor ràpid permet modificar nom de la sessió, bloc/unitat, què es treballarà, objectiu, activitats, recursos, estat, data real i observacions.
- La versió migra automàticament dades locals de la v0.3.0, v0.2.0 i v0.1.0.

## Novetats de la v0.3.1

- Vista mensual de calendari.
- Navegació per mes anterior, mes actual i mes següent.
- Sessions visibles dins del calendari amb colors segons l'estat.
- Incidències i dies no lectius generals visibles al calendari.
- Detall d'un dia en clicar-lo.
- Resum del mes: sessions, incidències i dies de classe configurats.
- Migració automàtica de dades de la v0.2.0 i v0.1.0.

## Funcions principals

- Crear grups per nivell, grup i assignatura.
- Definir curs acadèmic, dates i dies de classe.
- Crear sessions amb títol, bloc/unitat, què es treballarà, objectiu, activitats, recursos i observacions.
- Assignar dates automàticament.
- Registrar incidències per vaga, falta del docent, sortida, festa, activitat de centre, avaluació o altres motius.
- Reprogramar automàticament sessions futures.
- Mantenir fixes les sessions ja fetes, parcials o substituïdes amb data real.
- Filtrar sessions per estat, reprogramades o fora de calendari.
- Veure línia temporal de sessions i incidències.
- Consultar estadístiques de seguiment.
- Exportar i importar JSON.
- Generar resum imprimible en HTML/PDF amb `window.print()`.
- Funcionament offline bàsic amb service worker.
- Diagnòstic PWA i localStorage.

## Publicació a GitHub Pages

1. Crea un repositori, per exemple `planificador-docent-sessions`.
2. Puja aquests fitxers a l'arrel del repositori:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `manifest.json`
   - `sw.js`
   - `README.md`
3. Activa GitHub Pages des de `Settings > Pages`.
4. Selecciona la branca principal i la carpeta arrel.

## Notes

Les dades es desen al navegador amb localStorage. És recomanable exportar còpies JSON periòdicament.

Aquesta versió no depèn de cap llibreria externa.

## Properes millores possibles

- Vista setmanal.
- Exportació CSV.
- Impressió del calendari mensual.
- Etiquetes per projectes o situacions d'aprenentatge.
- Millor gestió de festius oficials importables.
