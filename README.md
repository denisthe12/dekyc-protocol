# DeKYC ENERGY ⚡  
### Identity-powered energy rights exchange on Solana — **without user wallets**

[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?logo=solana&logoColor=white)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Anchor-0.32.1-1E1E1E)](#)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?logo=next.js&logoColor=white)](#)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](#)
[![Token--2022](https://img.shields.io/badge/Token--2022-enabled-14F195)](#)
[![Hackathon](https://img.shields.io/badge/National%20Solana%20Hackathon-2026-14F195)](#)

> **DeKYC ENERGY** — это платформа токенизации энергетических прав на доход, где пользователь входит через **DeKYC**, покупает цифровые доли энергетических проектов, получает выплаты, перепродаёт доли на встроенном OTC-маркетплейсе и при этом **вообще не использует криптокошелёк напрямую**.

---

## 🚀 Что это такое

**DeKYC ENERGY** объединяет два самостоятельных, но тесно связанных слоя:

### 1. **DeKYC**
Протокол идентификации и permission access layer, который позволяет:
- пройти идентификацию один раз;
- управлять доступом к данным;
- входить в сервисы без повторного KYC;
- работать **без пользовательских wallet’ов**.

📄 Подробно: [DeKYC.md](./DeKYC.md)

### 2. **ENERGY**
Инвестиционный сервис для токенизации **прав на доход энергетических проектов**, где:
- каждый проект выпускает свои digital shares;
- инвесторы покупают доли за **KZTE**;
- получают выплаты в **KZTE** или **ENERGY_POINTS**;
- могут продавать доли через встроенный **OTC marketplace**;
- проверяют документы и proof bundle через asset detail page и judge page.

📄 Подробно: [ENERGY.md](./ENERGY.md)

---

## ✨ Почему это сильный проект

Большинство blockchain-проектов на хакатонах показывают:
- wallet connect,
- mint токена,
- пару экранов UI,
- и “магическую” бизнес-логику где-то в презентации.

**DeKYC ENERGY** показывает полноценный рабочий продуктовый цикл:

- вход через **DeKYC**;
- автоматическое создание **custodial wallet**;
- выпуск on-chain asset;
- покупка долей;
- revenue epoch;
- claim payout;
- OTC listing + fill;
- история действий;
- proof bundle / docs;
- judge page с hashes, refs и tx links.

Это не просто demo dApp.  
Это **целостная продуктовая система** с:
- identity layer,
- access control,
- tokenized revenue rights,
- on-chain/off-chain proof architecture,
- без wallet-friction для обычного пользователя.

---

## 🧠 Главная идея

### Не токенизация “железа”, а токенизация **права на доход**

Пользователь покупает не “кусок солнечной панели” и не NFT с картинкой объекта.  
Он покупает **цифровую долю в будущей экономике конкретного энергетического актива**.

Это делает модель:
- понятнее;
- чище юридически для MVP;
- удобнее для дробного владения;
- лучше для secondary market;
- гораздо сильнее для demo перед судьями.

---

## 🔥 Что умеет проект уже сейчас

### Identity & Access
- Вход **только через DeKYC**
- JWT session
- custodial user model
- отсутствие пользовательских wallet’ов
- public / restricted / full access UX на asset detail page

### Asset Tokenization
- создание on-chain energy asset
- отдельный **share mint** для каждого актива
- metadata hash
- proof bundle support
- private/public asset detail

### Primary Market
- покупка долей за **KZTE**
- выбор payout mode:
  - `KZTE`
  - `ENERGY_POINTS`
- investor positions с bucket split по payout mode

### Revenue Distribution
- создание **revenue epoch**
- расчёт выплаты на долю
- split claim по payout buckets
- поддержка mixed portfolio:
  - часть долей → KZTE
  - часть долей → ENERGY_POINTS

### OTC Marketplace
- создание OTC listing
- escrow model
- fill listing другим пользователем
- обновление позиций после сделки

### Proof-of-Asset
- загрузка документов актива
- хранение off-chain
- SHA-256 hash документов
- proof bundle
- `proofRootHash`
- `metadataUriHash`
- отображение docs и hashes на detail page

### Judge / Demo Layer
- judge page
- tx links
- proof hashes
- blockchain refs
- split payout visibility
- история операций

---

## 🖼 Demo Flow для судей

Идеальный сценарий демонстрации:

1. **Login via DeKYC**
2. Открытие **Assets catalog**
3. Переход в **Asset detail**
4. Просмотр:
   - proof hashes
   - docs
   - blockchain refs
5. **Buy shares**
6. Переход в **Portfolio**
7. Создание **Revenue Epoch**
8. **Claim payout**
9. Переход в **OTC marketplace**
10. Создание listing
11. Покупка listing вторым пользователем
12. Проверка всего на **Judge page**

Именно этот сценарий делает проект сильным не только технически, но и с точки зрения презентации.

---

## 🏗 Архитектура на высоком уровне

```text

User → DeKYC Login → Local JWT Session  
→ Custodial Wallet → ENERGY UI  
→ Buy / Claim / OTC / Docs / Judge  
→ Backend Trusted Zone  
→ Solana + Anchor + Token-2022  
→ Off-chain docs + proof bundle + PostgreSQL

```

---

## ⚙️ Технический стек

| Layer | Stack |
|------|------|
| Frontend | Next.js 16.1.6 · React 19 · TypeScript strict · Tailwind v4 · next-intl · shadcn/ui |
| Backend | NestJS 11 · Prisma 6 · PostgreSQL · JWT · argon2 · AES-GCM |
| Blockchain | Solana · Anchor 0.32.1 · Token-2022 · SPL Token |
| Identity Layer | DeKYC service-auth · signed envelope model |
| Docs / Proof | local storage for MVP · SHA-256 · proof bundle |
| UX | dark/light theme · i18n ru/en · judge-friendly flow |

---

## 🔐 Почему здесь нет пользовательских криптокошельков

Это осознанное решение.

Обычный пользователь:
- не ставит Phantom;
- не хранит seed phrase;
- не подписывает транзакции вручную;
- не думает про ATA, mint, PDA и RPC.

Вместо этого:
- вход идёт через **DeKYC**;
- backend signer выполняет on-chain действия;
- пользователь получает web2-уровень удобства;
- а система сохраняет web3-проверяемость.

Это один из ключевых product wins проекта.

---

## 📂 Важные документы репозитория

- [DeKYC.md](./DeKYC.md) — полное подробное описание DeKYC
- [ENERGY.md](./ENERGY.md) — полное подробное описание сервиса ENERGY

Если README — это “витрина проекта”, то эти документы — его **глубокая техническая и продуктовая спецификация**.

---

## 🧱 Структура репозитория

```text

apps/
  energy-web/              # frontend ENERGY
  energy-api/              # backend ENERGY
programs/
  tokenization_case/       # Solana / Anchor program
packages/
  shared/                  # shared types / helpers
  idl/                     # generated IDL / on-chain interfaces

docs/
  DeKYC.md
  ENERGY.md

```

> Названия директорий могут немного отличаться в зависимости от текущего состояния репозитория, но логика разделения остаётся именно такой: frontend / backend / on-chain / shared.

---

## 🛠 Quick Start

### Требования
- Node.js 20+
- pnpm
- Rust
- Solana CLI
- Anchor CLI
- PostgreSQL

### 1. Клонировать репозиторий
```Bash
git clone https://github.com/denisthe12/dekyc-protocol
cd dekyc-protocol
```

### 2. Установить зависимости
```Bash
pnpm install
```

### 3. Поднять PostgreSQL и настроить env
Создай `.env` файлы для backend / frontend и укажи:
- database url
- JWT secret
- Solana RPC
- signer keypair path
- KZTE / ENERGY_POINTS mint config
- service auth config

### 4. Сгенерировать Prisma client и выполнить миграции
```Bash
pnpm --filter energy-api exec prisma generate
pnpm --filter energy-api exec prisma migrate dev
```

### 5. Собрать и задеплоить Anchor program
```Bash
anchor build
anchor deploy
```

### 6. Запустить backend
```Bash
pnpm --filter energy-api dev
```

### 7. Запустить frontend
```Bash
pnpm --filter energy-web dev
```

После этого приложение будет доступно локально, и можно пройти demo flow.

---

## 🧪 Что стоит проверить после запуска

После старта проекта рекомендованный порядок проверки такой:

1. Войти через DeKYC
2. Открыть `/assets`
3. Создать или открыть asset
4. Купить доли
5. Проверить `/portfolio`
6. Создать revenue epoch
7. Сделать claim
8. Создать OTC listing
9. Купить listing вторым пользователем
10. Проверить `/history`
11. Проверить `/judge`

---

## 📌 Что уже реализовано в MVP

- ✅ DeKYC login flow
- ✅ custodial wallets
- ✅ KZTE demo economy
- ✅ Token-2022 share mints
- ✅ asset creation
- ✅ public assets catalog
- ✅ private/public asset detail
- ✅ docs upload
- ✅ proof bundle rebuild
- ✅ primary buy
- ✅ split payout modes
- ✅ revenue epoch
- ✅ claim payout
- ✅ OTC listing + fill
- ✅ history page
- ✅ judge page
- ✅ profile page
- ✅ action password
- ✅ ru/en i18n
- ✅ dark/light theme

---

## 🛣 Что дальше после хакатона

- object storage вместо local docs storage
- полноценный manual/approval access workflow
- Merkle-based proof bundle
- partial OTC fill
- продвинутые Token-2022 extensions
- реальный oracle / meter integration
- production-grade compliance layer
- более глубокая DeKYC-service ecosystem integration

---

## 🏆 Почему этот проект хорошо подходит для blockchain track

Потому что он сочетает сразу несколько сильных сторон:

### 1. Осмысленное использование Solana
Здесь blockchain используется не как “витрина”, а как слой состояний, mint logic, claim logic, escrow OTC и proof architecture.

### 2. Сильный product thinking
Проект решает понятную проблему:
- reusable identity,
- gated access,
- tokenized energy investments,
- liquidity.

### 3. Реальный end-to-end flow
Судья может пройти весь путь от логина до claim и OTC.

### 4. Хороший UX
Нет барьера в виде пользовательского wallet.

### 5. Проверяемость
Есть:
- docs,
- hashes,
- proof bundle,
- blockchain refs,
- tx links,
- judge page.

---

## 🧭 Коротко в одной фразе

> **DeKYC ENERGY** — это identity-powered platform for tokenized energy revenue rights on Solana, где пользователь входит через DeKYC, получает доступ к приватным инвестиционным активам, покупает цифровые доли, получает выплаты и торгует ими на OTC-маркетплейсе без использования пользовательского криптокошелька.

---

## 🤝 Для кого этот репозиторий

Этот репозиторий будет полезен:

- судьям хакатона;
- blockchain инженерам;
- full-stack разработчикам;
- product reviewers;
- исследователям tokenization / reusable identity;
- командам, строящим regulated web3 сервисы.

---

## 📬 Финальный акцент

Если смотреть на проект как на систему, то здесь есть всё, что делает хакатонную работу сильной:

- яркая идея,
- понятная боль,
- нетривиальная архитектура,
- реальный Solana use case,
- законченный demo flow,
- judge-friendly verifiability,
- и продуктовый UX, который не требует от пользователя быть crypto-native.

**DeKYC ENERGY** — это не просто “ещё один blockchain demo app”.  
Это прототип экосистемы, в которой **идентификация, доступ и инвестиционные энергетические права** соединяются в единый цифровой сервис.