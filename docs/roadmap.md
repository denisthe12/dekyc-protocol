# ===== docs/roadmap.md =====

# DeKYC Energy — Roadmap

## Why this roadmap is needed

This roadmap is not a random wishlist.

It is needed to show:

- what has already been completed in the MVP,
- what has been intentionally postponed,
- how the project can realistically grow after the hackathon.

A strong roadmap shows that the project is not just a demo, but a product with a clear development direction.

---

## Current status

The project already demonstrates a complete working loop:

- login through DeKYC
- walletless user state
- energy asset catalog
- primary buy
- payout epoch
- claim
- OTC listing
- OTC fill
- history
- judge page
- private/public access split

This is already enough to prove the core concept.

---

## Phase 1 — Hackathon MVP

## Goal
Show the full product cycle from start to finish in a judge-friendly format.

## What is included in the MVP

### Identity and access
- [x] login through DeKYC
- [x] local product session
- [x] walletless entry model
- [x] private/public product-state UX

### Wallet and settlement preparation
- [x] custodial address per user
- [x] demo KZTE airdrop
- [x] token account setup

### Asset layer
- [x] multiple real demo assets
- [x] asset catalog
- [x] asset detail
- [x] on-chain references
- [x] proof bundle / docs flow

### Investment flow
- [x] primary buy
- [x] bucket-aware positions
- [x] portfolio view

### Payout flow
- [x] payout epoch creation
- [x] claim payout
- [x] KZTE / ENERGY_POINTS logic

### Secondary market
- [x] OTC listing creation
- [x] OTC fill
- [x] escrow-based listing model

### Transparency and demoability
- [x] history with tx links
- [x] judge page
- [x] OTC state on the judge page
- [x] i18n
- [x] theme support
- [x] CI

---

## Phase 2 — Post-hackathon stabilization

## Goal
Make the current system cleaner, stronger, and closer to production-quality.

### Engineering
- [ ] improve test coverage
- [ ] add richer CI checks
- [ ] improve error handling
- [ ] improve analytics and monitoring surfaces
- [ ] strengthen documentation

### Product polish
- [ ] improve onboarding guidance
- [ ] strengthen judge mode
- [ ] make system messages clearer
- [ ] add stronger demo assets and storytelling

### Data and history
- [ ] richer history records
- [ ] more explicit snapshots for claims
- [ ] improve portfolio analytics

---

## Phase 3 — Strengthening the DeKYC identity layer

## Goal
Turn DeKYC from a hackathon differentiator into a reusable identity infrastructure product.

### Identity
- [ ] strengthen the EDS-centered identity flow
- [ ] make the claim structure more formal
- [ ] improve the reusable identity model for different services

### Access control
- [ ] more granular permission scopes
- [ ] richer revoke / grant flows
- [ ] service-specific access policies

### Trust and verification
- [ ] strengthen the signed response model
- [ ] formalize the service-facing integration layer
- [ ] improve the identity verification UX

### Security
- [ ] hardened secret management
- [ ] stronger audit trails
- [ ] stricter boundary around private data delivery

---

## Phase 4 — Strengthening the ENERGY product layer

## Goal
Bring the product closer to a serious tokenized energy financing platform.

### Assets
- [ ] richer asset metadata
- [ ] stronger proof bundle standard
- [ ] better operator / project representation

### Payouts
- [ ] more automated payout cadence
- [ ] richer epoch administration
- [ ] payout simulation tools

### OTC
- [ ] partial fill support
- [ ] better price discovery logic
- [ ] listing analytics
- [ ] stronger liquidity UX

### Portfolio
- [ ] yield views
- [ ] claim forecasting
- [ ] position-level analytics

---

## Phase 5 — Real utility integration for the energy scenario

## Goal
Make the ENERGY use case closer to the real sector.

### ENERGY_POINTS direction
- [ ] more explicit utility model for energy-consuming users
- [ ] internal consumption / offset logic
- [ ] enterprise redemption / accounting concept

### Real asset validation
- [ ] stronger operator proofs
- [ ] real operational reporting model
- [ ] more formal proof bundle updates over time

### Industrial scenarios
- [ ] B2B consumption-linked flows
- [ ] operator / consumer dual roles
- [ ] more realistic economic interpretation

---

## Phase 6 — Development of the on-chain layer

## Goal
Strengthen the Solana layer where it adds real value without breaking product usability.

### Token-2022
- [ ] more advanced token behaviors
- [ ] richer mint policy design
- [ ] more formal transfer / usage constraints where needed

### Program design
- [ ] stronger event surfaces
- [ ] more explicit state transitions
- [ ] improved on-chain verifiability for judge / auditor surfaces

### Cross-service reuse
- [ ] more reusable DeKYC-side on-chain permission primitives
- [ ] cleaner integration points for future applications

---

## Phase 7 — Path to production

## Goal
Understand what will be required for a serious rollout path.

### Infrastructure
- [ ] hardened deployment model
- [ ] more mature secrets / key management
- [ ] stricter ops model

### Compliance / legal alignment
- [ ] more explicit legal framing for the revenue-rights product
- [ ] stronger identity / consent language
- [ ] more formal processes between the operator and the investor

### Product packaging
- [ ] multi-tenant service mode for DeKYC
- [ ] cleaner operator admin flow for ENERGY
- [ ] external partner onboarding story

---

## What is intentionally not included in the MVP

The MVP **does not try** to fully solve:

- production-grade biometric verification
- full legal securities framework
- mainnet production deployment
- real live KZTE integration
- advanced oracle-backed energy settlement
- fully automated external data ingestion
- deep secondary market mechanics

This is intentional.

The goal of the MVP is to prove the strongest loop, not to pretend to be a full production system.

---

## Priorities after the hackathon

If the project continues to develop, the most reasonable order is the following.

### Priority 1
Strengthen the DeKYC identity and service access model

### Priority 2
Strengthen the ENERGY proof bundle and payout logic

### Priority 3
Improve OTC flexibility and portfolio analytics

### Priority 4
Move toward more realistic energy utility scenarios

---

## Long-term strategic direction

In the long term, the project can grow in two directions.

## Direction A — DeKYC as reusable identity infrastructure
DeKYC becomes a reusable identity and permission layer for many regulated services.

## Direction B — ENERGY as a vertical product
ENERGY evolves into a specialized product for tokenized energy revenue rights and related settlement flows.

It is the combination of these two directions that makes the project strategically interesting.

---

## Short roadmap summary

**Short-term:** stabilize and polish the current MVP.  
**Mid-term:** strengthen DeKYC and the ENERGY product layer.  
**Long-term:** turn the architecture into a reusable identity + tokenization platform with real industry relevance.