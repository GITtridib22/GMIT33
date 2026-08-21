# 🍲 RescueRoute

> **Hyperlocal, Direct-to-Shelter Food Rescue Logistics Engine**  
> *Zero Waste. Zero Hunger.*

---

## 📌 Problem Overview
Commercial kitchens, banquet halls, and wedding caterers routinely prepare excess food (15%–25% surplus buffer) to avoid running out. However, cooked meals carry a strict perishability window (2–4 hours). Due to the high friction of manually contacting charities, confirming intake capacity, and organizing transport during late-night hours, massive quantities of fresh, edible food are needlessly discarded.

Traditional volunteer-based platforms rely on slow, manual messaging groups, creating logistical delays and liability concerns. **RescueRoute** eliminates third-party delivery bottlenecks by connecting banquet donors directly with verified shelter vehicles using real-time geospatial routing and automated freshness countdowns.

---

## 💡 The Solution
RescueRoute is a zero-friction, two-sided web platform that automates surplus food dispatch:
1. **15-Second Donor SOS:** Caterers log surplus batches in seconds using visual container presets (Cauldrons, Large Trays) without manual weighing or spreadsheets.
2. **Automated Geospatial Matching:** Identifies verified nearby shelters with active fleet logistics (vans, auto-rickshaws) and available meal intake capacity.
3. **Live OSRM Road Routing:** Uses the Open Source Routing Machine (OSRM) to calculate real road navigation and driving ETAs to ensure $T_{\text{transit}} < T_{\text{expiry}}$.
4. **Secure OTP Handshake:** Guarantees chain-of-custody verification between kitchen staff and arriving shelter drivers.

---

## 🚀 Key Features

* **Minimalist 2-Step Workflow:**
  * **Landing Page:** Rapid entry points for Banquet Donors and Shelter Overseers.
  * **Unified Map Dashboard:** Split 35% control telemetry panel and 65% interactive geospatial map.
* **Smart Freshness & TTL Engine:** Configurable safe consumption windows (1–12 hours) with dynamic countdown timers.
* **Geospatial & GPS Autolocation:** 
  * Browser GPS auto-detection with dynamic map re-centering.
  * OpenStreetMap Nominatim search for Indian cities and localities.
* **Direct Logistics & Fleet Dispatch:** Shelters manage their own transport, removing volunteer coordination delays.
* **Chain-of-Custody Verification:** 4-digit pickup OTP ensures food is handed over exclusively to authorized shelter staff.
* **Zero-Setup Open Source Stack:** Fully functional without paid API keys or credit card requirements.

---

## 🛠️ Tech Stack

### Frontend & UI
* **Framework:** Next.js / React
* **Styling:** Tailwind CSS & Lucide React Icons
* **Map & Spatial Visualization:** Leaflet / React-Leaflet
* **State Management:** React Context / Custom Hooks

### APIs & Geospatial Services
* **Road Routing & Navigation:** [OSRM API](https://project-osrm.org/) (Open Source Routing Machine)
* **Map Tiles:** OpenStreetMap (OSM)
* **Geocoding & Location Search:** OpenStreetMap Nominatim API
* **Device Geolocation:** HTML5 Geolocation API

---

## 📂 Project Architecture

```text
├── public/
├── src/
│   ├── components/
│   │   ├── landing/          # Minimalist Role Selection & Input Forms
│   │   │   ├── DonorForm.jsx
│   │   │   └── ShelterForm.jsx
│   │   ├── map/              # Leaflet Map with OSRM Polyline Renderer
│   │   │   ├── MapContainer.jsx
│   │   │   ├── MapRecenter.jsx
│   │   │   └── RoutePolyline.jsx
│   │   ├── dashboard/        # Live Radar, Dispatch Cards & Telemetry
│   │   │   ├── DonorStatusCard.jsx
│   │   │   └── ShelterActionPanel.jsx
│   │   └── ui/               # Reusable buttons, badges, steppers
│   ├── context/
│   │   └── RescueContext.jsx # Global state sharing between Donor and Shelter
│   ├── services/
│   │   └── osrmService.js    # OSRM route fetcher & telemetry calculator
│   └── pages/ or app/
│       └── page.jsx          # Main dynamic viewport container
├── package.json
└── README.md
