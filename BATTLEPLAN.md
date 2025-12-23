# Battle Plan 🗡️

> From prototype to polished MVP

## Phase 0: Foundation Cleanup (Day 1)
*Clean the house before inviting guests*

### 0.1 TanStack Query Best Practices
- [ ] Configure `QueryClient` with sensible defaults (staleTime, gcTime, retry)
- [ ] Add React Query DevTools (dev only)
- [ ] Standardize query options across hooks

### 0.2 Domain ↔ Prisma Alignment
- [ ] Reconcile `SessionStatus` enum (domain uses `InProgress`/`Silence`, Prisma uses `RUNNING`)
- [ ] Add `Recording` and `Survey` models to Prisma schema
- [ ] Remove hardcoded `META_BY_SLUG` from rituals router (use DB fields)

### 0.3 Type Safety Fixes
- [ ] Fix missing `Step` type in `RitualOverview.tsx`
- [ ] Ensure tRPC router uses proper context type everywhere

### 0.4 Complete Seed Data
- [ ] Add all 4 steps to Enochian ritual (currently only has Preparation)

---

## Phase 1: Core Ritual Loop (Days 2-4)
*Make the ritual actually work end-to-end*

### 1.1 Server-Side Step Tracking
- [ ] Add `sessions.beginStep` mutation
- [ ] Add `sessions.completeStep` mutation  
- [ ] Add `currentStepOrder` field to `Session` model
- [ ] Update `SessionRunner` to call these as user progresses
- [ ] Add `SessionStep` model to track individual step completion times

