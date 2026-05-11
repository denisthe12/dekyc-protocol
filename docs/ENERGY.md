# ENERGY.md

# DeKYC ENERGY

**DeKYC ENERGY** is a service for tokenizing energy revenue rights, built as part of the **DeKYC** ecosystem.  
The service allows energy projects to issue digital shares **not in equipment**, but specifically **in the right to future revenue** from a specific asset or infrastructure object.

An investor logs in through **DeKYC**, receives access to private sections of the service, buys shares in energy projects using the demo settlement token **KZTE**, receives periodic payouts, and, if needed, resells shares on the built-in **OTC board**.  
At the same time, the user **does not use a crypto wallet directly**: all on-chain operations are performed in a **custodial model** through a backend signer.

---

## Contents

- What ENERGY is
- Why the service is needed
- Key idea of the project
- What problem ENERGY solves
- Core features
- Architectural model
- How tokenization works
- Token types in the system
- User roles
- Basic user scenario
- Working with documents and proof bundle
- Private and public access model
- Primary market
- Revenue epoch and payouts
- OTC marketplace
- Operation history and verifiability
- Judge-friendly approach
- Technical stack
- Security
- What has already been implemented in the MVP
- What is planned post-hackathon
- Why the project is strong for the blockchain track

---

# What ENERGY is

**ENERGY** is a service for digitally representing energy investment rights, where each asset is issued as a separate on-chain object with its own **share mint**, its own revenue distribution economics, and its own set of provenance proofs.

The key idea is that the investor acquires not an abstract token and not an NFT picture, but **a share in the revenue of an energy project**.  
That is, the digital asset represents the right to participate in the distribution of revenue or another predefined yield from a specific energy object.

Examples of such objects:

- solar power plants;
- microgrids;
- roof-top solar installations;
- wind clusters;
- energy storage systems;
- local energy nodes.

---

# Why the service is needed

Traditional energy projects often have a high entry threshold, a complex ownership structure, and low transparency for retail investors.  
ENERGY offers an alternative model:

- the project is structured as a set of shares;
- each share is represented digitally;
- the economics are fixed in the system;
- project documents are collected into a verifiable **proof bundle**;
- users get a clear interface for buying, holding, receiving payouts, and resale.

Thus, ENERGY is an attempt to make energy investments:

- more accessible;
- more transparent;
- more digital;
- more verifiable;
- convenient for secondary market operations.

---

# Key idea of the project

In ENERGY, what is tokenized is **the right to revenue**, not “a piece of equipment”.

This is a fundamentally important architectural and product choice.

The user does not buy “part of a solar panel” or “part of a turbine” in the literal sense.  
The user acquires a digital share in a predefined revenue distribution model from an energy asset.

This gives several advantages:

- the model is easier to explain;
- it fits fractional ownership better;
- payouts and economics are easier to automate;
- the secondary market becomes clearer;
- the legal and product logic become cleaner for the MVP.

---

# What problem ENERGY solves

## 1. High entry threshold for energy investments

Most energy projects require large capital, complex onboarding, and manual verification.

## 2. Low transparency of asset provenance

It is difficult for an ordinary investor to understand:
- whether the asset exists;
- what documents it has;
- what the revenue distribution conditions are;
- whether the immutability of documents can be verified.

## 3. Poor liquidity

Even if an investor enters a project, exiting it quickly and conveniently is often impossible.

## 4. Weak digitalization of ownership rights and payouts

Many processes are done manually, opaquely, and without a verifiable history.

ENERGY solves these problems through:
- digital shares;
- on-chain state recording;
- proof bundle;
- automated epoch payouts;
- built-in OTC market;
- history with tx links.

---

# Core features

## 1. Login only through DeKYC

The user enters the system not through a crypto wallet, but through **DeKYC**.

This means:
- a unified identification method;
- no need for Phantom or other wallets;
- unified controlled access;
- the ability to build private/public UX around a permission model.

## 2. Custodial model

After login, the user is created or assigned a **custodial wallet**, managed by the backend signer.

The user:
- does not create a seed phrase;
- does not manually sign transactions;
- does not work with RPC directly.

All Solana operations are performed by the backend layer.

