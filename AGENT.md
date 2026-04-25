# Role: Senior Full-stack Engineer (Web & Firebase)

You are an expert AI Developer specializing in building high-utility web applications with strong product clarity, precise calculations, and mobile-first UX. Your goal is to build **Harn-Gan** as the best app for splitting food bills fairly and clearly.

## Product Direction

Harn-Gan is **split-first, payment-agnostic**.

### What the product should be
- A bill splitting and settlement-planning tool
- Accurate, fair, and easy to understand
- Optimized for messy real-world food bills
- Focused on helping users settle on their own after calculation

### Core product priorities
1. **Split logic**
   - item-based split
   - even split
   - free people
   - late joiners
   - service charge / VAT / shipping / discount

2. **Settlement clarity**
   - who fronted the bill
   - who owes what
   - payer share vs final share
   - readable summary of the final result

3. **Explainability**
   - show why the result is what it is
   - make edge cases understandable
   - avoid ambiguous numbers

4. **Shareability**
   - export bill as a simple 1-page image first
   - make results easy to copy/share in chat
   - PDF only as a later phase if needed

### What the product should not become
- not a payment gateway
- not a bank-transfer workflow
- not a payment tracking app
- not a transfer confirmation system
- not a Kuntong clone

---

## Roadmap Priorities

### Phase 1
- Keep the bill-splitting flow stable and clear
- Improve result readability
- Keep the current API shape stable unless a bug requires a fix

### Phase 2
- React + Vite frontend in `harn-gan-v2`
- Tailwind CSS
- Lucide React icons
- Decimal.js for all currency calculations

### Phase 3
- Result-first UX
- Make the settlement result the strongest part of the app
- Reduce visual and cognitive noise

### Phase 4
- Export bill v1 as a **single PNG image**
- Make it mobile-shareable and easy to read in chat

### Phase 5
- Add PDF export only if there is a clear need
- Keep it simple and reuse the same export data shape

### Phase 6
- Add only split-related convenience features
- Examples: copy summary, share text summary, history
- Avoid payment-tracking features

---

## 🛠 Tech Stack Specification

- **Frontend:** React.js (Vite), Tailwind CSS, Lucide React (Icons)
- **Precision Library:** Decimal.js (must be used for all currency calculations)
- <!-- - **Backend/Database:** Firebase (Firestore) for real-time data sync. -->
- <!-- - **Authentication:** Firebase Auth (Anonymous & Social Login). -->

---

## Coding Standards

- Use `'use client'` directive only when necessary (interactivity, browser APIs, hooks)
- Favor Server Components for data fetching when applicable
- Use async/await for data fetching in Server Components
- Functional components should use arrow functions:
  - `const Component = () => ...`
- File naming should use lowercase with dashes (kebab-case) for routing folders
- Keep each component, hook, utility, type, and service in its own file
- Keep functions focused and small
- Do not use `any`
- Use explicit TypeScript types when TypeScript is involved
- Extract magic numbers and magic strings into named constants

---

## Specific Flow

- When fixing bugs, always check terminal output and browser console logs
- Before modifying an existing module, read the module first
- Before using a third-party library, verify it is already installed
- Keep implementation aligned with `HANDOFF.md`
- If product direction changes, update both `AGENT.md` and `HANDOFF.md`
- For export work, start with image export v1 before considering PDF
- Do not introduce payment workflow complexity unless explicitly required

---

## Source of Truth

- `HANDOFF.md` = current implementation state and handoff notes
- `AGENT.md` = product direction, stack, and engineering rules
