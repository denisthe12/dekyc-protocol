# DeKYC Energy — Architecture

## Overview

**DeKYC Energy** is a two-layer system:

- **DeKYC** — the layer of identity, permission logic, and controlled access
- **ENERGY** — a walletless investment application for tokenized revenue rights from energy projects

The architecture is intentionally separated this way because tokenization alone is not enough for a realistic product.  
The key idea of the project is that **identity, access, settlement, documents, and on-chain state must work together**.

At a high level:

- **DeKYC** answers the question: *who is the user, what do they have access to, and what data can the service receive?*
- **ENERGY** answers the question: *what asset can be bought, how are payouts distributed, and how are positions traded on the secondary market?*

---

## High-level system diagram

```text
┌──────────────────────────────────────────────────────────────┐
│                         User Layer                           │
│ Browser / UI / mock biometrics / EDS context / session       │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    DeKYC Frontend                            │
│ Landing · profile · identity UX · permission UX              │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     DeKYC Backend                            │
│ Service-auth · identity logic · permission logic             │
│ signed envelopes · access control · off-chain KYC vault      │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    ENERGY Frontend                           │
│ Marketplace · Asset detail · Portfolio · OTC · History       │
│ Judge page · walletless user actions                         │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     ENERGY Backend                           │
│ Custodial signer · asset orchestration · buy/claim/OTC       │
│ proof bundle handling · payouts · history · policy           │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      Solana Layer                            │
│ Anchor programs · PDA state · Token-2022 mints               │
│ revenue epochs · claim receipts · listings · escrow          │
└──────────────────────────────────────────────────────────────┘
```

---

## Why the architecture is designed this way

The architecture was chosen for four reasons.

### 1. Realistic product UX
The user should not have to understand:

- Phantom
- seed phrases
- manual transaction signing
- token accounts
- PDA

That is why blockchain operations are executed through a **trusted backend zone**.

### 2. Controlled identity and access
Sensitive data must not be distributed uncontrollably across different services.  
DeKYC centralizes:

- identity context
- access permissions
- service-facing access responses

### 3. Honest separation of on-chain and off-chain
The project **does not pretend** that personal data should be stored on the blockchain.

- **On-chain**: states, hashes, references, rules
- **Off-chain**: documents, proof bundle, identity payload, sensitive data

### 4. Demonstrable hackathon flow
Judges should see:

- real assets
- real purchase
- real payout logic
- real OTC flow
- real tx links
- clear architectural structure

This architecture supports exactly that scenario.

---

## Core architectural principles

### Backend — trusted execution zone
All blockchain operations are executed by a backend-controlled signer.

This includes:

- asset creation
- share issuance
- primary buy
- create payout epoch
- claim payout
- create OTC listing
- fill OTC listing

### No user wallets
The user does not directly manage a blockchain wallet through the interface.

Instead, the system uses:

- custodial address
- backend signer
- local JWT session
- product-native actions

### PII never goes on-chain
Personal data, documents, and identity payload remain off-chain.

### The blockchain stores rules and proofs, not private documents
The blockchain stores:

- PDA states
- permission state
- payout state
- listing state
- hash roots
- technical references and receipts

### Token-2022 is used meaningfully
Token-2022 is part of the product model:

- **KZTE mint**
- **share mint for each asset**
- **ENERGY_POINTS mint**

---

## Monorepo structure

```text
apps/
  api/             # DeKYC backend
  platform/        # DeKYC frontend
  energy-api/      # ENERGY backend
  energy-web/      # ENERGY frontend

programs/
  permission_protocol/
    programs/
      permission_protocol/
      tokenization_case/

packages/
  shared/
  idl/
```

---

## DeKYC architecture

## Role of DeKYC

DeKYC is not just a login screen.  
It is reusable identity and permission infrastructure for the whole system.

DeKYC provides:

- service-auth login
- identity context
- permission-aware access
- signed responses for services
- reusable KYC / identity flow

## Responsibility of the DeKYC frontend

The DeKYC frontend is responsible for:

- landing / project narrative
- login and identity UX
- profile and settings
- permission awareness
- service catalog
- user access control

## Responsibility of the DeKYC backend

The DeKYC backend is responsible for:

- service-auth logic
- identity resolution
- controlled claims issuance
- permission checks
- signed responses / envelopes
- EDS-driven identity logic
- off-chain protected data handling

## Why EDS is architecturally important

In the project, **EDS / digital signature** is the foundation of the trusted identity context.

This means:

- identity is not based only on email/password
- access to services can be connected to a stronger trust model
- the product looks closer to real national and regulated infrastructure

In product language, this means that DeKYC turns the **EDS trust context** into a reusable access layer for services.

---

## ENERGY architecture

## Role of ENERGY

ENERGY is the application layer where tokenized economic activity happens.

It is responsible for:

- energy asset catalog
- asset detail UX
- private/public access split
- primary purchases
- payouts
- OTC trading
- portfolio
- history
- judge verification view

## Responsibility of the ENERGY frontend

The ENERGY frontend implements:

- marketplace UI
- filters and catalog
- detailed asset page
- proof bundle display
- portfolio view
- payout claim UX
- OTC UX
- transaction history
- judge page

## Responsibility of the ENERGY backend

