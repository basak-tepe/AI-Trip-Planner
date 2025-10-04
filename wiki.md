## AI Trip Planner Wiki

Welcome to the project wiki for the AI Trip Planner. This page summarizes the system architecture, agent design, connected tools, data flow, and how to extend the app.

### Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Agents and Tools](#agents-and-tools)
- [Data Flow](#data-flow)
- [Preference-Aware Planning](#preference-aware-planning)
- [Language Support](#language-support)
- [Frontend UX and Media](#frontend-ux-and-media)
- [Backend & Data Models](#backend--data-models)
- [Setup (Quickstart)](#setup-quickstart)
- [Extensibility](#extensibility)
- [FAQ](#faq)

### Overview
An AI-powered assistant that plans end-to-end trips (flights, hotels, car rentals) based on user preferences. The system features multilingual conversation, preference-aware ranking, and rich UI rendering.

### Architecture
The backend orchestrates a two-layer agent system supervised by a guardian. The frontend provides a conversational interface and renders results (itineraries, listings, images).

```text
User ↔ Frontend (React/Vite)
       ↕
Backend (FastAPI)
  ├─ Guardian Agent (policy/safety controller)
  └─ TravelAgent (planner/executor)
       ├─ MCP (external data access/utilities)
       ├─ pick_options (preference-based scoring)
       └─ trip_plan (itinerary composition)
```

Key directories (brief):
```text
backend/app/        # FastAPI, agents, orchestration
backend/models/     # Pydantic models for chat/messages/activities
frontend/src/       # React + TypeScript app and UI components
```

### Agents and Tools
#### Guardian Agent
- Enforces safety and policy constraints.
- Validates prompts and constrains objectives for planning.

#### TravelAgent
- Decomposes user goals into sub-tasks (transport → stay → ground transport).
- Integrates results and produces the final plan.

#### Connected Tools
- MCP: Bridges to providers/data sources for flights, hotels, and car rentals; can also host utilities.
- pick_options: Scores and re-ranks candidate options by user preferences and constraints.
- trip_plan: Assembles a coherent itinerary (day-by-day or summary) from selected options.

### Data Flow
1) User provides intent and constraints (dates, budget, times, preferences) via chat.
2) Guardian Agent validates inputs/policies and sets guardrails.
3) TravelAgent queries tools (MCP) to fetch options; then uses pick_options to score them.
4) TravelAgent composes the itinerary with trip_plan and returns structured results.
5) Frontend renders listings, plan summaries, and images; user can refine preferences.

### Preference-Aware Planning
- Flights: price, time windows, cabin class, baggage, airline, stops (prefers direct if requested).
- Hotels: price/night, location proximity, rating, amenities, cancellation policy, brand/chain.
- Cars: price, pickup/dropoff alignment, class/transmission, mileage/insurance rules, provider.
- Adaptive re-ranking: updates when the user adds/refines constraints (e.g., “evening flight”).

### Language Support
- Multilingual conversation (e.g., Turkish and English) with responses in the user’s language where possible.
- Preference and constraint parsing works across supported languages.

### Frontend UX and Media
- Built with React + TypeScript + Vite.
- Conversational interface (`AIChatbot`) and structured plan rendering (`ItineraryBuilder`).
- Hotel image rendering uses a fallback component to avoid broken images and layout shifts.

### Backend & Data Models
- FastAPI service exposing planning endpoints.
- Agents orchestrated in `app` with domain logic in `TravelAgent`.
- Pydantic models for chat history, messages, and activities under `backend/models`.

### Setup (Quickstart)
1) Install Python deps in a virtual environment and Node deps for the frontend.
2) Configure environment variables and provider credentials as required by your MCP integrations.
3) Start the backend (FastAPI) and the frontend (Vite dev server).

```bash
# Backend (example)
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt  # if provided

# Frontend (example)
cd frontend && npm install && npm run dev
```

### Extensibility
- Add new providers by extending MCP integrations and mapping responses to internal models.
- Customize scoring in `pick_options` to emphasize different factors (e.g., eco-friendliness).
- Extend `trip_plan` to add activity recommendations or richer day-by-day details.

### FAQ
- Does it support round trips? Yes; specify departure/return dates and constraints.
- Can it prefer certain airlines/hotel brands? Yes; include them in your preferences.
- How do I switch languages? Speak in your preferred language; the agent will follow.