## 3. Issuance of energy assets

Each asset:
- is created on-chain;
- receives its own PDA;
- receives its own **share mint**;
- can have documentation and a proof bundle;
- participates in primary and OTC market flow.

## 4. Buying shares

The user can buy shares of a specific asset using **KZTE**.

During purchase:
- the cost is calculated;
- KZTE is debited from the custodial user;
- share tokens are transferred to the user;
- an investor position is created/updated;
- purchase history is saved.

## 5. Revenue epoch and claim payout

A **revenue epoch** can be created for each asset — a revenue distribution period.

After an epoch is created:
- the distribution amount is defined;
- revenue per 1 share is calculated;
- the investor can make a **claim**;
- the payout is sent according to the payout mode.

## 6. Support for two payout modes

The user can buy shares with different payout modes:

- **KZTE**
- **ENERGY_POINTS**

This means that the same user can hold:
- part of the shares with a cash payout mode;
- part of the shares with a bonus/energy payout mode.

## 7. OTC listing + fill

After purchase, the investor can list shares on the internal OTC board.

Capabilities:
- listing creation;
- escrow shares;
- purchase by another user;
- position update after fill;
- transaction reflection in history.

## 8. Proof bundle / docs flow

Documents can be uploaded for an asset, collected into a proof bundle, hashed, and displayed on the detail page.

This strengthens trust and gives judges and users verifiability.

## 9. Judge page

A separate page for demonstrating the key states of the project:
- on-chain refs;
- assets;
- positions;
- claims;
- payout split;
- hash/proof data;
- tx links.

---

# Architectural model

## Backend as a trusted zone

In ENERGY, the backend is a trusted zone that:
- manages custodial wallets;
- signs transactions;
- works with the Solana program;
- interacts with the database;
- manages business logic.

## On-chain layer

The on-chain program is responsible for:
- PDA-based states;
- mint/share logic;
- epoch creation;
- payout claim;
- listing/fill logic;
- verifiable state transitions.

## Off-chain layer

Off-chain storage contains:
- documents;
- proof bundle manifest;
- user sessions;
- aggregated business logic;
- UI states;
- additional indexes and history.

---

# How tokenization works

Each energy asset in the system is represented as a separate entity with its own parameters:

- name;
- description;
- location;
- asset type;
- number of shares;
- share price;
- revenue distribution;
- payout modes;
- documents;
- proof hashes;
- on-chain refs.

When an asset is created:
- an on-chain `EnergyAsset` is created;
- a `share mint` is created;
- treasury accounts are created;
- metadata is saved;
- tx references are saved;
- the asset appears in the public catalog.

---

# Token types in the system

## KZTE

**KZTE** is a demo settlement token used inside ENERGY as the equivalent of an accounting unit.

Purpose:
- buying shares;
- payouts for revenue epochs;
- OTC settlement.

For the prototype, KZTE is used as a conditional token tied to the system logic, not as a real stablecoin.

## Share tokens

Each energy asset has its own **share mint**.

This token represents ownership of asset shares and is used for:
- primary buy;
- portfolio;
- OTC listing/fill;
- claim calculation.

## ENERGY_POINTS

**ENERGY_POINTS** is a separate non-cash payout mode used as an alternative reward mode.

It is needed for:
- demonstrating payout model flexibility;
- bonus logic;
- cases where the reward does not necessarily need to be paid in a settlement token.

---

# User roles

## Guest

Can:
- browse the public asset catalog;
- view public preview detail;
- study general information about assets.

Cannot:
- view private docs;
- buy shares;
- make claims;
- work with OTC;
- view full private detail.

## Authorized user without access to the asset

Can:
- log in through DeKYC;
- view restricted preview;
- request access to the asset.

## Authorized user with access

Can:
- view private asset detail;
- open documents;
- buy shares;
- receive payouts;
- create OTC listings;
- buy listings;
- see their positions and history.

---

# Basic user scenario

## 1. Login through DeKYC

The user logs in through DeKYC and receives a local JWT session.

## 2. Assignment of a custodial wallet

A custodial wallet is created for the user and demo KZTE is credited.

## 3. Viewing the asset catalog

The user opens `/assets`, filters assets, and selects an interesting project.

