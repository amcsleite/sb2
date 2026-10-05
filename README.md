# StationBoard 2 (`sb2`)

A real-time Swiss public transport departure board **Progressive Web App (PWA)** powered by the [Swiss OpenData Transport API](https://transport.opendata.ch/).

**Live App:** [https://amcsleite.github.io/sb2/](https://amcsleite.github.io/sb2/)

---

## Features

- **Automatic Nearest Stop & 20s GPS Refresh**: Automatically detects your nearest Swiss train, tram, or bus stop via GPS and silently refreshes both your location and upcoming departures every **20 seconds**.
- **Battery-Safe Background Pause**: Uses the Page Visibility API (`document.visibilityState`) to completely pause GPS and network refreshes whenever the app is minimized or the screen is locked, and immediately refreshes when reopened.
- **Grouped Departures (Up to 4 per Line)**: Groups departures by line and destination into a single compact row—showing the next departure in a larger font followed by up to 3 subsequent departures.
- **Relative (`min`) / Clock (`HH:MM`) Toggle**: Tap the **`min` / `HH:MM`** button in the top-right corner of the header to switch between countdown minutes (`3`, `7`, `12`) and exact departure times (`14:05`, `14:09`). Your preference is saved automatically.
- **Pin Important Lines (`★`)**: Tap the star icon on any row to pin that line and destination to the top of the board for the current station (saved per station in `localStorage`).
- **Station Search & Manual Override**: Tap the station name in the header to search for any Swiss station or tap **Use Current Location** to return to automatic GPS tracking.
- **Installable PWA**: Works as a standalone mobile app on Android and iOS with matched typography across browser and standalone modes.

---

## Installing on Your Phone

- **Android (Brave / Chrome recommended)**: Open [https://amcsleite.github.io/sb2/](https://amcsleite.github.io/sb2/) and tap the install icon in the top-right header (or select **Add to Home screen / Install app** from the browser menu).
  - *Note on Samsung Internet*: Samsung Internet's WebAPK wrapper uses an older Android `targetSdkVersion`, which can trigger a generic Android Play Protect warning during installation. Installing from **Brave** or **Chrome** avoids this warning completely.
- **iPhone / iPad (Safari)**: Open [https://amcsleite.github.io/sb2/](https://amcsleite.github.io/sb2/), tap the **Share** button, and select **Add to Home Screen**.

---

## Color Coding

- **Red (blinking)**: `Now` / `1 min` — departing immediately
- **Orange**: `2–4 min` — Hurry!
- **Green**: `5+ min` — On time

---

## Development

### Prerequisites

- Node.js 18+
- npm

### Run Locally

```bash
npm install
npm run dev
```

### Build for Production

```bash
npm run build
```

The production bundle is output to `dist/` (and mirrored to `docs/` / `gh-pages` for GitHub Pages hosting).
