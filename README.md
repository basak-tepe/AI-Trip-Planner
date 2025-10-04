## AI Trip Planner

An AI-powered travel assistant that plans end-to-end trips (flights, hotels, car rentals) based on user preferences, with multilingual support and rich UI rendering on the web.

### Repository Structure (brief)
```text
AI-Trip-Planner/
  backend/
    app/
      __init__.py
      main.py           # FastAPI app entry
      agents.py         # Guardian Agent, TravelAgent wiring
      travelAgent.py    # TravelAgent logic and tool usage
    models/
      Activity.py
      Chat.py
      Message.py
  frontend/
    src/
      App.tsx
      components/
        AIChatbot.tsx
        ItineraryBuilder.tsx
        figma/ImageWithFallback.tsx  # hotel image fallback
        ui/ ... (shadcn/ui components)
      styles/globals.css
      main.tsx
    index.html
    vite.config.ts
```

### Main Logic (high level)
- User converses in the web UI (`AIChatbot.tsx`).
- Backend (FastAPI) orchestrates an LLM-based flow to:
  - understand intent and preferences (dates, budget, cabin class, chains, car class, etc.),
  - fetch flight/hotel/car options via connected tools,
  - evaluate and rank options against user preferences,
  - build an itinerary and stream results back to the UI.

### LLM Architecture
- Guardian Agent → TravelAgent → Tools

Flow:
1) Guardian Agent
   - Validates and guards prompts, enforces policies and safety.
   - Sets constraints and high-level objectives for planning.

2) TravelAgent (planner/executor)
   - Decomposes the task (transport → stay → ground).
   - Calls domain tools, merges results, and produces the trip plan.

3) Connected Tools (used by TravelAgent)
   - MCP: external data access (e.g., flight/hotel/car providers) and utilities.
   - pick_options: scores and re-ranks candidate options based on user preferences.
   - trip_plan: composes the final, day-by-day plan and summaries.

```text
Guardian Agent → TravelAgent → [ MCP | pick_options | trip_plan ] → Ranked options + Itinerary
```

### Preference-aware Selection
- Flights: balances price, departure/arrival windows, cabin class, baggage, airline preference, and number of stops (prefers direct when requested).
- Hotels: considers price/night, location proximity, rating, amenities, cancellation policy, and brand/chain preferences; images are rendered in UI with a fallback.
- Car rentals: weighs price, pickup/dropoff alignment, transmission/class preference, mileage/insurance rules, and provider reliability.
- Re-ranking is adaptive: the system re-scores results when the user changes constraints (e.g., “evening flight”, “walkable to city center”).

### Language Support
- Multilingual conversation handling: prompts and responses support multiple languages; Turkish and English are first-class.
- The UI and agent respond in the user’s language when possible.

### Hotel Image Rendering
- The frontend uses `components/figma/ImageWithFallback.tsx` to display hotel images.
- Graceful fallback avoids layout shifts or broken images, improving UX for listings and plan cards.

### Frontend Highlights
- React + Vite + TypeScript.
- Components: `AIChatbot` for conversation, `ItineraryBuilder` for structured trip output.
- Reusable `ui/` components (shadcn/ui) for a modern, consistent interface.

### Backend Highlights
- FastAPI application (`app/main.py`).
- Agents defined in `app/agents.py`; planning logic in `app/travelAgent.py`.
- Pydantic models in `backend/models` for chats, messages, and activities.

### Notes
- This README focuses on architecture and capabilities. Internal endpoints, auth, and provider credentials are expected to be configured per environment.


