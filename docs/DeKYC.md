# DeKYC — Decentralized KYC Access Protocol

> Identity and permission layer for secure, reusable, service-to-service KYC on Solana — without user wallets.

---

## Contents

- [What DeKYC is](#what-dekyc-is)
- [What problem the project solves](#what-problem-the-project-solves)
- [Key idea](#key-idea)
- [Why this is not just another KYC service](#why-this-is-not-just-another-kyc-service)
- [How the system works](#how-the-system-works)
- [Main user scenarios](#main-user-scenarios)
- [Project architecture](#project-architecture)
- [System components](#system-components)
- [On-chain and off-chain boundaries](#on-chain-and-off-chain-boundaries)
- [Permission model](#permission-model)
- [Access model for services](#access-model-for-services)
- [Why there are no user wallets in the project](#why-there-are-no-user-wallets-in-the-project)
- [Role of Solana in the project](#role-of-solana-in-the-project)
- [Role of Token-2022](#role-of-token-2022)
- [Integration with EDS and NCALayer](#integration-with-eds-and-ncalayer)
- [Biometrics and protection against using someone else’s EDS](#biometrics-and-protection-against-using-someone-elses-eds)
- [KYC Vault and protection of personal data](#kyc-vault-and-protection-of-personal-data)
- [Signed Envelope and service login](#signed-envelope-and-service-login)
- [Security](#security)
- [Blockchain publicity and honest limitations](#blockchain-publicity-and-honest-limitations)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [MVP and current status](#mvp-and-current-status)
- [Roadmap after the hackathon](#roadmap-after-the-hackathon)
- [Why this project matters](#why-this-project-matters)

---

## What DeKYC is

**DeKYC** is a protocol and platform for reusable KYC identity verification, where the user verifies their identity once, manages access to their data, and can then log in to external services through **DeKYC** without going through full KYC again every time.

In simple terms:

- the user completes identity verification in the trusted DeKYC environment;
- confirms their identity through EDS;
- configures biometrics;
- grants a specific service permission to access certain KYC attributes;
- the service receives not “everything at once”, but only the allowed set of claims;
- the user can revoke access at any time.

DeKYC is not just a website with a database. It is an **identity + permission layer**, where:

- sensitive data is stored **off-chain** in encrypted form;
- the blockchain stores **permission states, hashes, proof references, and access rules**;
- services receive access through a **signed platform response** and an on-chain-verifiable permission model.

---

## What problem the project solves

Today, KYC almost always means the same thing:

- the user uploads documents again and again;
- sends sensitive personal data to many services;
- does not control who exactly uses their KYC and when;
- cannot conveniently revoke already granted access;
- is forced to repeat the same identity verification process for every new product.

This creates several problems at once:

### 1. Excessive spread of personal data

The more services store copies of documents and biometrics, the higher the risk of leaks and misuse.

### 2. Poor user experience

Every new service forces the user to complete KYC again, even if the person has already been reliably identified before.

### 3. Lack of transparent access management

Usually the user does not see a convenient model:
- which services they granted access to;
- exactly which data;
- whether the access is still active;
- whether it can be revoked in one click.

### 4. Weak portability of identity

In the traditional model, identity is “locked” inside a separate service. It does not become a reusable asset for the ecosystem.

### 5. Too much of a web2 trust model

The service has to either fully trust its internal database or build its own heavy KYC infrastructure from scratch.

DeKYC solves this through a model of **one-time identity verification + managed permissions + blockchain-confirmed access state**.

---

## Key idea

The main idea of the project:

**The user does not share their KYC data with everyone. They manage access to it through DeKYC.**

DeKYC becomes a trusted identity gateway between the user and services.

This means:

- the user completes identity verification in one place;
- the service requests only the required claims;
- DeKYC checks the permission;
- DeKYC returns a signed result to the service;
- access can be revoked without deleting the account in the service.

An important architectural principle of the project:

> Personal data is not stored on the blockchain.  
> The blockchain stores only states, hashes, references, rules, and permission logic.

---

## Why this is not just another KYC service

DeKYC differs from a regular KYC solution for several reasons.

### 1. Reusable identity

The user does not complete full identity verification again for every new service.

### 2. Access management by the user

The user grants and revokes permissions themselves.

### 3. Blockchain is used meaningfully

Solana is not here “for show”. It stores permission state, access conditions, and acts as an independent layer of verifiability.

### 4. No need for a user crypto wallet

This is critical for real UX. The project is built so that an ordinary user does not need to understand wallets, seed phrases, Phantom, and transaction signing.

### 5. DeKYC can become a foundation for other applications

For example:
- marketplaces;
- fintech services;
- tokenization platforms;
- regulated investment apps;
- services with mandatory identity verification.

---

## How the system works

Below is the basic project flow from start to finish.

### Step 1. Registration in DeKYC

The user creates an account with email and password.

### Step 2. Biometric setup

Before linking EDS, the user completes face biometric setup. In the MVP this is mock biometrics, but the logic is already built in as a mandatory protection layer.

### Step 3. Connecting EDS through NCALayer

The user uses local NCALayer and signs a challenge.

### Step 4. Certificate analysis and KYC profile creation

The DeKYC backend receives the CMS signature, extracts certificate attributes, maps them to the KYC profile, and saves the result in protected storage.

### Step 5. Profile review

The user sees:
- basic KYC data;
- biometric status;
- EDS linking status;
- list of granted permissions.

### Step 6. Granting permission to a service

The user selects a service and allows access only to specific claims.

### Step 7. Login to a service through DeKYC

An external service makes a request to DeKYC and receives a signed response with:
- whether access is allowed;
- which claims are available;
- when the response was issued;
- when it expires.

### Step 8. Revoking permission

The user can revoke permission at any time. After that, the service should no longer receive the allowed KYC response.

---

## Main user scenarios

### Scenario 1. The user creates their DeKYC profile

1. Registers.
2. Confirms email.
3. Sets up biometrics.
4. Connects EDS.
5. Receives a ready KYC profile.

### Scenario 2. The user grants access to a service

1. Opens the list of services.
2. Sees which claims the service wants to receive.
3. Confirms granting access.
4. The permission becomes active.

### Scenario 3. The user logs in to an external service

1. Selects “Login via DeKYC”.
2. Goes through the service flow.
3. The service receives a signed response from DeKYC.
4. The user logs in without separate KYC in that service.

### Scenario 4. The user revokes permission

1. Opens the list of permissions.
2. Selects the required service.
3. Clicks revoke.
4. The service loses the right to access KYC claims.

### Scenario 5. The service receives only the minimum necessary data

Even if the service requested a set of claims, DeKYC returns not the maximum amount of data, but only the intersection of:
- what the service requested;
- what the user actually allowed.

This is an important data minimization principle.

---

## Project architecture

DeKYC consists of several logical layers.

### 1. Platform UI

The user platform, where the following are located:
- registration;
- profile;
- biometrics;
- EDS connection;
- service catalog;
- permissions;
- access management.

### 2. Service UI

External services that use login through DeKYC and receive KYC claims only if there is an active permission.

### 3. Backend API

The central policy enforcement gateway:
- verifies the EDS signature;
- stores KYC off-chain;
- manages permissions;
- forms signed envelopes for services;
- performs on-chain checks.

### 4. Solana Program

The on-chain layer, which stores:
- permission state;
- references to related entities;
- token conditions and/or access reference data;
- service states for revoke / grant logic.

### 5. Off-chain storage

Protected storage for:
- encrypted KYC payload;
- access logs;
- certificate data;
- service keys;
- permission metadata.

---

## System components

### Platform UI

Frontend platform for the user.

Key sections:
- Sign up / Sign in
- Profile
- Biometric setup
- EDS / NCALayer connection
- Services catalog
- Permissions
- Security settings

### Consumer Service UI

A separate service that does not build its own KYC again, but uses DeKYC as an identity provider.

### Backend Gateway

The server-side part of DeKYC, where all critical logic is located:
- auth;
- verification;
- KYC processing;
- permission orchestration;
- envelope signing;
- audit logging.

### On-chain Permission Layer

A Solana program that records permission state and provides verifiability of key states.

---

## On-chain and off-chain boundaries

This is one of the most important principles of the project.

### What is stored on-chain

The blockchain stores:
- KYC state hashes;
- permission states;
- service identifiers;
- references to related on-chain entities;
- revoke / grant rules;
- technical states for access verification.

### What is stored off-chain

Off-chain storage contains:
- personal data;
- extracted KYC attributes;
- certificate details;
- biometric data or its derivatives;
- encrypted payloads;
- audit logs with sensitive details.

### Why this is done

Because:
- the blockchain is public;
- storing PII on-chain is impossible and architecturally wrong;
- KYC requires a protected storage model;
- blockchain is needed here for rules, state, and verifiability, not for storing sensitive data.

---

## Permission model

DeKYC is based on a permission model.

Each permission answers the question:

> Which service did the user allow access to, which data did they allow, and is this access still active?

Each permission includes:
- user;
- service;
- set of allowed claims;
- permission state;
- creation timestamp;
- revocation status;
- on-chain reference.

### Possible states

- `ACTIVE`
- `REVOKED`
- `EXPIRED`
- `PENDING` — if an asynchronous confirmation model is needed in the future

### What revoke does

When the user revokes access:
- the on-chain state is updated;
- the service should no longer receive the allowed signed response;
- in the UI, the permission no longer counts as active;
- critical operations can be blocked immediately.

---

## Access model for services

DeKYC does not expose everything to services.

The service requests:
- who the user is;
- whether access is needed;
- which claims it would like to receive.

DeKYC responds:
- allowed or denied;
- which claims can actually be returned;
- platform signature;
- timestamps.

### Key principle

The service receives not “everything allowed in the system”, but only:

`requestedClaims ∩ allowedClaims(permission)`

This protects the user from excessive privileges and forces services to operate according to the minimum necessary access principle.

---

## Why there are no user wallets in the project

This is a deliberate architectural decision.

The goal of the project is to make identity verification and access convenient for ordinary users, not only for a web3-native audience.

If the user is forced to:
- install a wallet;
- store a seed phrase;
- sign transactions;
- understand mint/token account/PDA,

then UX immediately becomes worse and the project loses its main value as a convenient identity layer.

Therefore, DeKYC uses a **custodial / backend-controlled model**, where:
- the user interacts with a regular interface;
- blockchain operations are performed by the trusted server zone;
- the smart contract still participates in storing states and rules;
- the user gets web2 convenience, while the system gets web3 verifiability.

---

## Role of Solana in the project

Solana is used in the project not formally, but meaningfully.

### Why blockchain is needed here

- storage of permission state;
- recording key access conditions;
- verifiability of revoke / grant events;
- transparency of permission logic;
- extensibility for future consumer apps.

### What this provides

- the backend is not the only source of truth;
- permissions receive an independent layer of verifiability;
- services can build trust not only in the API, but also in the on-chain state;
- the architecture scales to other use cases.

---

## Role of Token-2022

In DeKYC, Token-2022 is used not as a marketing label, but as part of the permission mechanics and an architectural foundation for the future.

### Why it is needed

- for a flexible permission layer;
- for extensible token logic;
- for a more mature Solana architecture;
- for integration with services where access and states must be formalized at the blockchain level.

### Why this matters

The project is not limited to “a regular database and JWT”.  
It is built as an infrastructure layer where blockchain participates in the real rules of the system.

---

## Integration with EDS and NCALayer

One of the strongest elements of DeKYC is EDS integration.

### How it works

1. Frontend requests a challenge.
2. The user signs the challenge through NCALayer.
3. The signature is sent to the backend.
4. The backend analyzes the CMS signature.
5. Certificate attributes are extracted.
6. A KYC profile is formed.

### Why this matters

This makes identity verification:
- closer to real national infrastructure;
- stronger than regular “upload a passport photo”;
- more convincing for B2B scenarios;
- more interesting from a hackathon perspective.

### Why NCALayer is used

Because the project is oriented toward using EDS in a real user environment, and NCALayer is the natural integration point for a web application with local EDS keys.

---

## Biometrics and protection against using someone else’s EDS

One of the important problems of any EDS model is preventing a scenario where a person uses someone else’s certificate.

That is why DeKYC has a separate biometric stage.

### In the MVP

Currently, biometrics are implemented as a mock flow:
- face setup;
- repeated face scan;
- linking to the user profile.

### Why this is needed at all

Even in the MVP, this is conceptually important:
- it shows a second trust factor;
- it demonstrates protection against abuse;
- the system does not rely only on the fact of having a key.

### In the production version

This layer can be replaced with:
- full face verification;
- liveness;
- embedding comparison;
- enterprise-grade biometric provider.

---

## KYC Vault and protection of personal data

All personal data in DeKYC is stored in an **off-chain encrypted storage**.

### What is stored in the KYC Vault

- user profile;
- extracted claims;
- certificate data;
- service references;
- data schema version;
- encrypted payload.

### Protection approach

- data is encrypted;
- only hashes and service refs are sent to the blockchain;
- only the trusted server zone has direct access to the payload;
- data issuance to services goes through a controlled policy model;
- sensitive secrets must not appear in logs.

### Why this matters

DeKYC does not pretend to be “fully private on-chain KYC”.  
On the contrary, the project honestly separates:
- where public verifiability is needed;
- where closed protected processing of personal data is needed.

---

## Signed Envelope and service login

One of the key concepts of DeKYC is the **signed envelope**.

This is a signed backend response that the service receives during login via DeKYC.

### What the signed envelope contains

- whether access is allowed;
- which claims are available;
- service timestamps;
- expiration time;
- backend signature;
- if needed — resolved user identity for the service session.

### Why this is needed

This turns the DeKYC response from “just JSON” into:
- a verifiable assertion;
- a protected service response;
- a normal foundation for trusted login in a consumer app.

### Why this is a strong architectural element

Because the service:
- does not store the entire KYC pipeline itself;
- does not process all KYC from scratch;
- receives exactly what the user allowed;
- can build its own local session model based on the signed response.

---

## Security

Security is one of the central topics of the project.

### Main principles

#### 1. PII is not stored on-chain

Neither full name, nor address, nor biometrics, nor documents are placed on the blockchain.

#### 2. Secrets are not passed in the query string

Service keys, tokens, and sensitive parameters must go only in headers or in a protected request body.

#### 3. Backend is the trusted zone

The backend performs:
- cryptographic checks;
- key storage;
- access control;
- signed response issuance.

#### 4. The user manages access

Without an active permission, the service should not receive the allowed claims.

#### 5. Access revocation is supported

Revoke is not a decorative button, but part of the security model.

#### 6. Minimization of issued data

The service receives only what is actually needed for its scenario.

#### 7. Clear separation of system roles

It is necessary to distinguish:
- user;
- service;
- admin;
- backend signer;
- on-chain program authority.

---

## Blockchain publicity and honest limitations

It is very important to describe the project’s limitations honestly.

### What DeKYC does well

- does not expose PII on-chain;
- stores permission logic in the blockchain layer;
- increases transparency and verifiability;
- reduces excessive spread of personal data;
- provides a managed reusable identity flow.

### What DeKYC does not promise

- “complete secrecy of the blockchain”;
- absolute anonymity;
- magical invisibility of all system accounts;
- production-grade legal completeness within the MVP.

### Why this is honest

A hackathon MVP should be:
- technically strong;
- architecturally mature;
- demonstrable;
- reasonably secure;
- honest in its wording.

DeKYC is built exactly this way.

---

## Technology stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- toast / UX feedback
- modular page and component structure

### Backend

- Node.js
- TypeScript
- NestJS / modular server architecture
- DTO / guards / services / repositories
- JWT / bearer sessions
- cryptographic helpers
- audit logging

### Database

- PostgreSQL
- structured storage of users, permissions, services, logs, and KYC states

### Blockchain

- Solana
- Anchor
- PDA-based state model
- SPL Token / Token-2022
- on-chain permission state

### Crypto / Security

- AES-GCM
- secure secret storage
- envelope-like approach to data issuance
- controlled access patterns

### EDS

- NCALayer
- challenge → CMS signature → attest → analyze flow

---

## Repository structure

Below is the high-level logic of the project structure.

```text
apps/
  platform/                 # DeKYC user platform
  service/                  # demo consumer service
  api/                      # backend gateway
programs/
  permission_protocol/      # Solana permission program
packages/
  shared/                   # shared types, DTO, helpers
```

As the DeKYC ecosystem grows, it can connect new consumer apps without breaking the core identity platform.

---

## MVP and current status

The current DeKYC MVP focuses on showing a complete working scenario:

- user registration;
- bearer session;
- mock biometric setup;
- EDS connection through NCALayer;
- challenge signing;
- signature analysis and KYC formation;
- service catalog;
- grant / revoke permissions;
- service login through DeKYC;
- signed envelope;
- on-chain permission model;
- operation without user crypto wallets.

That is, the project already demonstrates the main point:  
**DeKYC is not an idea, but a working identity and access control layer.**

---

## Roadmap after the hackathon

After the hackathon, the project can be strengthened in several directions.

### 1. Production-grade biometric verification

- liveness;
- anti-spoofing;
- real embedding comparison.

### 2. Full server-side cryptographic CMS verification

- deeper certificate chain verification;
- certificate status;
- extended certificate policies.

### 3. More consumer services

- marketplace;
- fintech;
- investment platform;
- regulated onboarding apps.

### 4. Expansion of the on-chain permission model

- more complex policies;
- time windows for access;
- granular claim scopes;
- event-driven verification flows.

### 5. Improved audit layer

- richer access logs;
- event export;
- judge / compliance dashboards.

### 6. Enterprise-ready secrets management

- KMS / Vault;
- rotation;
- split trust zones;
- hardened ops model.

---

## Why this project matters

DeKYC is a project about trust, convenience, and architectural maturity.

It matters because it shows how to combine:

- real identity verification;
- user-side access control;
- KYC reuse;
- blockchain as a layer of rules and verifiability;
- normal UX without the wallet barrier;
- careful handling of sensitive data.

It is not “just a website with login”.  
It is an **infrastructure identity protocol** for new services where KYC must be:

- convenient for the user;
- controlled;
- verifiable;
- scalable.

---

## In one sentence

**DeKYC is a reusable KYC identity layer on Solana, where the user verifies their identity once, manages access to their claims themselves, and logs in to external services through a signed permission-aware protocol, without user crypto wallets and without storing personal data on-chain.**

---

## Project status

DeKYC is created as the core of a broader ecosystem of services where identity and permissions are shared infrastructure, not local logic of one application.

This is why DeKYC is not an auxiliary module, but the foundation of the entire solution.

---

## Idea contact

If explaining the project in one paragraph to a judge, investor, or technical reviewer, the wording is:

> DeKYC is a protocol and platform for secure reusable KYC identity verification, where the user verifies their identity once through EDS and biometrics, manages access to their data through a permission model, while external services receive only allowed claims through a signed service response and on-chain-verifiable state, without needing to store the entire KYC infrastructure themselves and without using user crypto wallets.

---