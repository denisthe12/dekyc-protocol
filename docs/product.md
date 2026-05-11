# DeKYC Energy — Product

## Product in one sentence

**DeKYC Energy** is a walletless product that allows users to log in through **DeKYC**, invest in **tokenized energy revenue rights**, receive payouts, and trade positions through OTC — without a personal crypto wallet.

---

## Product vision

The long-term vision is to make participation in energy as understandable as using a modern digital product:

- simple login
- clear asset selection
- transparent income
- ability to exit a position when needed
- no unnecessary bureaucracy or web3 friction

Instead of the scenario “energy is complicated and not for me”, the user should get:

- a clear login through DeKYC
- controlled access
- investment UX
- transparent action history
- verifiable on-chain links

---

## What problem the product solves

The product solves two connected problems.

### Problem 1 — investing in energy is too complicated

For most people, the energy sector looks:

- too complex
- too legal-heavy
- too bureaucratic
- too far from normal digital UX

### Problem 2 — onboarding and access are too painful

Even if the investment idea is good, the real barriers are often:

- repeated KYC
- duplication of personal data
- excessive trust in multiple services
- wallet friction
- unclear product entry

### Product answer

DeKYC Energy makes participation in energy:

- more understandable,
- more accessible,
- more verifiable,
- more product-oriented.

---

## Main product thesis

The key thesis of the project:

> Tokenization of energy rights becomes much stronger when identity, access, settlement, documents, and UX are solved together.

This is why the project is not just “tokenization”.

It combines:

- **DeKYC**
- **walletless UX**
- **Solana settlement**
- **energy asset marketplace**
- **epoch-based payouts**
- **OTC liquidity**

---

## Why DeKYC is the central part of the product

DeKYC is the main differentiator of the project.

Most hackathon tokenization projects come down to this pattern:

- connect a wallet
- buy a token
- view a transaction

DeKYC Energy goes in a different direction: the user enters through an **identity and permission layer**.

### What this gives the product

DeKYC brings into the product:

- reusable identity
- stronger trust context
- permission-aware access
- more realistic onboarding
- a more convincing narrative for the real market

### The role of digital signature in product positioning

An important focus of the project is **EDS / digital signature**.

This matters because:

- the user does not look like an anonymous wallet address
- the product is closer to real trusted infrastructure
- the identity layer gets a stronger foundation
- the project is more distinct from ordinary web3 tokenization

In short:

> DeKYC turns the trusted context of EDS into a reusable identity layer for services.

---

## Who this product is for

## 1. Retail investor

A user who needs:

- clear login
- a clear investment scenario
- a product without wallets
- transparent history and payout logic

## 2. Small energy operator

A team building a small solar / wind / distributed energy project that wants to attract capital through a clear digital product.

## 3. B2B / industrial energy consumer

A company that consumes electricity and may be interested in participating in generation-side economics.

For this segment, the payout mode through **ENERGY_POINTS** is especially interesting.

## 4. Judge / investor / stakeholder

The project is built so it can be quickly checked and understood:

- judge page
- tx links
- PDA references
- escrow accounts
- claims
- epochs
- proof bundle

---

## Product pillars

## 1. Walletless UX

The user does not have to understand blockchain primitives to use the product.

## 2. Identity-aware access

The user logs in through DeKYC, not through a raw wallet.

## 3. Revenue-rights positioning

The user buys not “a piece of a panel”, but a **digital share in the right to revenue**.

## 4. Flexible payout modes

The system supports different economic scenarios for different types of participants.

## 5. Secondary liquidity

The user should not be locked in a position forever.

---

## Core product components

## Landing

Explains the connection between DeKYC and Energy.

## Login / access

Mock biometric + DeKYC-based service entry.

## Asset marketplace

Catalog of energy assets.

## Asset detail

Asset page with:

- description
- economics
- proof bundle
- public / private split
- on-chain references

## Portfolio

The user sees their positions grouped by asset, but with payout buckets taken into account.

## Payouts

The user claims from revenue epochs.

## OTC

The user creates a listing or buys someone else’s position.

## History

The user understands what they have already done in the system.

