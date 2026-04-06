# ===== docs/roadmap.md =====

# DeKYC Energy — Roadmap

## Зачем нужен этот roadmap

Этот roadmap — не список случайных хотелок.

Он нужен, чтобы показать:

- что уже сделано в MVP,
- что сознательно отложено,
- как проект может реалистично расти после хакатона.

Сильный roadmap показывает, что проект — это не просто демо, а продукт с направлением развития.

---

## Текущий статус

Проект уже демонстрирует полный рабочий loop:

- вход через DeKYC
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

Этого уже достаточно, чтобы доказать core concept.

---

## Phase 1 — Hackathon MVP

## Цель
Показать полный продуктовый цикл от начала до конца в judge-friendly виде.

## Что входит в MVP

### Identity и access
- [x] вход через DeKYC
- [x] local product session
- [x] walletless entry model
- [x] private/public product-state UX

### Wallet и settlement preparation
- [x] custodial address на пользователя
- [x] demo airdrop KZTE
- [x] token account setup

### Asset layer
- [x] несколько реальных demo assets
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

### Transparency и demoability
- [x] history с tx links
- [x] judge page
- [x] OTC state на judge page
- [x] i18n
- [x] theme support
- [x] CI

---

## Phase 2 — Post-hackathon stabilization

## Цель
Сделать текущую систему чище, сильнее и ближе к production-quality.

### Engineering
- [ ] усилить test coverage
- [ ] добавить richer CI checks
- [ ] улучшить error handling
- [ ] улучшить аналитические и monitoring-поверхности
- [ ] усилить документацию

### Product polish
- [ ] улучшить onboarding guidance
- [ ] усилить judge mode
- [ ] сделать системные сообщения более понятными
- [ ] добавить более сильные demo assets и storytelling

### Data и history
- [ ] richer history records
- [ ] более явные snapshots для claims
- [ ] улучшить portfolio analytics

---

## Phase 3 — Усиление DeKYC identity layer

## Цель
Превратить DeKYC из hackathon-differentiator в reusable identity infrastructure product.

### Identity
- [ ] усилить EDS-centered identity flow
- [ ] сделать claim structure более формальной
- [ ] улучшить reusable identity model для разных сервисов

### Access control
- [ ] более granular permission scopes
- [ ] richer revoke / grant flows
- [ ] service-specific access policies

### Trust и verification
- [ ] усилить signed response model
- [ ] формализовать service-facing integration layer
- [ ] улучшить identity verification UX

### Security
- [ ] hardened secret management
- [ ] stronger audit trails
- [ ] stricter boundary вокруг private data delivery

---

## Phase 4 — Усиление ENERGY product layer

## Цель
Приблизить продукт к серьезной платформе tokenized energy financing.

### Assets
- [ ] richer asset metadata
- [ ] более сильный proof bundle standard
- [ ] better operator / project representation

### Payouts
- [ ] более автоматизированный payout cadence
- [ ] richer epoch administration
- [ ] payout simulation tools

### OTC
- [ ] partial fill support
- [ ] лучшая price discovery logic
- [ ] listing analytics
- [ ] более сильный liquidity UX

### Portfolio
- [ ] yield views
- [ ] claim forecasting
- [ ] position-level analytics

---

## Phase 5 — Реальная utility-интеграция для energy-сценария

## Цель
Сделать ENERGY use case ближе к реальному сектору.

### ENERGY_POINTS направление
- [ ] более явная utility model для energy-consuming users
- [ ] internal consumption / offset logic
- [ ] enterprise redemption / accounting concept

### Real asset validation
- [ ] stronger operator proofs
- [ ] real operational reporting model
- [ ] более формальное обновление proof bundle во времени

### Industrial scenarios
- [ ] B2B consumption-linked flows
- [ ] operator / consumer dual roles
- [ ] более реалистичная economic interpretation

---

## Phase 6 — Развитие on-chain слоя

## Цель
Усилить Solana-часть там, где это добавляет реальную ценность, не ломая product usability.

### Token-2022
- [ ] более продвинутые token behaviors
- [ ] richer mint policy design
- [ ] более формальные transfer / usage constraints там, где это нужно

### Program design
- [ ] stronger event surfaces
- [ ] более явные state transitions
- [ ] улучшенная on-chain verifiability для judge / auditor surfaces

### Cross-service reuse
- [ ] more reusable DeKYC-side on-chain permission primitives
- [ ] cleaner integration points для будущих приложений

---

## Phase 7 — Путь к production

## Цель
Понять, что потребуется для серьезного rollout path.

### Infrastructure
- [ ] hardened deployment model
- [ ] более зрелое secrets / key management
- [ ] stricter ops model

### Compliance / legal alignment
- [ ] более явная legal framing для revenue-rights продукта
- [ ] stronger identity / consent language
- [ ] более формальные процессы между оператором и инвестором

### Product packaging
- [ ] multi-tenant service mode для DeKYC
- [ ] cleaner operator admin flow для ENERGY
- [ ] external partner onboarding story

---

## Что сознательно не входит в MVP

MVP **не пытается** полностью решить:

- production-grade biometric verification
- полноценный legal securities framework
- mainnet production deployment
- реальную live-интеграцию KZTE
- advanced oracle-backed energy settlement
- полностью автоматизированный external data ingestion
- глубокую механику вторичного рынка

Это сделано специально.

Задача MVP — доказать самый сильный loop, а не притворяться full production system.

---

## Приоритеты после хакатона

Если развитие проекта продолжится, наиболее разумный порядок такой.

### Priority 1
Усилить DeKYC identity и service access model

### Priority 2
Усилить ENERGY proof bundle и payout logic

### Priority 3
Улучшить OTC flexibility и portfolio analytics

### Priority 4
Двинуться в сторону более реальных energy utility scenarios

---

## Долгосрочное стратегическое направление

В долгосрочной перспективе проект может расти в двух направлениях.

## Direction A — DeKYC как reusable identity infrastructure
DeKYC становится reusable identity и permission layer для множества регулируемых сервисов.

## Direction B — ENERGY как vertical product
ENERGY развивается в специализированный продукт для tokenized energy revenue rights и связанных settlement flows.

Именно сочетание этих двух направлений делает проект стратегически интересным.

---

## Короткое резюме roadmap

**Краткосрочно:** стабилизировать и отполировать текущий MVP.  
**Среднесрочно:** усилить DeKYC и product layer ENERGY.  
**Долгосрочно:** превратить архитектуру в reusable identity + tokenization platform с реальной отраслевой релевантностью.