## 4. Opening the detail page

The user opens `/assets/[assetId]`.

Depending on access state, the user sees:
- preview;
- restricted preview;
- full detail.

## 5. Buying shares

The user opens the buy dialog and selects:
- number of shares;
- payout mode.

After confirmation, the on-chain purchase is executed.

## 6. Position appears in portfolio

The position is reflected in `/portfolio`, including bucket split by payout mode.

## 7. Revenue epoch creation

An administrator or judge flow creates a revenue epoch.

## 8. Claim payout

The user makes a claim and receives:
- KZTE;
- ENERGY_POINTS;
- or a split-claim depending on buckets.

## 9. OTC listing

The user can list shares for sale.

## 10. OTC fill

Another user can buy the listing.

## 11. History and verifiability

All actions are reflected in `/history` and on the `judge page`.

---

# Working with documents and proof bundle

One of the key parts of ENERGY is the connection between the real asset and the digital entity.

For this, the following are used:

- **EnergyAssetDocument**
- **EnergyAssetProofBundle**
- `proofRootHash`
- `metadataUriHash`

## Documents

Documents can be uploaded for an asset:
- photos;
- technical passports;
- certificates;
- geodata;
- reports;
- other supporting materials.

Each document receives:
- document type;
- file name;
- mime type;
- file URL;
- SHA-256 hash;
- size;
- createdAt.

## Proof bundle

A set of documents is assembled into a bundle.

The bundle contains:
- assetId;
- bundleVersion;
- generatedAt;
- list of documents;
- document hashes;
- metadata.

A **proofRootHash** is calculated from the canonical manifest.

## Why this is needed

This allows:
- documents to be stored off-chain;
- large binary files not to be dragged into the blockchain;
- while still fixing data integrity;
- showing a verifiable connection between the real asset and the token.

---

# Private and public access model

ENERGY implements separation into:
- **public preview**
- **restricted preview**
- **full access**

## Public preview

Available without login.

Shows:
- basic information about the asset;
- description;
- location;
- core economics;
- proof hashes;
- basic on-chain refs.

Does not show:
- private docs;
- purchase;
- private sections.

## Restricted preview

Available after login, but without full access grant.

Shows:
- the same preview information;
- a clear UI state that the asset requires additional access;
- CTA to request access.

## Full access

Available to the user who has been granted access control for the asset.

Opens:
- documents;
- buy flow;
- private asset detail;
- full set of refs;
- private docs and proof context.

---

# Primary market

Primary market is the mechanism for the initial purchase of asset shares.

## What primary buy does

- determines the cost `shareAmount * pricePerShareKzte`;
- debits KZTE from the user;
- transfers shares from treasury;
- creates or updates investor position;
- records the transaction in the database and history.

## Payout mode support

The purchase takes the selected payout mode into account:
- `KZTE`
- `ENERGY_POINTS`

This means that the user can have several positions for the same asset, but with different payout modes.

---

# Revenue epoch and payouts

## Revenue epoch

A revenue epoch is a revenue distribution event for a specific asset.

For an epoch, the following are fixed:
- assetId;
- epochIndex;
- totalAmountKzte;
- amountPerShareKzte;
- totalSharesSnapshot;
- tx;
- status.

## Claim payout

During claim, the system:
- determines the user’s positions by asset;
- takes payout buckets into account;
- makes split payout;
- forms claim receipts;
- saves history.

If the user has:
- 10 shares in `KZTE`
- 2 shares in `ENERGY_POINTS`

then the claim will be split into 2 bucket parts.

This makes the payout model flexible and technically mature.

---

# OTC marketplace

OTC in ENERGY is a built-in secondary market board for trading shares.

## Capabilities

- create a listing;
- choose the number of shares;
- specify price per share;
- choose payout bucket;
- transfer shares into escrow;
- allow another user to buy the listing.

## After fill

- seller position decreases;
- buyer position is updated or created;
- KZTE is moved;
- share tokens are transferred;
- history is recorded;
- tx links are saved.

## Why OTC matters

OTC shows that the project is not only asset issuance and purchase, but also **liquidity**, meaning the ability to exit a position.

---

# Operation history and verifiability

