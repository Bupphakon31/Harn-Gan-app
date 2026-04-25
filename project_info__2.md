# Harn-Gan — Codebase Overview and Comparison to KBank Kuntong

## Summary

Harn-Gan is a bill-splitting web app that helps a group divide food expenses, extra charges, and settlement flows with enough flexibility to cover several real-world cases: item-based splitting, even splitting, free people, late joiners, one payer, and multiple payers. The active implementation is now the React/Vite app in `harn-gan-v2`, backed by an Express API that still performs the actual calculations.

Conceptually, this app is very similar to KBank “Kuntong” in the sense that both are designed to solve group expense splitting and settlement. The important difference is that Harn-Gan is a self-contained calculator/workflow tool, while KBank Kuntong is a bank ecosystem product with stronger ties to payment rails, group workflows, and money movement.

## Architecture

### Primary pattern
The current system is a **client-driven wizard + server calculation API** architecture.

- The UI collects all inputs through a multi-step wizard.
- The frontend validates basic flow constraints.
- The frontend sends a normalized payload to `POST /api/calculate`.
- The backend runs all canonical split and settlement logic.
- The frontend renders the returned summary and payment settlement views.

This is not a pure SPA with all logic in the browser, and it is not a full CRUD app with persistence. It is a deterministic calculation flow.

### Major subsystems

#### 1) React/Vite frontend
Lives under `harn-gan-v2/` and is the active UI layer.

Key responsibilities:
- Wizard navigation
- Form state management
- Input validation
- Request submission
- Rendering calculation results
- Rendering settlement details

#### 2) Calculation engine
Lives in `utilities/calculations.js`.

Key responsibilities:
- Item-based split
- Even split
- Free people redistribution
- Single-payer settlement
- Multi-payer settlement

This file is the authoritative business logic. The frontend is intentionally not the source of truth for the arithmetic.

#### 3) Express API
Lives in `server.js`.

Key responsibilities:
- Normalize incoming payloads
- Reject invalid states
- Call calculation helpers
- Return a single response containing `result` and `paymentDetails`

#### 4) Legacy prototype/older static app
The repo still contains `public/`, `prototype.js`, and older vanilla JS assets. These are part of the project history and documentation trail, but the active product work is centered on the React app in `harn-gan-v2`.

### Technology stack
Based on the current codebase:

- **Frontend runtime:** React + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Currency math:** Decimal.js in the React layer
- **Backend runtime:** Node.js + Express
- **Calculation module:** plain CommonJS module in `utilities/calculations.js`

### How execution starts
There are effectively two entry points depending on which generation of the app you are looking at:

- **Active app:** `harn-gan-v2/src/main.jsx` bootstraps the React UI.
- **Legacy app:** `server.js` serves `public/index.html` and exposes `/api/calculate`.

The active flow is:
1. React app loads.
2. User steps through the wizard.
3. Frontend builds a payload.
4. Frontend POSTs to `/api/calculate`.
5. Express calls the calculation helpers.
6. Response comes back.
7. React renders summary and settlement cards.

## Directory Structure

```text
project-root/
├── harn-gan-v2/                — Active React/Vite application
│   ├── src/
│   │   ├── App.jsx             — Top-level app orchestration and API call
│   │   ├── main.jsx            — React bootstrap entry
│   │   ├── index.css           — Global styles
│   │   ├── lib/
│   │   │   ├── money.js        — Decimal/currency helpers
│   │   │   └── useWizard.js    — Wizard state, reducers, derived helpers
│   │   └── components/
│   │       ├── AppShell.jsx    — Layout shell
│   │       ├── BillWizard.jsx  — Multi-step form container
│   │       ├── steps/          — Step-specific forms
│   │       └── results/        — Result and settlement views
│   └── package.json            — Vite/React build config
├── utilities/
│   └── calculations.js         — Shared business logic and settlement math
├── server.js                   — Express API for `/api/calculate`
├── public/                     — Legacy static app assets
├── README.md                   — Project overview
├── AGENT.md                    — Implementation target/specification
├── HANDOFF.md                  — Running status and project memory
├── data.js                     — Sample bill data for reference/testing
├── prototype.js                — Older CLI/prototype version
└── Prototype-RM - RM.csv       — Data/sample file
```

