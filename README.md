# Trishula AI · Real-time lead finder

## Description

A web-based lead generation tool that helps sales teams identify and prioritize real-world businesses for security camera installations. The app uses a **live API** to search for actual local businesses—such as warehouses, construction-related places, and retail—based on any city the user enters. Each lead is automatically ranked by **Trishula risk logic**: **Construction Site** or **Warehouse** → high priority; **Retail** or **Other** → low priority.

**API used:** [OpenStreetMap Nominatim](https://nominatim.org/) (free, no API key).

---

## What this does

- **Live search** — Query Nominatim for a city; results become leads with name, building type, and location.
- **Manual leads** — Add rows from the form.
- **Delete** and **`localStorage`** persistence.

**Stack:** React + Vite (JavaScript).

---

## Serverless function: `api/nominatim.js`

**What it is:** A **Vercel serverless function** at **`/api/nominatim`**. It runs on Vercel (or `vercel dev`), not inside the static `dist/` bundle.

**What it does:**

- **GET** only; forwards query params (e.g. `q`, `format`, `limit`, `addressdetails`) to `https://nominatim.openstreetmap.org/search`.
- Returns Nominatim’s status and body to the browser.
- Sets a proper **`User-Agent`** per [Nominatim’s usage policy](https://operations.osmfoundation.org/policies/nominatim/).
- **405** for non-GET; **502** if the upstream request fails.

**Why:** Browsers are often blocked by **CORS** when calling Nominatim directly. The production app calls **`/api/nominatim`** on your own domain; the function calls Nominatim from the server.

**Local dev:** Use **`npm run dev`** — the **Vite proxy** in `vite.config.js` (`/nominatim` → Nominatim) replaces this. Production builds use **`/api/nominatim`**.

