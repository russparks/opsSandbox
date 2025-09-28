# Leads Map

Interactive Google Maps visualisation that plots leads against their allocated projects and colours each lead by estimated drive time. The project is built with Vite, TypeScript, and Advanced Markers to match the behaviour of the original single-file prototype.

## Quick start

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in `VITE_GOOGLE_MAPS_API_KEY` with a valid browser key. The provided map ID defaults to the production style used previously.
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Visit the printed local URL. The map will load once the Google Maps script finishes downloading.

## Environment variables

| Variable | Description |
| --- | --- |
| `VITE_GOOGLE_MAPS_API_KEY` | **Required.** Browser API key enabled for the Maps JavaScript API. Never commit real keys. |
| `VITE_MAP_ID` | Optional. Map style identifier. Defaults to `6e0ccd1a55446bd922d281f4` if not set. |

The application injects the Google Maps loader script at runtime with `libraries=marker` and `v=weekly`. Keys should be scoped to the required APIs only.

## Data contracts

The app expects the following schemas for lead and project data located in `src/data/`:

- **`leads.json`**
  ```json
  {
    "id": "string",
    "name": "string",
    "lat": 0,
    "lng": 0,
    "projectId": "string"
  }
  ```
- **`projects.json`**
  ```json
  {
    "id": "string",
    "name": "string",
    "lat": 0,
    "lng": 0
  }
  ```

At startup the payloads are validated with Zod and type-checked via TypeScript interfaces. Any missing or invalid fields throw descriptive errors.

## Available scripts

- `npm run dev` — start the Vite development server.
- `npm run build` — type-check and build the production bundle.
- `npm run preview` — serve the production build locally.

## Implementation notes

- Lead markers use `AdvancedMarkerElement` and `PinElement` when available. The glyph shows the rounded drive time in minutes, while the pin background reflects the drive-time colour bands: 0–30, 31–60, 61–90, and 90+ minutes.
- If Advanced Markers are unavailable, the app falls back to classic `google.maps.Marker` instances with styled labels.
- Distance calculations use the `DistanceMatrixService` with batched requests of 25 origin/destination pairs and, when supported, the `BEST_GUESS` traffic model departing 15 minutes from “now”.
- Map bounds expand to include all lead origins for a responsive fit, and marker factories expose `clear()` methods to allow future re-renders without leaks.

## Production build

Create an optimised build with:
```bash
npm run build
```
Then preview it locally with:
```bash
npm run preview
```