## Key Abstractions

### `App`
- **File**: `harn-gan-v2/src/App.jsx`
- **Responsibility**: Owns the app-level flow: wizard state, result state, validation, payload assembly, and API submission.
- **Interface**: Uses `useWizard()`, tracks `result`, `paymentDetails`, `error`, `loading`, and calls `/api/calculate`.
- **Lifecycle**: Mounts once at app start; swaps between wizard and result views depending on whether a result exists.
- **Used by**: `main.jsx` mounts this component; child UI components depend on the props it passes down.

### `useWizard`
- **File**: `harn-gan-v2/src/lib/useWizard.js`
- **Responsibility**: Central wizard state machine and reducer-based state management.
- **Interface**: Exposes `state`, `dispatch`, and helper methods such as `getLateJoiners()` and `getAllFriends()`.
- **Lifecycle**: Lives for the lifetime of the React app; resets when the user restarts the flow.
- **Used by**: `App`, `BillWizard`, and step components.

### `BillWizard`
- **File**: `harn-gan-v2/src/components/BillWizard.jsx`
- **Responsibility**: Renders the wizard shell, stepper, step content, validation hints, and navigation buttons.
- **Interface**: Receives `state`, `dispatch`, `completedSteps`, `goToStep`, `onNextStep`, `isStep2Complete`, `error`, `loading`, `onCalculate`, `allFriends`, `lateJoiners`.
- **Lifecycle**: Re-renders as state changes; contains no business logic itself.
- **Used by**: `App`.

### `StepPayment`
- **File**: `harn-gan-v2/src/components/steps/StepPayment.jsx`
- **Responsibility**: Lets the user choose payment mode and configure single-payer or multi-payer settlement, plus free people selection.
- **Interface**: Uses `state`, `dispatch`, `allFriends`, and `mode`.
- **Lifecycle**: Appears only on step 4.
- **Used by**: `BillWizard`.

### `ResultSummary`
- **File**: `harn-gan-v2/src/components/results/ResultSummary.jsx`
- **Responsibility**: Displays the full calculated result: overall totals, per-person split, late joiners, free people, and cost breakdown.
- **Interface**: Receives `result`, `paymentDetails`, `paymentMode`, `onReset`.
- **Lifecycle**: Shown after a successful calculation; reset returns the user to step 1.
- **Used by**: `App`.

### `ResultSettlement`
- **File**: `harn-gan-v2/src/components/results/ResultSettlement.jsx`
- **Responsibility**: Renders settlement detail differently for single payer and multi payer flows.
- **Interface**: Receives `paymentDetails`, `paymentMode`.
- **Lifecycle**: Lives inside the result page; reflects server-calculated settlement.
- **Used by**: `ResultSummary`.

### `calculateDetailedSplit`
- **File**: `utilities/calculations.js`
- **Responsibility**: Computes item-based split, including service charge, VAT, shipping, and discount propagation.
- **Interface**: Accepts `{ friends, items, serviceChargePercent, vatPercent, shippingFee, discount }`.
- **Lifecycle**: Called on every calculation when mode is item-based.
- **Used by**: `server.js`.

### `calculateEvenSplit`
- **File**: `utilities/calculations.js`
- **Responsibility**: Computes even split across all friends for a single total amount.
- **Interface**: Accepts `{ friends, totalAmount, serviceChargePercent, vatPercent, shippingFee, discount }`.
- **Lifecycle**: Called on every calculation when mode is even split.
- **Used by**: `server.js`.

### `applyFreePeople`
- **File**: `utilities/calculations.js`
- **Responsibility**: Removes selected free people from the payable share and redistributes the remainder.
- **Interface**: Accepts `(result, friends, freePeople, items)`.
- **Lifecycle**: Runs after the base split is computed when free people are enabled.
- **Used by**: `server.js`.

### `calculateSinglePayerPayment`
- **File**: `utilities/calculations.js`
- **Responsibility**: Builds settlement detail for the “one payer pays first” flow.
- **Interface**: Accepts `(result, payer)`.
- **Lifecycle**: Runs when payment mode is single payer.
- **Used by**: `server.js`, `ResultSettlement`.