## Judge page

An external reviewer can verify the real operation of the product.

---

## Main user flow

## 1. Login through DeKYC

The user starts not with connect wallet, but with identity-based entry.

## 2. Preparation of walletless state

The system prepares:

- custodial wallet
- token accounts
- KZTE balance

## 3. Exploring the marketplace

The user views assets even before going deeper into the product.

## 4. Opening asset detail

On the asset page, the user can access:

- economic context
- project data
- proof bundle
- on-chain refs
- entry point for purchase

## 5. Buying shares

The purchase happens without user wallet operations.

## 6. Receiving payouts

After an epoch is created, the user can claim.

## 7. Exit through OTC

The user can list their position on OTC.

## 8. Checking history

History makes the product understandable and transparent.

---

## Product states

## Guest state

A guest sees:

- public landing
- public asset preview
- marketplace surface

## Logged-in state

The user gets:

- session
- access to portfolio/history
- product identity
- walletless capability

## Restricted private state

The user may be logged in but still limited in access to some private scenarios.

## Full product state

The user gets full access to private asset data and core flows.

This is important because access in the project is part of **UX and product state**, not just a backend switch.

---

## Asset model

Each asset represents a real economic object inside the product.

The user buys not “equipment in pieces”, but **shares in the right to revenue**.

An asset includes:

- title
- description
- location
- asset type
- total shares
- price per share
- investor / operator split
- supported payout modes
- proof bundle
- on-chain references

---

## Payout model

The payout model is built around epochs.

This means:

- revenue is represented as payout epochs
- an epoch has a total amount
- the system calculates amount per share
- the user claims according to their shares and payout buckets

This is a very strong product model because it is easy to explain in a demo.

---

## Payout modes

The system supports at least two payout modes.

### KZTE

Suitable for classic investment return.

### ENERGY_POINTS

Suitable for utility-like or consumption-linked return.

This is an important product feature because the same asset becomes interesting to different types of participants.

---

## OTC model

OTC is an embedded secondary market.

It is needed because primary issuance alone is not enough.

The user should be able to:

- exit a position
- rebalance a portfolio
- sell a share to another participant

The MVP uses:

- listing creation
- escrow-based transfer model
- fill flow
- tx-linked history

This is a pragmatic and demo-friendly design.

---

## Why the product looks plausible

The product looks convincing because it avoids typical weaknesses of hackathon projects.

### It does not force the user to use a wallet

This removes a major UX barrier.

### It does not pretend that private documents should live on-chain

This is honest and architecturally mature.

### It does not try to pretend to be a complete legal securities platform

The MVP stays within a reasonable and honest zone.

### It shows a complete working loop

And this matters more than exaggerated promises.

---

## UX principles

### 1. Explain first, then ask for action

The user should first understand the asset.

### 2. Show proof, not just promises

Proof bundle, tx links, and judge page really matter.

### 3. Minimize web3 friction

The user should feel the product, not the protocol.

### 4. Make access explicit

Private / public mode should be understandable.

### 5. Make history readable

The user should understand what has already happened.

---

## How the product differs from a regular tokenization demo

Most tokenization demos stop at:

- create token
- buy token
- show explorer link

DeKYC Energy goes further:

- identity-aware entry
- private/public access split
- proof bundle concept
- payout epochs
- claims
- OTC market
- portfolio + history
- judge verification surface

This combination is what makes the project look like a product, not a tech demo.

---

## MVP scope

The current MVP focuses on:

- DeKYC login
- custodial user state
- several demo assets
- primary buy
- manual epoch creation
- claim payout
- OTC listing + fill
- history
- judge page
- proof bundle / docs UX
- i18n + theme

---

## Post-hackathon direction

The most natural next steps:

- strengthen DeKYC identity UX
- make the proof bundle richer and closer to the real world
- add investor analytics
- strengthen payout automation
- test enterprise onboarding / pilot logic

---

## Short product summary

**DeKYC Energy** is a walletless, identity-aware investment product for tokenized energy revenue rights, showing that real tokenization becomes much stronger when identity, access, documents, settlement, and UX are solved together.