# Harn-Gan vs KBank Kuntong — Pros & Cons Analysis

## Summary

From the codebase, Harn-Gan is a highly configurable bill-splitting and settlement tool: it models item-based splits, even splits, free people, late joiners, single payer settlement, and multi payer settlement. That makes it powerful for detailed manual expense reconciliation.

KBank Kuntong, by contrast, is best understood as a bank-native expense-sharing feature inside a larger payment ecosystem. Its biggest advantage is not custom math, but integration with real payment behavior, user trust, and payment workflows that already live inside a banking/LINE environment.

So the tradeoff is simple:

- **Harn-Gan** = more flexible and transparent calculation engine
- **Kuntong** = more integrated and operationally convenient payment experience

---

## What Harn-Gan Does Well

### 1) Very flexible bill modeling
Harn-Gan handles situations that many split-bill tools simplify away:

- item-based splitting by eater
- even split by total amount
- service charge, VAT, shipping fee, discount
- free people redistribution
- late joiners
- one payer settlement
- multi payer settlement

This is a major strength because the app is not locked to one payment style. It can adapt to real restaurant situations, mixed item consumption, and “someone didn’t eat / didn’t arrive yet” cases.

### 2) The logic is explicit and inspectable
Because the core math lives in `utilities/calculations.js`, the app is easy to audit:

- you can see exactly how totals are computed
- you can inspect settlement rules directly
- you can reason about edge cases without guessing what a platform does behind the scenes

This is a strong advantage for correctness, debugging, and future customization.

### 3) Separation between calculation and UI
The current architecture keeps the arithmetic in the backend and the rendering in the React frontend. That gives Harn-Gan a cleaner separation than a “just a form with JS math” app.

Benefits:
- easier to test
- easier to refactor UI without rewriting math
- easier to keep API contract stable

### 4) Good support for settlement clarity
The current Step 4 and settlement output are designed to make the role of the payer obvious:

- total paid upfront
- payer’s own share
- reimbursement total
- net amount

That is a useful UX decision because it reduces confusion around “who is actually paying what” in a group setting.

### 5) Transparent handling of special cases
Harn-Gan surfaces special rules directly in the UI and result pages:

- free people are shown explicitly
- late joiners are shown explicitly
- free people are prevented from becoming payers
- multi payer totals must balance exactly

That makes the app predictable and less magical than a hidden platform flow.

### 6) Self-contained and portable
The app does not depend on bank-specific infrastructure. That means:

- easier to run locally
- easier to develop independently
- easier to adapt for other contexts
- no dependency on external payment APIs for the core value

---

## What Harn-Gan Does Poorly or Does Not Yet Do

### 1) No real payment execution
This is the biggest weakness compared to Kuntong.

Harn-Gan calculates who owes whom, but it does not:
- move money
- initiate transfers
- track transfer completion
- connect to bank accounts or wallets

So it solves the math, not the actual money movement.

### 2) No persistent group/payment ecosystem
The app appears to be a single-session calculator. It does not provide:

- shared rooms or group histories
- saved sessions
- persistent transaction tracking
- invitation/in-group social workflow

That makes it useful for one-time use, but less powerful as an ongoing social payment tool.

### 3) More manual input burden
Because Harn-Gan is so flexible, the user has to enter more information:

- friends
- items
- eaters
- service charge
- VAT
- shipping
- discount
- free people
- payer mode details

This is a power-user feature, but it can feel heavier than a platform product that already understands your group context.

### 4) More room for UX friction
The app currently has many state-dependent rules. That means it can be easy for users to get stuck in validation:

- Step 2 requires enough data before advancing
- free people cannot be selected as payers
- multi payer totals must match exactly
- payer selection depends on valid group state

This is correct logically, but it increases cognitive load.

### 5) No integrated trust layer
A bank product benefits from user trust, authentication, and the comfort of being inside a known financial ecosystem. Harn-Gan does not have that built in.

So even if its math is strong, it may not feel as “secure” or “official” to mainstream users.

---

## What KBank Kuntong Does Well

> Note: this is a product-level comparison based on what a KBank-style group payment feature typically offers, not a direct inspection of Kuntong source code.

### 1) Native payment ecosystem integration
Kuntong’s strongest likely advantage is that it sits inside a banking ecosystem. That usually means:

