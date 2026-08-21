# RescueRoute Prompts

## Initial Prompt

You are an expert full-stack developer and system architect building "RescueRoute" — a real-time hyperlocal food rescue logistics platform for an 8-hour hackathon. ### WORKSPACE & DOCUMENTATION RULES (MANDATORY)
1. Maintain two living tracking files in the root directory at all times:
   - prompts.md: Append every major prompt, architectural decision, and feature directive received during this build.
   - progress.md: Keep an active checklist of planned, in-progress, and completed tasks, API contracts, schema structures, and demo-readiness milestones. Update this after completing every sub-task.
2. The solution must run entirely on the local development machine.  Phase 4: Frontend Multi-Role Dashboard & Live Map
Build a responsive dashboard under /client:
- *Role Switcher Dropdown:* Fast toggle between [Donor View], [Volunteer View], and [Shelter View].
- *Interactive Leaflet Map:*
  - Distinct custom pins for Donors (Orange/Red based on TTL), Shelters (Blue/Green), and Volunteers (Yellow).
  - Polyline showing active pickup-to-dropoff driving paths.
- *Donor View:* 30-second form to submit surplus food (food type, servings, expiry hours).
- *Volunteer View:* Gig-style incoming dispatch card with "Accept Task" button and turn-by-turn route overview.
- *Shelter View:* Real-time quota fulfillment progress bar and incoming delivery countdown timer. Progress.md file layout: # RescueRoute — Development Progress Tracker

## Status Legend
- [x] Completed
- [/] In Progress
- [ ] Pending

---

## 1. Environment & Setup
- [ ] Scaffold `/client` (React + Tailwind + Leaflet)
- [ ] Scaffold `/server` (Express + Socket.io + Mongoose)
- [ ] Initialize `prompts.md` and `progress.md`

## 2. Database & Data Layer
- [ ] Mongoose Shelter Schema with `2dsphere` index
- [ ] Mongoose Donation Schema with TTL expiry index
- [ ] Mongoose Volunteer Schema
- [ ] Mock Data Seeder Script (`seed.js`)

## 3. Core Engine & APIs
- [ ] Geospatial Matching Route (`POST /api/donations`)
- [ ] OSRM Driving Distance & Travel Time Integrator
- [ ] WebSocket Gateway (`donation:matched`, `donation:claimed`, `donation:delivered`)
- [ ] Shelter Capacity Deductions

## 4. Frontend & User Interface
- [ ] Shared Role Switcher Header (`Donor` | `Volunteer` | `Shelter`)
- [ ] Interactive Leaflet Map with Custom Marker Icons
- [ ] Donor Submission Form (with live TTL preview)
- [ ] Volunteer Dispatch & Route Overlay
- [ ] Shelter Live Influx Dashboard

## 5. Demo Polish
- [ ] Pre-seeded Demo Scenario in Local Database
- [ ] Side-by-side Multi-tab Verification Test. Generate only the front-end part of this project so that it can be later integrated with backend and DB , being developed by another person

## City Selection Feature Prompt

Okay. Now tell me what API you are using for this mapview. Also, make the UI such that the user can change the cities if needed(like if they want to move the main city from Mumbai to Raipur or Kolkata).Update the progress.md and process.md files.

## Geocoding and Dashboard Prompt

Modify the map and city changong feature- the user should be able to switch to any random city or village in India, not just the 4 I mentioned here. If required, use GoogleMaps API or any other API. Also, the pinpoint locations on the map that is showing the rescue shelters, the food donors and everything, make it better so that if thee mouse hovers over a particular pinpoint, it should show the details of that pinpoint. Also, implement a dashboard as required since it is mandatory here in this hackathon

## Interactive Dashboard & Real API Prompt

Make the global dashboard more interactive. Also, when I later connect it with the backend files, will it work? Also, there is requirement here in this hackathon to build a dashboard with real APIs. What API could we use?

## Banquet & Shelter Overhaul Prompt

You are building the FRONTEND for "RescueRoute", a Direct-to-Shelter Food Rescue web application (built with React/Next.js, Tailwind CSS, Lucide icons, and Leaflet/React-Leaflet). Skip the volunteer part.
Implement two high-fidelity, interactive dashboards with mock API/WebSocket states and a top-navbar Role Switcher (`[Switch to Banquet View]` / `[Switch to Shelter View]`) for side-by-side demo presentation to judges.

### DASHBOARD 1: Banquet / Caterer View (`/donor`)
Design a clean, high-contrast, mobile-friendly interface designed for rapid entry during busy event wrap-ups.
... (Prompt details executed for multi-step form, reverse geocoding, and OTP flow)

### DASHBOARD 2: Shelter Overseer View (`/shelter`)
Design an operations command center for shelter directors and inventory managers.
... (Prompt details executed for incoming radar, dispatch command map, and ledger)

## Map Refactor Prompt

Update the map implementation: Remove Google Maps dependencies to avoid API key requirements. 
Switch entirely to Leaflet (`react-leaflet` or vanilla Leaflet CDN) with OpenStreetMap tiles:
1. **Zero-Config Map Tiles:** Use `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.
2. **Real-Road Routing API (Free & Keyless):** Fetch road route polylines and real driving durations directly from the public OSRM (Open Source Routing Machine) API:
   `https://router.project-osrm.org/route/v1/driving/{donor_lon},{donor_lat};{shelter_lon},{shelter_lat}?overview=full&geometries=geojson`
3. **Simulated Live Traffic:** Render the returned GeoJSON route polyline with dynamic multi-color segments (green for clear stretches, orange/red for high-density congestion zones) and display live telemetry (e.g., "4.2 km • 14 mins with moderate traffic").
