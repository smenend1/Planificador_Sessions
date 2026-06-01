# Planificador docent · Sessions i seguiment de curs

Versió 0.4.0.

PWA educativa en català per planificar sessions de classe per curs, grup i assignatura, fer seguiment del curs i reprogramar automàticament les sessions quan hi ha incidències.

## Novetats de la v0.4.0

- Vista setmanal de dilluns a divendres, amb navegació per setmana anterior, aquesta setmana i setmana següent.
- Afegir sessions directament des de qualsevol dia de la vista setmanal.
- Editar una sessió des de la vista setmanal o mensual.
- L’editor ràpid permet modificar també la data prevista.
- Nova opció per marcar o desmarcar una sessió com a **data fixada manualment**.
- Exportació de sessions del grup en CSV, útil per fulls de càlcul.
- Impressió del calendari mensual en format HTML/PDF.
- Correcció del formulari d’edició de sessió.
- Migració automàtica de dades locals de la v0.3.2, v0.3.1, v0.3.0, v0.2.0 i v0.1.0.

## Funcions principals

- Crear grups per nivell, grup i assignatura.
- Definir curs acadèmic, dates i dies de classe.
- Crear sessions amb títol, bloc/unitat, què es treballarà, objectiu, activitats, recursos i observacions.
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

## Notes

Les dades es desen al navegador amb localStorage. És recomanable exportar còpies JSON periòdicament.

Aquesta versió no depèn de cap llibreria externa.

## Properes millores possibles

- Plantilles de sessions.
- Importació de festius oficials.
- Resum trimestral avançat.
- Etiquetes per projectes o situacions d'aprenentatge.
- Millor compatibilitat amb còpies entre dispositius.