- easier money transfer flow
- less friction to act on the split
- stronger trust
- potential connection to real payment actions

This matters because split-bill tools are useful only if people actually settle the money.

### 2) Lower friction for everyday users
A bank-native experience is usually easier for casual users because they already use the ecosystem for:
- login
- identity
- transfers
- notifications
- group payment habits

In practice, that lowers adoption friction.

### 3) Better operational convenience
A product like Kuntong is likely stronger for:
- sending requests
- reminding people
- tracking who paid
- using an existing user base
- handling money movement inside a familiar interface

That is a major UX advantage over a standalone calculator.

### 4) Social adoption and trust
In a bank/LINE context, users may trust the workflow more because it is attached to an established institution. For financial behavior, trust is a huge product feature.

---

## What KBank Kuntong Does Poorly Compared to Harn-Gan

### 1) Less transparent calculation control
Bank-native products often optimize for simplicity, not for exposing every calculation rule.

That means Kuntong may be less suitable when the user wants to:
- model item-level sharing
- include free people
- model late joiners
- tweak custom cost categories
- inspect the math in detail

Harn-Gan is much more explicit and configurable.

### 2) Less customizable edge-case handling
A bank product is usually standardized. It may not let you express all the weird restaurant cases that Harn-Gan supports.

Examples Harn-Gan handles more naturally:
- one person doesn’t share a dish
- one person arrives after part of the bill
- some people are exempt from charges
- some people pay together in different amounts

### 3) More platform dependence
If a Kuntong-like feature is tied to a bank ecosystem, then:
- it is less portable
- it is less self-contained
- it depends on the product’s rules and API surface
- developers have less control over the underlying logic

### 4) Usually less suitable as a “calculation sandbox”
Harn-Gan is better if your goal is to experiment with settlement logic or build a generalized bill-splitting engine. Kuntong is likely better if your goal is to actually move money in a consumer-friendly way.

---

## Side-by-Side Comparison

| Dimension | Harn-Gan | KBank Kuntong |
|---|---|---|
| Core purpose | Flexible bill split + settlement engine | Bank-native group expense/payment workflow |
| Calculation transparency | Very high | Usually lower / product-hidden |
| Item-based splitting | Strong | Likely limited or simplified |
| Free people handling | Explicit | Usually not a primary concept |
| Late joiners | Explicit | Not a core visible concept |
| Payment execution | No | Likely yes / stronger integration |
| Trust & adoption | Depends on app trust | High due to bank ecosystem |
| UX simplicity | Medium | Often higher for casual users |
| Customizability | High | Lower |
| Persistence / groups | Not built in | More likely supported in product ecosystem |

---

## Practical Pros and Cons of Each

### Harn-Gan — Pros
- very flexible
- highly transparent
- handles real-world edge cases
- easier to debug and extend
- better for learning, prototyping, and custom workflows
- strong separation of calc logic and UI

### Harn-Gan — Cons
- no actual money movement
- more manual input
- more validation friction
- weaker ecosystem integration
- less trust/consumer convenience than a bank-native feature

### KBank Kuntong — Pros
- probably easier for actual settlement
- likely more trusted by end users
- integrated into a payment ecosystem
- lower friction for non-technical users
- better suited to money movement workflows

### KBank Kuntong — Cons
- less transparent
- likely less customizable
- not ideal for very complex split rules
- probably harder to use as a calculation sandbox
- more platform constraints

---

## Best Fit by Use Case

### Harn-Gan is better when:
- you want detailed bill modeling
- you need custom split rules
- you want to explain the math to users
- you want a configurable internal tool
- you are building a product from scratch and want full control

### Kuntong is better when:
- you want the split to connect to actual payment behavior
- you want a familiar banking ecosystem
- you want lower friction for ordinary users
- you care more about convenience and transfer completion than math configurability

---

## Overall Judgment

If the question is “which is better?”, the answer depends on the goal:

- **For calculation depth and flexibility:** Harn-Gan is stronger
- **For payment convenience and ecosystem trust:** Kuntong is stronger

In product terms, they are optimized for different layers of the same problem:

- Harn-Gan solves the **math and rule-modeling** side
- Kuntong solves the **payment and ecosystem** side

That is why they feel similar at the user-intent level, but very different in practical capability.