### `calculateMultiPayerPayment`
- **File**: `utilities/calculations.js`
- **Responsibility**: Builds settlement detail for the “multiple people paid” flow.
- **Interface**: Accepts `(result, payers)`.
- **Lifecycle**: Runs when payment mode is multi payer.
- **Used by**: `server.js`, `ResultSettlement`.

### `server.js` API handler
- **File**: `server.js`
- **Responsibility**: Normalizes request data, validates the request, runs business logic, and returns response JSON.
- **Interface**: `POST /api/calculate`.
- **Lifecycle**: Runs for every calculation request from the client.
- **Used by**: React app via fetch.

## Data Flow

### Main calculation flow
1. User enters bill data into the wizard.
2. `useWizard` stores the draft state.
3. `App.jsx` validates the current step and builds a payload.
4. The frontend sends the payload to `POST /api/calculate`.
5. `server.js` normalizes names, items, free people, and late joiners.
6. `calculateDetailedSplit` or `calculateEvenSplit` computes the base bill allocation.
7. `applyFreePeople` adjusts the split if some people are marked free.
8. `calculateSinglePayerPayment` or `calculateMultiPayerPayment` computes the settlement view.
9. The server returns `{ result, paymentDetails }`.
10. `ResultSummary` and `ResultSettlement` render the final output.

### Single payer flow
1. User selects one payer in Step 4.
2. Server confirms the payer exists in the summary.
3. The payer is treated as the upfront payer, not as an extra debtor.
4. Every non-payer person’s share becomes an entry in `breakdown`.
5. The UI shows:
   - total paid upfront
   - payer’s own share
   - reimbursement total
   - net amount after reimbursements

### Multi payer flow
1. User selects several people and enters amounts.
2. Server groups duplicate payer names and sums them.
3. The server compares each person’s actual paid amount against their `shouldPay`.
4. Each person is labeled as:
   - `pay` if they owe more
   - `receive` if they should get money back
   - `exact` if already balanced
5. The UI renders these as color-coded rows.

## Non-Obvious Behaviors & Design Decisions

### 1) The app is closer to a calculator than a payment platform
This is the biggest conceptual point. Harn-Gan calculates who owes what, but it does not move money, initiate transfers, or manage real payment requests. That makes it fundamentally different from a bank-integrated product.

### 2) The server is still the source of truth for math
The React app does some validation and expected-total checks, but it intentionally delegates final settlement math to `utilities/calculations.js`. This reduces drift between UI and calculation logic.

### 3) Free people are a redistribution problem, not just a toggle
The code does not simply mark a person as zero. `applyFreePeople` removes their share and rescaling is applied to the remaining payers so the totals still reconcile to the grand total. That is why the app can treat “free people” as a first-class rule rather than a cosmetic filter.

### 4) Single payer mode is really a reimbursement settlement
In single payer mode, the payer is not shown as one more debtor. The payer is treated as the temporary fronting party, and the UI emphasizes:
- upfront paid amount
- own share
- reimbursable total
- final net position

That is why the `payerShare` addition matters: it clarifies that the payer is included in the calculation, just not as a separate “must pay” line.

### 5) Multi payer requires strict total equality
The frontend enforces that total paid by all payers equals the expected grand total. This avoids ambiguous settlement math and keeps the server’s output deterministic.

### 6) Late joiners are tracked separately from free people
Late joiners are not the same as free people. Late joiners are people who arrived after certain items existed, while free people are people who should not bear any cost. The code treats them as separate concepts and displays them in separate result sections.

### 7) The app is in a transition state
The repository contains both:
- an older vanilla HTML/CSS/JS version
- a newer React/Vite version

This is why some concepts appear twice. A new developer must know which generation is active: the React app in `harn-gan-v2`.

### 8) `HANDOFF.md` is a real source-of-truth artifact
The project uses `HANDOFF.md` as the persistent memory for the next agent. That file is intentionally verbose because it captures the current status, completed work, and remaining work across phases.

## Comparison to KBank Kuntong

