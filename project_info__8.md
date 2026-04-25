# Harn-Gan Product Direction — Split-First, Payment-Agnostic

## Summary

Your preference is actually a strong product direction: Harn-Gan should **not** try to become a Kuntong-like payment app. It should focus on doing one thing extremely well — **solve food bill splitting as accurately, clearly, and flexibly as possible** — while letting each person handle payment in whatever way they already use.

That means the app’s real value is not “moving money,” but **making the math and settlement rules understandable**:
- who ate what
- who should pay what
- who is free
- who came late
- who fronted the bill
- what everyone’s final share is

In other words, Harn-Gan should be a **bill computation and settlement-planning tool**, not a payment execution tool.

## Why This Direction Is Better for Harn-Gan

### 1) It keeps the product focused
Trying to copy Kuntong would expand the scope into:
- payment transfer flows
- account integration
- trust/authentication layers
- transaction tracking
- reminders and completion state

Those are useful features, but they are a different product category.  
If Harn-Gan stays focused on splitting logic, the team can make the core experience much stronger.

### 2) It matches the hardest user problem
The hardest part of sharing a meal bill is usually not the transfer itself.  
It is figuring out:
- what each person actually owes
- how to handle edge cases
- how to stay fair when the bill is messy

That is exactly where Harn-Gan can be best-in-class.

### 3) It avoids unnecessary friction
If payment is left to each person, the app can stay:
- lighter
- faster
- less dependent on external systems
- easier to use in different contexts

Users can just copy the result and pay however they normally do:
- bank transfer
- cash
- e-wallet
- LINE/DM
- later in person

That is often more realistic than forcing one “official” payment flow.

### 4) It gives the app a clearer identity
A product that tries to do both:
- perfect split logic, and
- payment execution

often becomes mediocre at both.

Harn-Gan can instead own a clearer identity:
> “the best app for calculating and explaining how to split a meal bill fairly”

That is a strong and memorable positioning.

---

## What Harn-Gan Should Keep as Its Core Strengths

### A) Split logic
This is the main value:
- item-based split
- even split
- late joiners
- free people
- service charge
- VAT
- shipping
- discount

### B) Settlement clarity
The app should still show:
- who paid first
- who owes whom
- how much each person’s true share is
- the final net position

Even if the app does not execute payment, users still need a clear settlement summary.

### C) Explainability
A great split app should not just show a number.  
It should explain the number:
- why this person owes more
- why this person is free
- why the payer’s share is different
- why the total lands here

This is a major product advantage over generic calculators.

---

## What Harn-Gan Should De-Emphasize

### 1) Payment execution
Do **not** try to become a payment gateway or bank-style transfer app.

### 2) Transfer tracking
If users can handle payment themselves, the app does not need:
- paid/unpaid status
- transfer confirmation
- reconciliation history
- notifications for collection

### 3) Ecosystem mimicry
It does not need to imitate Kuntong’s ecosystem behavior.  
That would dilute the product.

### 4) Overcomplicated multi-step payment UI
The current payment step is useful as a settlement summary, but it should not become the center of the product.  
The center should remain the **bill split result**.

---

## Recommended Product Positioning

A good positioning statement for Harn-Gan would be:

> “Harn-Gan helps groups split food bills fairly and clearly, especially when the bill is messy. It calculates each person’s real share, including special cases like free people and late joiners, so everyone can settle up their own way.”

This positioning is better than:
- “a payment app”
- “a money transfer app”
- “a Kuntong clone”

because it matches what Harn-Gan is already strong at.

---

## Practical Design Implications

If you follow this direction, the app should prioritize:

- better bill input flow
- stronger validation
- clearer settlement explanations
- visual breakdown of who owes what
- shareable result summary
- easy copy/share of final amounts

And it should avoid over-investing in:
- bank integrations
- transfer requests
- transaction completion tracking
- payment reminders as a primary feature

---

## Bottom Line

Your instinct is correct:  
**Harn-Gan should be the best app for solving food bill splitting, not a copy of Kuntong.**

So the product should be built around:
- **calculation accuracy**
- **fairness**
- **clarity**
- **edge-case handling**
- **easy human settlement afterward**

Payment is still relevant, but only as a consequence of the split — not as the app’s main job.