# Request A Rep — Success Animation Demo

Standalone demo of the Request A Rep success-state animation, matching the Figma source of truth:

[D3-XXX—Request-A-Rep-Final-Steps](https://www.figma.com/design/R1KVRfsgzflS3ICuvphxOi/D3-XXX—Request-A-Rep-Final-Steps?node-id=65-488)

## Share link

After deploy, the public URL will be listed here:

**https://request-a-rep-success-demo.vercel.app** _(update after first deploy)_

Anyone can open this link from any network. Use **Replay animation** (bottom-right) to re-watch.

## Local preview

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Static build (portable)

```bash
npm run build
```

Upload the `dist/` folder to any static host (Netlify Drop, GitHub Pages, S3, internal CDN, etc.).

```bash
npm run preview   # serve dist/ locally
```

## Animation constants (designer-tunable)

Edit [`src/animation/animation-timeline.ts`](src/animation/animation-timeline.ts):

| Constant | Default | Purpose |
|---|---|---|
| `CIRCLE_ENTRANCE_DURATION` | 250ms | Circle fade + scale in |
| `PROGRESS_DURATION` | 1600ms | Linear circular border fill |
| `WOMAN_REVEAL_PROGRESS` | 0.25 | Woman appears at this progress |
| `MAN_REVEAL_PROGRESS` | 0.5 | Man appears at this progress |
| `AVATAR_REVEAL_DURATION` | 280ms | Avatar opacity entrance |
| `COMPLETION_HOLD` | 120ms | Pause at 100% before move |
| `CIRCLE_MOVE_DURATION` | 450ms | Ease-in-out upward settle |
| `CONTENT_STAGGER` | 100ms | Delay between content items |
| `CONTENT_REVEAL_DURATION` | 350ms | Each content entrance length |

Progress easing is **linear** so 25%/50% match the visible arc. Circle move and content reveals use **ease-in-out** (`cubic-bezier(0.4, 0, 0.2, 1)`).

## Reduced motion

When `prefers-reduced-motion: reduce` is set, the demo skips the progress draw and stagger and shows the final Step 7 state immediately.
