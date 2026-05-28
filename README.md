# AI Music Generation Dashboard

A React + TypeScript dashboard that turns music prompts into 30-second AI-generated tracks, then visualizes playback, waveform interaction, and live audio analysis.

## Project Overview

AI Music Generation Dashboard is a one-page MVP for exploring what an AI music product interface could feel like. A user can write a prompt, choose a genre and mood, generate a 30-second track through a local backend API, play the result, inspect a waveform, and watch live audio metrics update while the track is playing.

The current app uses MusicGen through Replicate for text-to-music generation. The client-server boundary, shared TypeScript types, and provider interface keep the frontend insulated from provider details so the backend can evolve later without rewriting the main UI flow.

## Why I Built This

This project connects two parts of my background: music composition and frontend engineering. I wanted to build more than a simple form demo. The goal was to shape a small but product-like creative tool where prompt writing, audio playback, signal analysis, visual feedback, and generation history all support the same workflow.

For a portfolio context, the project is meant to show how I think about creative technology: not only calling an API, but designing the interaction model around what artists, producers, or creative teams need to understand while exploring generated sound.

## Key Features

- Prompt-based track generation form with genre and mood controls
- Four prompt presets for fast creative starting points
- Local backend API with a provider abstraction layer
- MusicGen text-to-music generation through Replicate
- 30-second WAV output with automatic polling on long generations
- Regenerate and Generate Variation actions
- Generation history with original, regenerated, and variation labels
- localStorage persistence for recent generation history
- Wavesurfer.js waveform preview with play, pause, timing, and seek
- Web Audio API metrics for average energy, peak level, and intensity
- ECharts visualizations for live energy/intensity and recent generation metadata
- Idle, loading, success, and error states with focused fallback UI
- Vitest + React Testing Library tests for the core UI flow

## Tech Stack

- React 19
- TypeScript
- Vite
- Wavesurfer.js
- Web Audio API
- ECharts
- Node.js HTTP server with `tsx`
- Vitest
- React Testing Library
- localStorage

## Architecture & Data Flow

```txt
User prompt / preset
  -> PromptForm
  -> App state
  -> src/api/musicApi.ts
  -> POST /api/generate-track
  -> server/routes/generateTrackRoute.ts
  -> server/providers/providerFactory.ts
  -> musicGenProvider
  -> GeneratedTrack response
  -> TrackResult
  -> WaveformPreview + Web Audio analysis
  -> DashboardVisuals + GenerationHistory
```

The frontend owns interaction state, playback UI, charts, history selection, and error/loading presentation. The backend owns request validation, provider selection, and track generation. The provider contract lives in `server/providers/types.ts`, which keeps the current MusicGen integration aligned with future real providers.

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Add your Replicate token to `.env`, then start the API server:

```bash
npm run dev:server
```

In another terminal, start the Vite app:

```bash
npm run dev
```

Open the local URL printed by Vite. The backend defaults to `http://127.0.0.1:3001`.

## Running Tests

Run the test suite once:

```bash
npm run test:run
```

Run tests in watch mode:

```bash
npm test
```

## Environment Variables

Use `.env.example` as the starting point:

```env
MUSIC_PROVIDER=musicgen
API_PORT=3001
OPENAI_API_KEY=
REPLICATE_API_TOKEN=
MUSICGEN_MODEL_VERSION=large
```

`MUSIC_PROVIDER=musicgen` is now the default runtime path. `REPLICATE_API_TOKEN` is required on the backend for MusicGen generation, and `MUSICGEN_MODEL_VERSION` defaults to `large`.

## Project Structure

```txt
server/
  index.ts                       # Local API server entry
  routes/generateTrackRoute.ts   # /api/generate-track request handling
  providers/
    types.ts                     # Shared provider contract
    providerFactory.ts           # Provider selection from env
    mockProvider.ts              # Local mock generation fallback
    openAiProvider.ts            # Placeholder for future OpenAI provider
    musicGenProvider.ts          # Replicate-backed MusicGen provider

src/
  api/musicApi.ts                # Frontend fetch client
  components/
    PromptForm.tsx               # Prompt, preset, genre, and mood controls
    TrackResult.tsx              # Result states and generation actions
    WaveformPreview.tsx          # Wavesurfer playback and analysis panel
    DashboardVisuals.tsx         # Dashboard chart layout
    EnergyTimelineChart.tsx      # Live energy/intensity chart
    GenerationHistoryChart.tsx   # Recent generation comparison chart
    GenerationHistoryList.tsx    # Clickable recent generation list
  hooks/
    useAudioAnalysis.ts          # Web Audio API analysis hook
    useLocalStorageState.ts      # Persistent local state helper
  types/music.ts                 # Shared music and generation types
  App.tsx                        # Screen-level orchestration
  App.test.tsx                   # Core UI flow tests
```

## Implementation Considerations

- Kept the current UI as a single-screen MVP, but separated form, player, chart, and history responsibilities into focused components.
- Used a backend route and provider interface so the frontend does not depend on MusicGen or Replicate specifics.
- Kept API keys out of the frontend path and modeled real provider integration as a backend concern.
- Added explicit idle, loading, success, and error states so generation failures do not collapse the whole app.
- Built the audio experience around playback interaction: waveform seek, current time, duration, play state, and cleanup when tracks change.
- Separated Web Audio analysis into a hook so analysis logic can evolve without rewriting the player component.
- Used stable tests with mocked Wavesurfer, ECharts, and media APIs to protect the main user flow without over-testing implementation details.

## Current Limitations

- Music generation depends on an external Replicate API token and network access.
- MusicGen generations can take noticeable time, especially for 30-second outputs.
- The OpenAI provider is still a placeholder.
- Generation history is stored in localStorage only.
- The backend is a lightweight local Node server, not a production API service.
- Live analysis is based on browser playback data, not deeper offline audio feature extraction.

## Future Improvements

- Add async generation jobs with progress, cancellation, and retry behavior.
- Support reference audio upload for variation or style transfer workflows.
- Add richer audio analysis such as tempo, spectral centroid, dynamic range, or section detection.
- Persist generation history in a backend database.
- Add user accounts or project-based generation libraries.
- Code-split heavier visualization libraries for production bundle optimization.

## Provider Status

This project now runs on a MusicGen provider backed by Replicate. The important architectural piece is still the same: the frontend, backend route, shared types, and provider interface remain separated, so the generation backend can keep evolving without rewriting the main UI flow.
