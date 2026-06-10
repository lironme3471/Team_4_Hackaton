# CX Loop

**CX Loop** automatically closes the loop with customers after every interaction. When a
contact ends, it generates a clear, personalized summary — what was resolved, what happens
next, and any open follow-ups — for the agent to review and send. Behind the scenes it
correlates the customer's full interaction history and connected data to surface AI insights
that **anticipate the next issue before the customer has to ask**.

This repo is a working prototype built as the **wrap-up (After-Contact Work) experience inside
a NiCE CXone-style voice Agent Workspace**.

## What it does

The app simulates a full agent **call lifecycle**, with the agent state and timers reflecting
each phase:

1. **Available** — a Contact History list of recent (billing) calls; the call panel is idle.
2. **On Call** — a live voice call with call controls (mute, hold, record, transfer) and a
   **Live Transcription** panel that streams the conversation as real-time speech-to-text,
   with **synced spoken audio** (distinct agent/caller voices via the Web Speech API).
3. **ACW / Wrap-up — CX Loop** — when the call ends, CX Loop takes over the workspace:
   - **Loop summary** — AI-drafted recap (resolved · next steps · closing), editable, with
     one-click **send to the customer** over email/SMS.
   - **Open follow-ups** — owners and due dates; suggestions can be added straight from the AI.
   - **AI insight · next issue** — predicted next issues with likelihood, reasoning, and a
     recommended action.
   - **Outcome** — disposition + notes, then **Save & Close** (or **Save & Redial**).
   - Collapsible **call transcript** for reference.

The call can **auto-advance** to wrap-up when the transcript finishes, or the agent can hang up.

### Scenarios

Three correlated **billing** scenarios are included, each with its own transcript, connected
data, AI summary, and next-issue prediction:

- **Double charge on June invoice** → autopay still points at an expired card.
- **Card declined → service suspended** → same-bank replacement card likely to decline again.
- **Bill jumped after promo ended** → churn risk when the loyalty credit expires.

## Tech stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) (dev server + build)
- [Tailwind CSS](https://tailwindcss.com/)
- Web Speech API (`speechSynthesis`) for in-browser call audio

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check and build for production
npm run preview  # preview the production build
npm run lint     # run ESLint
```

> Call audio uses the browser's built-in voices, so the exact voices vary by OS/browser. Audio
> can be toggled from the speaker button in the Live Transcription panel.

## Project structure

```
src/
  App.tsx                  # call-lifecycle state machine + layout
  types.ts                 # shared domain types
  data/mockData.ts         # billing scenarios, call history, dispositions
  hooks/useElapsed.ts      # ticking timers for agent/call state
  components/
    TopBar.tsx             # CXone-style top bar + agent state
    Sidebar.tsx            # left icon rail
    CallPanel.tsx          # active call card + voice controls
    ContactHistory.tsx     # "Available" Contact History list
    AppSpace.tsx           # on-call details + CX Loop wrap-up
    LiveTranscript.tsx     # streamed transcript with synced audio
    ResizeHandle.tsx       # draggable panel splitter
    icons.tsx              # inline SVG icon set
```

## Notes

This is a self-contained front-end prototype: all data is mocked and the AI summaries /
predictions are pre-authored to illustrate the experience. There is no backend.
