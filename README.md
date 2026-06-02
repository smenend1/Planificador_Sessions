# Planificador docent · Sessions i seguiment de curs

Versió 0.5.1.

PWA educativa en català per planificar sessions de classe per curs, grup i assignatura, fer seguiment del curs i reprogramar automàticament les sessions quan hi ha incidències.

## Novetats de la v0.5.1

Versió de consolidació. No afegeix cap mòdul complex nou; reforça opcions que ja funcionaven.

- Control més clar del curs acadèmic actiu.
- Còpia de seguretat JSON més visible.
- Registre intern de l'última còpia feta des de l'app.
- Revisió de dades per detectar grups sense calendari complet, sessions sense data, sessions fora de calendari i possibles duplicats de dia.
- Ajuda ràpida dins l'app sobre reprogramació, dates fixades i còpies de seguretat.
- Diagnòstic i service worker actualitzats a v0.5.1.
- Migració automàtica des de v0.5.0 i versions anteriors.

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

La versió 0.5.1 migra automàticament dades locals de versions anteriors, inclosa la v0.5.0. Es recomana exportar una còpia JSON abans de substituir fitxers en producció.

## Notes

Les dades es desen al navegador amb localStorage. És recomanable exportar còpies JSON periòdicament.

Aquesta versió no depèn de cap llibreria externa.

## Properes millores possibles

- Plantilles de sessions.
- Importació de festius oficials.
- Resum trimestral avançat.
- Etiquetes per projectes o situacions d'aprenentatge.
- Millor compatibilitat amb còpies entre dispositius.
