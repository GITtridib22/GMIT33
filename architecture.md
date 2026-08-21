# RescueRoute Architecture & Flow Diagrams

This document contains Mermaid.js diagrams that you can use directly in your hackathon presentation or GitHub README. Many markdown viewers (like GitHub) render these automatically!

## 1. High-Level Architecture Diagram
This diagram shows the system components, technologies used, and how data moves between the client, backend, and external services.

```mermaid
graph TD
    subgraph Frontend Client
        UI[React/Next.js UI]
    end

    subgraph Backend Server
        API[Node.js + Express]
        WS[Socket.io Server]
        Router[Matchmaking Engine]
        API --- WS
        API --- Router
    end

    subgraph Cloud Database
        DB[(MongoDB Atlas)]
        TTL[TTL Expiry Index]
        GEO[2dsphere Geo-Index]
        DB --- TTL
        DB --- GEO
    end

    subgraph External Services
        OSRM[OSRM Routing API]
    end

    UI -->|REST HTTP POST/GET| API
    UI <-->|Real-Time Events| WS
    
    API -->|Mongoose ODM| DB
    Router -->|HTTP GET Coordinates| OSRM
    OSRM -->|ETA & Route Geometry| Router
    
    classDef frontend fill:#3498db,stroke:#2980b9,stroke-width:2px,color:white;
    classDef backend fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:white;
    classDef database fill:#f1c40f,stroke:#f39c12,stroke-width:2px;
    classDef external fill:#9b59b6,stroke:#8e44ad,stroke-width:2px,color:white;
    
    class UI frontend;
    class API,WS,Router backend;
    class DB,TTL,GEO database;
    class OSRM external;
```

---

## 2. Core User Flow (Donation Lifecycle)
This sequence diagram tracks exactly what happens from the moment a restaurant posts surplus food to the moment a volunteer delivers it. It highlights our intelligent matchmaking logic.

```mermaid
sequenceDiagram
    participant D as Donor (Frontend)
    participant B as Node.js Backend
    participant M as MongoDB Atlas
    participant O as OSRM API
    participant V as Volunteer App

    D->>B: POST /api/donations (Food Data, GPS, Shelf Life)
    B->>M: Insert Donation (Status: AVAILABLE)
    
    rect rgb(240, 248, 255)
    Note over B, M: Phase 1: Smart Filtering
    B->>M: Geo-Query: Find Shelters within 8km
    B->>M: Filter by Dietary Constraints & Demand
    M-->>B: Return Eligible Shelters
    end

    rect rgb(255, 240, 245)
    Note over B, O: Phase 2: Time-Safety Verification
    B->>O: GET Driving Route (Donation GPS -> Shelter GPS)
    O-->>B: Return ETA & Distance
    B->>B: Calculate: Is (ETA * 1.5) < Shelf Life?
    end

    B->>M: Update Donation (Status: MATCHED, assigned Shelter)
    B-->>D: 201 Created (Match Successful)
    
    B->>V: WebSocket Emit: 'donation:new'
    
    V->>B: POST /api/volunteers/claim (VolunteerID, DonationID)
    B->>M: Update Donation (IN_TRANSIT) & Volunteer (BUSY)
    
    V->>B: POST /api/volunteers/deliver (VolunteerID, DonationID)
    B->>M: Update Donation (DELIVERED) & Volunteer (IDLE)
    B->>M: Decrease Shelter Demand by Quantity
```

