# Report an Issue – Assessment Portal

Interactive implementation of the **Report a Problem** flow for the Topin assessment portal
(Figma: `Report-Problem` → *During Assessment Flow*, PRD: *Report a Problem*).

Stack: Vite · React · TypeScript · plain CSS (tokens in `src/index.css`) · `lucide-react` icons.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## What's in the flow

| Area | Behaviour |
| --- | --- |
| Entry | **Report** in the top-right header on every candidate screen. Tooltip *"Facing any problem? Report here."* + pulse appear automatically for 4 s on the start screen (and on hover). Hidden on blocking screens (External display / Screen share). |
| Form | Category chips → single-select **Issue Type** (closes on pick, chevron turns into a clear icon on hover) → **Additional Details** (max 500, error state at the limit) → optional **screenshot**. |
| Others Issue | No Issue Type; description is required. |
| Category switch | Remembered type is kept until the user starts typing in the new category. |
| Screenshot | Browser screen-capture → full-view editor: highlight (drag), text note (click), undo, clear, zoom 100–200 % (never below 100 %), keyboard shortcuts (`H` `T` `+` `-` `⌘/Ctrl+Z` `Esc`), Discard / Attach. Card shows Retake / Edit / Remove. |
| Submit | *Submitting…* state → **success** dialog (bottom sheet on mobile). **Submission failed** and **No internet** dialogs with Retry (returns to the form in submitting state) / Cancel. Attachment failure shows a toast. |
| Cancel | Closing a dirty form asks for confirmation the first 3 times only; after that cancel means cancel. Clicking outside closes. |
| Mobile (≤ 640 px) | Bottom sheet, 16 px padding, fixed header/footer with scrolling body, WhatsApp button hidden while open. No screenshot capture and no Proctoring category (designed but deferred). Submission issue types reduced to three. |

Use the **Prototype controls** (bottom-left) to jump between screens, force a server error / offline
result, or use a generated *Sample image* instead of the browser's screen-share picker.

## Assumptions to confirm

- Issue-type lists for Submission / Platform / Proctoring are inferred from the PRD data table and the beta build; only the Content list is drawn in Figma.
- Submit is enabled once an Issue Type is chosen (description optional), matching the Figma frames; the PRD rationale calls the description "mandatory".
- Confirmation-dialog copy ("Discard this report?") is placeholder; the Figma frame only has `Dialog Heading / Subtext`.
- The brand logo is a generic *topin.tech* wordmark, not the NVIDIA placeholder used in the Figma frames.
- No backend – `ReportFlow` calls `onSubmitted(payload)` where an API call belongs.
