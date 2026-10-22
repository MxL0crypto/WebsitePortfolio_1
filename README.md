# Portfolio – UI/UX Designer

One-Pager im dunklen Topo-Linien-Look mit Akzentblau `#3396FF`. Reines HTML, CSS und JavaScript, ohne Build-Schritt und ohne Abhängigkeiten.

## Inhalt

- **Hero** mit Buchstaben-Intro und animierten Linien, die auf Maus und Scroll reagieren
- **Produkt** „Orbit One" (Smart Ring) mit kreisenden Ringen und Zahlen-Animation
- **Projekte** als Case Studies (Pulse, Atlas, Nova)
- **Kontakt** per E-Mail-Link

## Lokal ansehen

`index.html` im Browser öffnen oder einen kleinen Server starten:

```sh
python3 -m http.server 8000
```

Danach `http://localhost:8000` aufrufen.

## Anpassen

| Was | Wo |
| --- | --- |
| Name und Logo | `index.html`: „DEIN NAME", „-DN", Footer |
| Produkt und Projekte | `index.html`: Sektionen `#produkt` und `#projekte` |
| E-Mail | `index.html`: Sektion `#kontakt` |
| Farben | `style.css`: Variablen in `:root` (`--accent` ist das Blau) |
| Linien-Look | `script.js`: `LINES` und die Sinus-Werte in `draw()` |

Produktname, Zahlen und Projekttexte sind Platzhalter und müssen vor dem Veröffentlichen ersetzt werden.

## Veröffentlichen (GitHub Pages)

1. Repo → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch **main**, Ordner **/ (root)**, speichern

Die Seite läuft dann unter `https://<benutzername>.github.io/<repo-name>/`.

## Barrierefreiheit

Bei aktivierter Systemeinstellung „Bewegung reduzieren" werden alle Animationen abgeschaltet.
