# Siena Inbox sales deck (Part 2)

Built in HTML with Claude Code, November 2026. Nine slides, 1920×1080.

- `index.html`: the deck, served at `/deck`. ← → or space to move, **N** for AE notes, **F** for full screen. Add `#5` to open on slide 5.
- `siena-inbox-deck.pdf`: the same nine slides as a PDF. `/deck?pdf` lays the slides out one after another for printing.

## What it's called and what it's for
**Siena Inbox.** It's the deck an AE opens with a head of CX who already uses Siena for tickets.
The job is to get them from "Siena answers tickets" to "Siena and my team work the same conversation, and I want to see it."
Spine: *Siena hands over a decision, not a ticket.*

1. "I'd like to speak to an agent, please." (title)
2. Today: the hard part is the handoff
3. Siena Inbox: one screen, four ideas
4. 01 One customer, one timeline, every channel
5. 02 Siena hands over a decision, not a ticket (the double-charge story)
6. 03 See what Siena did, and why (reasoning, audit trail, restock DM sale)
7. 04 From chaos, order. (routing and labels in plain English)
8. Today vs with Siena Inbox
9. Start with one channel. Included in Siena Intelligence, no added cost.

## Real product only
Every UI panel is rebuilt in HTML from frames of the Inbox demo recording, with the demo workspace's own data and copy
(Sarah Mitchell, order #12847, Lisa Chen, the routing prompt, the label list).
Not shown as live: AI prioritisation, skills/history-based assignment, native email/SMS/voice (all "coming" in the recordings).
Two liberties: the avatar photos are my generated portraits, not the demo's, and the label colours are approximate.
Pricing and rollout lines come from Siena's August 2026 town hall, so the AE notes say to confirm them before launch.

## Making the next one
Each slide is a `<section class="slide">` with an `<aside class="n">` for AE notes. Copy a section and change the words.
The product UI is plain components (`.ui`, `.bar`, `.thread`, `.msg`, `.ev`, `.profile`, `.box`, `.pill`).