### Where Harn-Gan is similar
Harn-Gan and KBank Kuntong are aligned in the problem they solve:

- both support group expense splitting
- both help with settlement after one person pays first
- both are useful when groups need a clean way to determine who owes whom
- both reduce the mental burden of manual math

In practical terms, Harn-Gan feels like a “Kuntong-style split bill assistant.”

### Where Harn-Gan is different
The differences are more important than the similarities:

#### 1) No bank integration
Kuntong is part of KBank’s LINE ecosystem and is positioned closer to actual money movement or payment workflows. Harn-Gan does not integrate with bank rails, wallets, or payment requests.

#### 2) No group persistence or social graph
This app does not manage real shared group sessions, invitations, persistent rooms, or activity history. It is mostly a single-session calculator.

#### 3) No in-product transfer execution
Harn-Gan calculates settlement; it does not request, track, or confirm transfers. The app stops at “who should pay whom and how much.”

#### 4) More explicit bill modeling
Harn-Gan is more detailed than a basic “split equally” tool:
- item-based splitting
- free people
- late joiners
- shipping fee
- discount
- service charge
- VAT
- single payer vs multi payer settlement

This makes Harn-Gan more like a general-purpose bill modeler than a bank-branded payment feature.

#### 5) More developer-visible logic
Because the business rules are open in the codebase, Harn-Gan is inspectable and tunable. Kuntong, as a product, would hide more of its operational mechanics behind a platform and product layer.

### Bottom-line comparison
If you compare them by **user intent**, they are quite similar.  
If you compare them by **product scope**, Kuntong is a payment ecosystem feature, while Harn-Gan is a flexible bill-splitting engine and UI.

So the short answer is:

- **Yes, conceptually similar**
- **No, not equivalent in product depth or payment integration**

## Module Reference

| File | Purpose |
|------|---------|
| `harn-gan-v2/src/App.jsx` | Top-level orchestration, validation, payload assembly, API call |
| `harn-gan-v2/src/components/BillWizard.jsx` | Wizard shell, step navigation, step rendering |
| `harn-gan-v2/src/components/steps/StepPayment.jsx` | Payment mode and payer configuration |
| `harn-gan-v2/src/components/results/ResultSummary.jsx` | Final result summary and sections |
| `harn-gan-v2/src/components/results/ResultSettlement.jsx` | Settlement card for single/multi payer flows |
| `harn-gan-v2/src/lib/useWizard.js` | Wizard state and action handling |
| `harn-gan-v2/src/lib/money.js` | Decimal/currency formatting helpers |
| `utilities/calculations.js` | Core split and settlement algorithms |
| `server.js` | API endpoint, normalization, validation, server-side orchestration |
| `README.md` | Legacy high-level project overview |
| `AGENT.md` | Stack direction/spec for the active React phase |
| `HANDOFF.md` | Live project memory and implementation log |
| `data.js` | Sample bill dataset |
| `prototype.js` | Older prototype/reference implementation |

## Suggested Reading Order

For a developer coming in cold:

1. `HANDOFF.md` — best single file for current status and what has already been done.
2. `harn-gan-v2/src/App.jsx` — shows the full app flow and how the payload is assembled.
3. `harn-gan-v2/src/lib/useWizard.js` — explains the state model and step flow.
4. `utilities/calculations.js` — the source of truth for all bill math.
5. `server.js` — shows validation and the request/response contract.
6. `harn-gan-v2/src/components/results/ResultSummary.jsx` and `ResultSettlement.jsx` — shows how the calculation output is presented to users.

## Practical Takeaway

If the question is “does Harn-Gan resemble KBank Kuntong?” the answer is **yes in concept, no in product depth**.

Harn-Gan already covers the core mental model:
- split a bill
- decide who paid
- compute who owes whom
- handle special cases like free people and late joiners

But it still lacks the things that make a bank-native product feel like Kuntong:
- connected payment rails
- account-based settlement
- group persistence
- social/payment workflow integration
- live money movement

So from a product strategy angle, Harn-Gan is best understood as a **more configurable bill-splitting engine inspired by the same problem space as Kuntong**, not as a direct clone of it.
