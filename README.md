# Planificador docent · Sessions i seguiment de curs

Versió 0.5.0.

PWA educativa en català per planificar sessions de classe per curs, grup i assignatura, fer seguiment del curs i reprogramar automàticament les sessions quan hi ha incidències.

## Novetats de la v0.5.0

- Targeta **Avui a classe** amb accions ràpides per marcar sessions com a fetes, parcials o ajornades.
- Botó per afegir una sessió directament al dia d'avui.
- Selector ràpid de matèries LOMLOE per nivell, mantenint l'opció d'escriure una assignatura personalitzada.
- Selector de dies de classe més còmode en mòbil amb botons grans.
- Creació ràpida de seqüències de sessions per nombre, prefix i bloc/unitat.
- Millores de checklist docent per reduir clics durant el dia a dia.
- Manté la vista mensual, la vista setmanal, l'edició ràpida, el CSV, el resum imprimible i la reprogramació automàtica de versions anteriors.

## Funcions principals

- Crear grups per nivell, grup i assignatura.
- Definir curs acadèmic, dates i dies de classe.
- Seleccionar assignatures habituals d'ESO i Batxillerat o escriure'n una de personalitzada.
- Crear sessions amb títol, bloc/unitat, què es treballarà, objectiu, activitats, recursos i observacions.
- Crear sessions ràpides en bloc.
- Assignar dates automàticament.
- Registrar incidències per vaga, falta del docent, sortida, festa, activitat de centre, avaluació o altres motius.
- Reprogramar automàticament sessions futures.
- Mantenir fixes les sessions ja fetes, parcials o substituïdes amb data real.
- Crear sessions des del calendari mensual o setmanal.
- Filtrar sessions per estat, reprogramades o fora de calendari.
- Veure línia temporal de sessions i incidències.
- Consultar estadístiques de seguiment.
- Exportar i importar JSON.
- Exportar sessions en CSV.
- Generar resum imprimible en HTML/PDF.
- Imprimir calendari mensual.
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

## Nota de migració

La versió 0.5.0 migra automàticament dades locals de versions anteriors. Es recomana exportar una còpia JSON abans de substituir fitxers en producció.

## Notes

Les dades es desen al navegador amb localStorage. És recomanable exportar còpies JSON periòdicament.

Aquesta versió no depèn de cap llibreria externa.

## Properes millores possibles

- Plantilles de sessions.
- Importació de festius oficials.
- Resum trimestral avançat.
- Etiquetes per projectes o situacions d'aprenentatge.
- Millor compatibilitat amb còpies entre dispositius.
