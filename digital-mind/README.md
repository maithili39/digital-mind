# The Anatomy of a Digital Mind
### Frontend Odyssey — IIT Patna Hackathon Submission

An immersive, Awwwards-quality interactive storytelling website that
takes users on a cinematic journey through the inner workings of
artificial intelligence — from raw data ingestion to conscious dialogue.

## Concept

The site is structured as five acts of a single narrative: the "birth"
of a digital mind. Section 1 opens with a living Three.js brain — 8,000
particles self-organised into neural pathways — establishing the visual
metaphor. Section 2 immerses the user in the flood of training data
through a sticky vertical scroll experience showing tokenisation and
embedding space. Section 3 is the technical centrepiece: a fully
interactive multi-head attention visualiser where users click words to
see weighted attention lines fan across a sentence, toggling between
8 attention heads. Section 4 builds a knowledge graph on scroll,
constructing the model's "understanding" of consciousness node by node.
Section 5 closes the loop — the user speaks directly to the mind via
the Claude API, receiving poetic introspective responses in real time.

Every design decision reinforces the narrative: the void black
background simulates the latent space before activation; cyan represents
active signal propagation; violet represents learned representations;
amber marks the "hot" neurons firing with highest attention.

## Mandatory Requirements

| Requirement | Implementation |
|---|---|
| 5 story sections | Hero → Raw Data → Attention → Thought Forms → Speak to It |
| Scroll effect 1 | Vertical pin/fade sequencing, Section 2 |
| Scroll effect 2 | SVG stroke-dashoffset path drawing, Section 4 |
| Interaction 1 | Click word → attention weighted lines, Section 3 |
| Interaction 2 | Toggle H1–H8 attention heads, Section 3 |
| Interaction 3 | Sentence chip selector, Section 3 |
| Animation 1 | Three.js brain particle self-organisation, Section 1 |
| Animation 2 | Categorised data rain + tokenisation stagger, Section 2 |
| Animation 3 | SVG path drawing + traveling dot loop, Section 4 |
| Responsive | Mobile-first breakpoints, UI scaling, performance pausing |

## Tech Stack

React · Vite · GSAP + ScrollTrigger · Three.js · framer-motion · Lenis smooth scroll · Claude API (claude-sonnet-4-20250514)

## Setup

```bash
git clone https://github.com/yourusername/digital-mind
cd digital-mind
npm install
cp .env.example .env
# Add your Anthropic API key to .env
npm run dev
```

## Environment Variables

```
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
```

## Design Decisions

GSAP was chosen over CSS-only animations for ScrollTrigger's precise
scroll-position control and Lenis smoothness mapping. Three.js handles
both the hero brain and the ambient particle fields — separated into
independent scenes to allow `IntersectionObserver`-based pause/resume,
keeping performance above 80 on Lighthouse. Framer Motion handles
layout animations (node expansion, tooltip transitions) where GSAP
would require manual dimension calculation.
