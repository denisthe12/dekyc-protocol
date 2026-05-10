# ===== docs/api.md =====

# DeKYC Energy — API Overview

## Why this document is needed

This document provides a practical description of the project’s API layer.

This is not a full OpenAPI dump and not an attempt to describe every DTO down to the last field.  
The purpose of this document is to help understand:

- which backend is responsible for what,
- how DeKYC and ENERGY interact,
- where identity, access, and blockchain orchestration live,
- what the product logic looks like from the API perspective.

---

## API layers of the system

The project has two backend layers:

## 1. DeKYC API

Path in the repository:

```text
apps/api
```

Responsible for:

- identity and access logic
- service-auth
- service-facing signed access logic
- backend logic of the DeKYC platform

## 2. ENERGY API

Path in the repository:

```text
apps/energy-api
```

Responsible for:

- custodial wallet orchestration
- management of energy assets
- on-chain transaction orchestration
- portfolio / payouts / OTC
- proof bundle metadata
- judge summary
- user actions inside ENERGY

---

## DeKYC API overview

## Main role

The DeKYC backend is the authority for identity and permission logic.

This is the backend that answers the questions:

- who this user is,
- which service is requesting access,
- what exactly is allowed,
- which claims can be returned,
- which signed response should be considered trusted by an external service?

## Typical logical domains

On the DeKYC API side, modules usually live such as:

- auth
- service-auth
- services
- permissions
- service-api
- protocol monitor
- user cert / EDS-related flow
- KYC / identity context
- signed response logic

## Typical DeKYC API flows

### Service-auth login

Used when an external service wants to log in through DeKYC.

### Permission-aware service access

Checks whether a service can access a user in a specific context.

### Signed envelope / signed response

Returns a controlled response to the service with access state and allowed claims.

---

## ENERGY API overview

## Main role

The ENERGY backend is the product execution layer.

It is responsible for answering the questions:

- which assets exist,
- who owns what,
- whether the user can buy,
- whether the user can make a claim,
- whether the user can create an OTC listing,
- which on-chain transaction needs to be built,
- how to update the database projection?

---

## Main ENERGY API domains

## 1. Users

Used for:

- current user state
- DeKYC-linked identity entry
- product profile

## 2. Wallets

Used for:

- custodial wallet creation
- token account creation
- preparing the user for product actions

## 3. Energy assets

Used for:

- demo asset creation
- asset catalog
- asset metadata
- list endpoints

## 4. Positions

Used for:

- portfolio state
- bucket-aware positions
- reconciliation after on-chain actions

## 5. Payouts

Used for:

- epoch creation
- claim payout
- claim history
- payout records

## 6. OTC

Used for:

- listing creation
- listing fill
- OTC board data

## 7. Judge

Used for:

- judge summary
- verification page

## 8. Settings / security

Used for:

- action password
- protection of sensitive user actions

---

## Key ENERGY endpoints by product flows

Below is a flow-oriented description of the API, not a list of all route paths.

---

## Login and user state

### Creating a session through DeKYC

Logical goal:

- the user logs in to ENERGY through DeKYC
- the backend creates a local product session
- the backend creates or restores product-side user state

### Current user endpoint

Logical goal:

- return current user profile
- return wallet state
- return role / session state

---

## Wallet setup

### Ensure custodial wallet

Logical goal:

- create a wallet if it does not exist yet
- create token accounts if they do not exist yet
- prepare the user for product actions

### Initial KZTE airdrop

Logical goal:

- make sure the demo user has a product-ready balance

---

## Asset endpoints

### List assets

Logical goal:

- marketplace
- filters
- asset discovery

### Asset detail

Logical goal:

- show public asset data
- show private docs if access exists
- show on-chain references
- show proof bundle metadata

### Create demo asset

Logical goal:

- create asset on-chain
- create DB projection
- prepare demo content

---

## Buy flow

### Buy shares

Logical goal:

- check session and permissions
- prepare wallet state
- determine treasury and share accounts
- send on-chain buy
- update DB projection
- save purchase history

---

## Payout flow

### Create epoch

Logical goal:

- create a payout event for an asset
- fix amount per share
- save epoch projection
- provide tx proof

### Claim payout

Logical goal:

- check claimability
- calculate payout with bucket logic
- send on-chain claim
- mint ENERGY_POINTS if needed
- save claim projection

### List epochs / claims

Logical goal:

- history
- UI rendering
- judge verification

---

## OTC flow

### List listings

Logical goal:

- user-facing OTC board

### Create listing

Logical goal:

- move shares into escrow
- create listing record
- show listing on the board

### Fill listing

Logical goal:

- perform KZTE settlement
- release shares from escrow
- update positions
- record history

---

## History flow

### User history

Logical goal:

- collect primary buy
- OTC created / sold / bought
- claims
- tx links

This is not just a raw DB dump.  
This endpoint should be treated as a product-facing activity feed.

---

## Judge flow

### Judge summary

Logical goal:

- return current system state for verification
- show assets
- show positions
- show epochs
- show claims
- show OTC listings
- show tx / PDA / escrow data

---

## Data model principles

## API is not the only source of truth

The API orchestrates:

- DB projections
- identity logic
- on-chain execution
- access rules

The architecture is intentionally hybrid.

## Database projections are product-friendly

The chain stores canonical state for on-chain logic.  
The database stores product-friendly projections for:

- UI speed
- filtering
- history
- richer UX

## Sensitive data is controlled separately

Private documents and identity-sensitive data remain outside public chain state.

---

## API design principles

### 1. Product-oriented, not blockchain-native UX

The API hides wallet / signer complexity from the user.

### 2. Backend is the orchestrator

The backend is responsible for transaction building and business coordination.

### 3. Clear module separation

Identity logic and energy investment logic are not chaotically mixed.

### 4. Honest trust model

The backend is a trusted zone.  
This is a conscious decision and it matches the MVP goal.

### 5. Verifiability where it matters

Key actions return:

- tx ids
- PDAs
- refs
- hashes
- state links

---

## Example flow summary

## Login flow

1. The user authenticates through DeKYC
2. The ENERGY backend creates or restores a local session
3. Wallet state is ensured
4. Product UI becomes available

## Buy flow

1. The user selects an asset
2. Sends a buy action
3. The backend validates and builds the tx
4. On-chain state is updated
5. DB projection is updated
6. History is updated

## Claim flow

1. An epoch exists
2. The user makes a claim
3. The backend determines bucket-aware positions
4. On-chain claim is executed
5. ENERGY_POINTS are minted if needed
6. Claim record is saved

## OTC flow

1. The user creates a listing
2. Shares go into escrow
3. Another user fills it
4. Settlement occurs
5. Both sides receive updated history / positions

---

## How the API can be strengthened after the hackathon

After the hackathon, the API layer can be strengthened through:

- more formal contracts
- richer validation docs
- OpenAPI / Swagger
- signed proof bundle delivery
- stricter permission-aware response standards
- integration SDKs for external services

---

## Short API summary

The API architecture of DeKYC Energy is intentionally split into:

- **DeKYC API** for identity and permission logic
- **ENERGY API** for walletless execution, asset lifecycle, payout logic, and OTC flows

This separation is what allows the product to be coherent while not mixing identity and tokenization concerns into one chaotic backend.