The ENERGY backend is responsible for:

- custodial wallet orchestration
- building and sending Solana transactions
- asset registration
- synchronization between on-chain state and database projection
- payout split logic
- OTC listing management
- claim accounting
- proof bundle metadata
- private access policy

---

## Solana layer architecture

## Programs

Two programs are used in the Solana layer.

### 1. `permission_protocol`
This is the on-chain permission layer on the DeKYC side.

It is needed for:

- permission state
- grant / revoke logic
- verifiable access state

### 2. `tokenization_case`
This is the asset, payout, and OTC layer on the ENERGY side.

It is needed for:

- energy asset registry
- share issuance
- primary buy
- payout epochs
- payout claims
- listings
- escrow-based OTC

---

## PDA model

The system uses an explicit PDA-based state model.

Key accounts:

- `PlatformConfigPDA`
- `UserVaultPDA`
- `EnergyAssetPDA`
- `AssetTreasuryPDA`
- `OfferingPDA`
- `InvestorPositionPDA`
- `RevenueEpochPDA`
- `ClaimReceiptPDA`
- `ListingPDA`

This matters because the business meaning is stored not in random accounts, but in a clear and structured state model.

---

## Token model

### KZTE
A demo settlement token.

Used for:

- primary purchases
- payout distribution
- OTC settlement

### Share mint
Each asset gets its own share mint.

Used for:

- representing a position in revenue rights
- primary distribution
- escrow transfer in the OTC flow

### ENERGY_POINTS
A utility-style reward token for alternative payout logic.

Used for:

- alternative payout mode
- product differentiation
- scenarios for energy-consuming participants

---

## Asset lifecycle

## 1. Create asset
The backend creates a new energy asset and stores:

- metadata
- hashes
- treasury references
- mint references
- database record

## 2. Issue shares
The backend issues shares into the treasury / controlled distribution path.

## 3. Primary buy
The user buys shares through a walletless backend flow.

Backend:

- checks the session
- checks wallet state
- determines payout mode
- sends the buy transaction
- updates the DB projection
- stores purchase history

## 4. Revenue epoch
The backend creates a payout epoch for a specific asset.

The epoch includes:

- total payout amount
- amount per share
- snapshot value
- treasury references
- epoch index

## 5. Claim payout
The user claims the payout.

A claim can result in:

- a payout in KZTE
- ENERGY_POINTS accrual
- bucket-aware payout logic

## 6. OTC listing
The user lists shares on OTC.

The MVP uses an **escrow account design**, not token freeze.

## 7. OTC fill
Another user fills the listing.

Backend:

- executes KZTE settlement
- releases shares from escrow
- updates positions
- stores tx references

---

## Boundary between on-chain and off-chain

## What is stored on-chain

- PDA states
- permission states
- hash roots
- payout state
- listing state
- settlement state
- receipts
- mint references

## What is stored off-chain

- private documents
- proof bundles
- identity-sensitive data
- access metadata
- database projections
- UI-friendly denormalized records

This separation is not accidental, but fundamentally necessary.

---

## Proof bundle architecture

A proof bundle is needed to connect a real energy asset with a tokenized revenue right **without trying to move all proof materials on-chain**.

### Off-chain proof bundle includes
- project documents
- images
- supporting files
- operator materials
- business / legal references for the MVP

### On-chain reference includes
- `proofRootHash`
- `metadataUriHash`
- state references

This gives the project both:

- privacy and practicality
- verifiability

---

## Access model

## Public mode
A guest can see:

- marketplace
- non-sensitive asset preview
- general product surface

## Private mode
An authorized user can see:

- private asset detail
- proof bundle
- full docs block
- purchase flow
- portfolio
- claim flow
- OTC flow

This matters because access here is a **product state**, not just a backend flag.

---

## Judge view as part of the architecture

The judge page exists to openly show the real structure of the system.

A judge should be able to verify:

- assets
- positions
- payout epochs
- claim receipts
- OTC listings
- escrow share accounts
- tx links
- on-chain addresses

This is not a debug screen.  
It is an architectural verification surface.

---

## Security architecture

### Trusted backend signer
All on-chain operations are executed through backend signer logic.

### Action password
Sensitive user actions can additionally be protected with an action password.

### No secrets in query params
Secrets and sensitive service values must not be passed through URLs.

### Leak minimization
UI and API must not expose unnecessary internal data.

### Controlled permission model
Access to private functionality is managed through product state and backend policy.

---

## Why this architecture is strong for the hackathon

It demonstrates:

- real product thinking
- clean separation of on-chain / off-chain
- realistic UX
- meaningful use of Solana
- clarity for judges
- extensibility after the hackathon

This is not just “a smart contract plus a page”.  
It is a system with identity, policy, settlement, and application layers.

---

## Post-hackathon development

The architecture is already ready to grow toward:

- stronger biometric verification
- richer proof bundle validation
- more DeKYC-powered services
- more automated payout logic
- enterprise / regulated pilots
- more advanced use of Token-2022

---

## Short architecture summary

**DeKYC Energy** is a layered Solana product where DeKYC provides reusable identity and permission infrastructure, ENERGY provides walletless UX for tokenized revenue rights, and Solana stores verifiable state, hashes, and settlement logic.