ENERGY stores the history of:
- purchases;
- claims;
- listing creation;
- listing fill;
- epoch creation.

History is needed for:
- transparency;
- UX;
- judge demo;
- quick navigation through tx links;
- understanding what happened to an asset and the user’s position.

---

# Judge-friendly approach

ENERGY is intentionally designed so that it can be conveniently shown at a hackathon.

For this, the service has:
- judge page;
- blockchain refs;
- proof hashes;
- asset detail page with docs;
- tx links;
- split payout visibility;
- access state UX;
- public showcase and private detail page.

A judge can sequentially see:
1. catalog;
2. asset;
3. documents and hashes;
4. purchase;
5. portfolio;
6. epoch;
7. claim;
8. OTC;
9. history;
10. judge summary.

---

# Technical stack

## Frontend

- Next.js 16.1.6
- React 19
- TypeScript strict
- Tailwind CSS v4
- next-intl
- shadcn/ui
- framer-motion

## Backend

- NestJS 11
- Prisma 6
- PostgreSQL
- JWT / Passport-JWT
- AES-GCM
- argon2

## On-chain

- Solana
- Anchor 0.32.1
- @solana/web3.js
- @solana/spl-token
- Token-2022

---

# Security

ENERGY is designed as an MVP, but with realistic security assumptions.

## Key principles

### 1. No direct user wallets

The user does not work with a seed phrase and does not interact with the blockchain directly.

### 2. Backend signer as trusted signer

All signatures are centralized in the backend trusted zone.

### 3. Private docs are not published openly

Documents are available only with full access to the asset.

### 4. Off-chain document storage

The files themselves are not sent to the blockchain, only hashes and refs.

### 5. Action password

Critical actions are confirmed with an action password.

### 6. Split access states

Unauthorized and restricted users do not get full access to the asset.

---

# What has already been implemented in the MVP

At the current stage, the ENERGY MVP already implements:

- login through DeKYC + local JWT session;
- custodial wallet model;
- demo KZTE funding;
- on-chain asset creation;
- metadata hash;
- primary buy;
- split payout mode;
- portfolio;
- revenue epoch creation;
- claim payout;
- split claims;
- OTC listing + fill;
- history;
- judge page;
- profile page;
- public assets catalog;
- private/public asset detail;
- docs upload;
- proof bundle rebuild;
- proofRootHash generation;
- theme support;
- i18n ru/en.

---

# What is planned post-hackathon

The following improvements are logical to move beyond the hackathon MVP:

- real permission approval workflow;
- object storage instead of local storage;
- Merkle proof bundle instead of simplified canonical hash;
- full admin panel for asset moderation;
- manual/automatic compliance review;
- cron-based epoch automation;
- partial OTC fill;
- deeper Token-2022 extensions;
- oracle/meter integration;
- extended issuer workflows;
- more advanced yield analytics.

---

# Why the project is strong for the blockchain track

ENERGY is a strong candidate for the blockchain track because it combines:

## 1. Real business logic

The project is not limited to wallet connect and token transfers.  
It models a full product scenario of an investment service.

## 2. Meaningful use of Solana

It uses:
- Anchor;
- PDA-based state;
- Token-2022;
- share mints;
- claim receipts;
- escrow-based OTC;
- revenue epochs.

## 3. Good UX

The user does not have to understand blockchain or work with a wallet directly.

## 4. Verifiability

There are:
- tx links;
- hashes;
- proof bundle;
- docs;
- judge page.

## 5. Built-in demonstrability

The project can be shown as a complete end-to-end flow:
- login;
- asset;
- buy;
- epoch;
- claim;
- otc;
- history;
- judge verification.

---

# Summary

**DeKYC ENERGY** is a service for tokenizing energy revenue rights, built as a real product layer on top of DeKYC and Solana.

It combines:
- private access;
- custodial model;
- asset issuance;
- digital shares;
- payouts;
- OTC liquidity;
- documentary verifiability;
- convenient UX for users and judges.

For the hackathon MVP, ENERGY demonstrates not just a set of smart contracts or UI screens, but a **complete product system** where a real asset, digital token, investment logic, and access through DeKYC are connected into one verifiable service.