### 1.2 Silence Phase Recording (Fake for MVP)
- [ ] Create `useAudioRecorder` hook (MediaRecorder API)
- [ ] Add recording indicator UI during silence phase
- [ ] Add 30-second countdown timer overlay
- [ ] Implement "silence detection" — analyze audio levels
- [ ] If quiet enough, mark as "successful recording" (don't actually save)
- [ ] Add `sessions.completeRecording` mutation (records metadata only for now)

### 1.3 Post-Ritual Survey
- [ ] Create `Survey` model in Prisma (or embed in Session)
- [ ] Add `sessions.submitSurvey` mutation
- [ ] Create `SurveyPage.tsx` with:
  - Presence rating (0-5 scale, visual)
  - Optional notes textarea
  - Submit button
- [ ] Navigate to survey after final step
- [ ] After survey, redirect to completion/dashboard

### 1.4 Session Completion Flow
- [ ] Add `sessions.complete` mutation (marks session as COMPLETED)
- [ ] Show completion celebration screen
- [ ] Link to view session history

---

## Phase 2: User Experience Polish (Days 5-6)
*Make it feel good to use*

### 2.1 Session History
- [ ] Add `sessions.list` query (filter by current user)
- [ ] Create `SessionsPage.tsx` showing:
  - Ritual name + date
  - Completion status (completed / aborted)
  - Presence rating if submitted
  - "Run again" action

### 2.2 Profile Page
- [ ] Add `auth.updateProfile` mutation
- [ ] Create `ProfilePage.tsx` with:
  - Edit alias
  - Edit full name (optional)
  - Change password (stretch)
  - Delete account (stretch)

### 2.3 Loading & Error States
- [ ] Create skeleton components for:
  - Ritual cards
  - Session list
  - Dashboard stats
- [ ] Add React error boundary wrapper
- [ ] Add retry buttons on query errors

### 2.4 Mobile Responsiveness
- [ ] Audit all pages on mobile viewport
- [ ] Ensure touch targets are 44px+
- [ ] Test immersive mode on mobile
- [ ] Add touch-friendly video controls

---

## Phase 3: Spooky Vibes (Day 7)
*Make it feel like a ritual, not a webapp*

### 3.1 Typography
- [ ] Add display font for headings (Cinzel, Playfair, or EB Garamond)
- [ ] Configure in Tailwind theme

### 3.2 Atmosphere
- [ ] Add subtle grain texture overlay (CSS or SVG)
- [ ] Add candle flicker animation (optional, tasteful)
- [ ] Refine immersive mode transitions
- [ ] Add ambient audio option (very subtle drone)

### 3.3 Micro-interactions
- [ ] Button hover/press states with subtle scale
- [ ] Step completion animations
- [ ] Survey rating selection feedback

### 3.4 Countdown Timer (Silence Phase)
- [ ] Visual countdown ring or bar
- [ ] Pulsing recording indicator
- [ ] "Stay silent..." text overlay

---

## Phase 4: Content & Admin (Days 8-10)
*Scale beyond developer-seeded rituals*

### 4.1 Video Hosting
- [ ] Set up Cloudflare R2 (or S3) bucket
- [ ] Migrate videos from `/public/videos/` to CDN
- [ ] Update video URLs in seed data
- [ ] Add CDN URL env var

### 4.2 Admin Role System
- [ ] Add `role` field to `Witness` model (`USER` | `ADMIN`)
- [ ] Create `requireAdmin` tRPC middleware
- [ ] Add admin check to protected routes

### 4.3 Admin Panel
- [ ] Create `/admin` layout with sidebar
- [ ] Rituals list with edit/delete
- [ ] Ritual create/edit form:
  - Name, slug
  - Purpose markdown (rich editor or textarea)
  - History markdown
  - Requirements (dynamic list)
- [ ] Step builder:
  - Drag-to-reorder
  - Kind selector
  - Video upload (direct to R2)
  - Record toggle

---

## Phase 5: Gamification — The Path (Future)
*Unlock rituals through practice*

### 5.1 Progress Tracking
- [ ] Create `WitnessProgress` model (or fields on Witness)
- [ ] Track completion count per ritual
- [ ] Track total sessions, average presence rating

### 5.2 Unlock Conditions
- [ ] Add `unlockCondition` to Ritual model (JSON or relation)
- [ ] Examples:
  - "Complete Bloody Mary 3 times"
  - "Achieve presence rating 4+ twice"
- [ ] Evaluate unlock on session completion

### 5.3 The Path UI
- [ ] Visual progression map (linear or tree)
- [ ] Locked ritual cards with unlock hint
- [ ] Celebration on unlock

---

## Phase 6: Research & Data (Future)
*Share findings with the world*

### 6.1 Public Data Page
- [ ] Aggregate stats:
  - Total sessions
  - Average presence rating by ritual
  - Completion rate
- [ ] Anonymous session feed (recent completions)
- [ ] Charts/visualizations

### 6.2 Data Export
- [ ] Admin-only CSV/JSON export
- [ ] Per-ritual breakdown

---

## Definition of Done (MVP)

A user can:
1. ✅ Register and log in
2. ✅ Browse available rituals
3. ✅ Start a ritual session
4. ✅ Watch ritual videos in immersive mode
5. 🔴 Experience the silence phase with recording indicator
6. 🔴 Submit a presence survey
7. 🔴 View their session history
8. 🔴 Edit their profile

An admin can:
1. 🔴 Log in with admin role
2. 🔴 Create/edit/delete rituals via UI
3. 🔴 Upload videos

---

## Technical Debt to Address

| Issue | Priority | Notes |
|-------|----------|-------|
| Domain/Prisma enum mismatch | High | Blocks accurate state tracking |
| Hardcoded ritual metadata | Medium | Already in DB, just not used |
| Missing Step type | Low | TypeScript error, easy fix |
| No error boundaries | Medium | App crashes on query errors |
| Videos in /public | Medium | Works but won't scale |

---

## Open Questions

1. **Audio storage**: Even for MVP "fake" recording, should we save the audio locally for testing? Or truly discard?
2. **Silence detection threshold**: What dB level counts as "quiet enough"? Need to experiment.
3. **Mobile-first or desktop-first**: Primary usage context? Probably mobile (bathroom mirror ritual).
4. **Multiple witnesses per session**: Domain supports it, but do we need it for MVP?
5. **OAuth providers**: Local auth works, but Google/Apple would improve UX. Priority?

---

## Next Steps

1. **Accept this battle plan** or adjust priorities
2. **Start Phase 0** — fix TanStack Query config + type alignment
3. **Then Phase 1** — make the core loop work

Let's ritual. 🕯️

