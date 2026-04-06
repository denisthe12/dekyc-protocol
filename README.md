# DeKYC Energy — walletless платформа токенизации энергетических прав на доход на Solana

[![CI Apps](https://github.com/denisthe12/dekyc-protocol/actions/workflows/ci-apps.yml/badge.svg)](https://github.com/denisthe12/dekyc-protocol/actions/workflows/ci-apps.yml)
[![CI Solana](https://github.com/denisthe12/dekyc-protocol/actions/workflows/ci-solana.yml/badge.svg)](https://github.com/denisthe12/dekyc-protocol/actions/workflows/ci-solana.yml)
[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?logo=solana&logoColor=white)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Anchor-0.32.1-1E1E1E)](#)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?logo=next.js&logoColor=white)](#)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](#)
[![Token--2022](https://img.shields.io/badge/Token--2022-enabled-14F195)](#)
[![Hackathon](https://img.shields.io/badge/National%20Solana%20Hackathon-2026-14F195)](#)

> **DeKYC Energy** — это walletless инвестиционная платформа, где пользователи входят через **DeKYC**, получают контролируемый доступ без криптокошелька и инвестируют в **токенизированные права на доход от энергетических проектов**.

[Демо](#) · [Видео-демо](#) · [Презентация](#) · [Документация](docs/) · [DeKYC](docs/DeKYC.md) · [ENERGY](docs/ENERGY.md)

---

![Логотип DeKYC Energy — placeholder](assets/logo/README-logo-placeholder.png)

---

## Что это за проект

**DeKYC Energy** — это связка из двух слоев:

- **DeKYC** — identity и permission layer, который превращает **ЭЦП / цифровую подпись пользователя** в переиспользуемый контекст идентичности и контролируемого доступа.
- **ENERGY** — прикладной сервис, где пользователь может покупать цифровые доли **именно в праве на доход**, получать выплаты и перепродавать позиции через встроенную OTC-доску.

Это не просто еще один проект по токенизации.

Главная особенность в том, что **идентификация, доступ, покупка, claim, OTC и приватные документы связаны через DeKYC**.  
Именно это делает продукт более реалистичным, безопасным и пригодным для регулируемых сценариев.

---

## Проблема

Сегодня идея «инвестировать в энергетический сектор» для обычного человека почти всегда звучит как:

- сложно;
- бюрократично;
- недоступно;
- непонятно, как войти в сделку;
- непонятно, как потом получать выплаты и выходить из позиции.

Для энергетических проектов и небольших операторов проблема обратная:

- трудно привлекать капитал;
- сложно сделать инвестиционный продукт понятным;
- тяжело упростить доступ для новых инвесторов;
- вторичный рынок почти отсутствует или неудобен.

Параллельно существует еще одна системная проблема — **идентификация и KYC**:

- пользователь снова и снова передает персональные данные разным сервисам;
- сервисы дублируют KYC-инфраструктуру;
- доступ к данным плохо контролируется;
- UX быстро ломается, если добавить блокчейн, кошельки и подписи транзакций.

---

## Решение

**DeKYC Energy** объединяет:

- **DeKYC identity + permission layer**
- **walletless UX**
- **токенизированные энергетические права на доход**
- **KZTE settlement flow**
- **epoch-based payouts**
- **OTC secondary market**
- **private docs / proof bundle**
- **judge-friendly on-chain transparency**

В результате пользователь может:

1. войти через **DeKYC**;
2. получить **custodial** on-chain identity;
3. купить доли в энергетическом проекте;
4. получать выплаты в **KZTE** или **ENERGY_POINTS**;
5. перепродавать позицию через OTC;
6. делать все это **без личного криптокошелька**.

---

## Почему DeKYC — это главная фича проекта

**DeKYC** — не вспомогательный модуль, а ключевой дифференциатор.

Большинство проектов токенизации заканчиваются на схеме:

- подключи кошелек;
- купи токен;
- посмотри транзакцию.

Мы пошли в другую сторону:

- пользователь входит через **DeKYC**;
- его идентичность подтверждается через **ЭЦП**;
- доступ к чувствительным данным контролируется permission-моделью;
- сервис получает только нужные claims и доступы;
- пользователь не обязан разбираться в кошельках, seed phrase и web3-UX.

### Почему это важно

Потому что DeKYC позволяет сделать токенизацию ближе к реальному миру:

- **ЭЦП** воспринимается как естественный источник доверия;
- чувствительные данные не размазываются по множеству сервисов;
- доступ можно контролировать и отзывать;
- продукт становится ближе к реальной регулируемой среде.

### Наш акцент

Если формулировать коротко:

> **DeKYC токенизирует контекст ЭЦП-идентичности пользователя**, превращая цифровую подпись в reusable identity layer для сервисов.

Это не означает хранение персональных данных on-chain.  
Это означает, что **ЭЦП становится основой доверенного identity-flow**, на который уже опирается ENERGY.

---

## Почему именно ENERGY

Мы выбрали energy use case не случайно.

### Для обычных граждан
Инвестирование в энергетические проекты сегодня кажется чем-то сложным и «не для них».  
Мы хотим сделать этот вход понятным.

### Для небольших энергетических проектов
Если группа людей хочет построить небольшой солнечный или ветровой объект, ей нужен понятный механизм привлечения средств.

### Для B2B / промышленных потребителей
Компания, потребляющая электроэнергию, может инвестировать в генерацию и получать доход не только в деньгах, но и в **ENERGY_POINTS**, которые в будущем могут быть использованы в утилитарной модели взаиморасчетов.

---

## Почему используется KZTE

В проекте используется **KZTE** как демонстрационный settlement token.

Это важно по нескольким причинам:

- он помогает показать понятную расчетную модель;
- он хорошо ложится на инвестиционный UX;
- он делает demo-flow ясным для судей;
- он отражает реалистичный сценарий для Казахстана, где национальный стейблкоин после зрелого этапа тестирования может упростить прозрачные инвестиционные расчеты.

---

## Почему Solana

### 1. Скорость
Продукту нужны быстрые state transitions:

- создание asset,
- primary buy,
- revenue epoch,
- claim,
- OTC listing,
- OTC fill.

### 2. Дешевые транзакции
Частые и мелкие действия с токенами и state updates должны оставаться экономически разумными.

### 3. Composability
Проект строится вокруг:

- Anchor-программ,
- PDA-based state,
- Token-2022,
- backend orchestration,
- дальнейшей интеграции с другими Solana-приложениями.

### 4. Token-2022 fit
Архитектура естественно использует:

- отдельный mint для **KZTE**,
- отдельный mint для каждого energy share asset,
- отдельный mint для **ENERGY_POINTS**.

### 5. Реальная экосистемная релевантность
Это не блокчейн «для галочки».  
Solana здесь — это слой состояния, правил, settlement и composability.

---

## Ключевые возможности

### DeKYC
- вход через сервисный auth flow;
- использование **ЭЦП** как базы доверенной идентичности;
- permission-aware access model;
- controlled service access;
- отсутствие пользовательских кошельков;
- off-chain хранение чувствительных данных;
- on-chain хеши, состояния и правила.

### ENERGY
- каталог энергетических активов;
- private/public asset detail;
- proof bundle и документы;
- primary buy;
- payout epochs;
- claim payout;
- OTC listing + fill;
- portfolio;
- history с tx links;
- judge page.

---

## Пользовательский сценарий

1. Пользователь открывает проект.
2. Проходит вход через **DeKYC**.
3. Получает локальную JWT-сессию и custodial address.
4. Получает demo airdrop **1 000 000 KZTE**.
5. Открывает каталог активов.
6. Изучает asset detail и proof bundle.
7. Покупает доли в праве на доход.
8. После создания revenue epoch делает **claim**.
9. При необходимости выставляет позицию на **OTC**.
10. Смотрит историю и judge-friendly верификацию.

---

## Скриншоты и demo-материалы

### 1. Landing page

```md
![Landing](assets/screenshots/landing.png)
```

### 2. Marketplace

```md
![Marketplace](assets/screenshots/marketplace.png)
```

### 3. Asset detail

```md
![Asset Detail](assets/screenshots/asset-detail.png)
```

### 4. Portfolio

```md
![Portfolio](assets/screenshots/portfolio.png)
```

### 5. OTC

```md
![OTC](assets/screenshots/otc.png)
```

### 6. History

```md
![History](assets/screenshots/history.png)
```

### 7. Judge page

```md
![Judge Page](assets/screenshots/judge.png)
```

### 8. Demo GIF

```md
![Demo GIF](assets/gif/demo-flow.gif)
```

---

## Архитектура

```text
┌──────────────────────────────┐
│        DeKYC Platform        │
│  ЭЦП identity + permissions  │
└──────────────┬───────────────┘
               │ service-auth / signed access
               ▼
┌──────────────────────────────┐
│        ENERGY Frontend       │
│ assets • buy • claim • OTC   │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│        ENERGY Backend        │
│ custodial signer • policy    │
│ proof bundle • epoch logic   │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│         Solana Layer         │
│ Anchor + PDA + Token-2022    │
│ assets • claims • listings   │
│ epochs • escrow              │
└──────────────────────────────┘
```

### Основные компоненты

- **apps/platform** — фронтенд DeKYC
- **apps/api** — бэкенд DeKYC
- **apps/energy-web** — фронтенд ENERGY
- **apps/energy-api** — бэкенд ENERGY
- **programs/permission_protocol** — permission-программа DeKYC
- **programs/tokenization_case** — программа ENERGY для токенизации / payouts / OTC

---

## Структура репозитория

```text
.
├── README.md
├── LICENSE
├── .github/workflows/
├── docs/
│   ├── DeKYC.md
│   ├── ENERGY.md
│   ├── architecture.md
│   ├── product.md
│   ├── api.md
│   └── roadmap.md
├── assets/
│   ├── logo/
│   ├── screenshots/
│   └── gif/
├── apps/
│   ├── api/
│   ├── energy-api/
│   ├── energy-web/
│   └── platform/
├── programs/
│   └── permission_protocol/
│       └── programs/
│           ├── permission_protocol/
│           └── tokenization_case/
└── packages/
```

---

## Документация

- [docs/DeKYC.md](docs/DeKYC.md) — подробное описание DeKYC
- [docs/ENERGY.md](docs/ENERGY.md) — подробное описание ENERGY
- [docs/architecture.md](docs/architecture.md) — архитектура
- [docs/product.md](docs/product.md) — позиционирование и user flows
- [docs/api.md](docs/api.md) — API и интеграции
- [docs/roadmap.md](docs/roadmap.md) — roadmap

---

## Quick Start

### Требования

- Node.js 20+
- pnpm 10+
- Rust stable
- Solana CLI
- Anchor 0.32.1
- PostgreSQL
- Devnet

### 1. Клонировать репозиторий

```Bash
git clone https://github.com/denisthe12/dekyc-protocol.git
cd dekyc-protocol
pnpm install
```

### 2. Подготовить environment variables

В проекте используются следующие env-файлы:

- `apps/api/.env`
- `apps/energy-api/.env`
- `apps/platform/.env.local`
- `apps/energy-web/.env.local`

Сейчас там находятся .env.example внутри которых подробная информация.

### 3. Сгенерировать Prisma clients

```Bash
pnpm --filter api prisma:generate
pnpm --filter energy-api prisma:generate
```

### 4. Собрать Solana программы

```Bash
cd programs/permission_protocol
anchor build
cd ../../
```

### 5. Запустить приложения

```Bash
pnpm dev:platform
pnpm dev:api
pnpm dev:energy-web
pnpm dev:energy-api
```

### 6. Открыть приложения

- **DeKYC frontend** — `http://localhost:3000`
- **DeKYC API** — `http://localhost:3001`
- **ENERGY frontend** — `http://localhost:3200`
- **ENERGY API** — `http://localhost:3201`

---

## CI / Proof of Work

Репозиторий включает GitHub Actions workflows для:

- **apps CI**
- **Solana / Anchor CI**

---

## Почему это интересно бизнесово

### Для energy operators
Появляется более понятный способ привлекать капитал.

### Для частных инвесторов
Энергетика становится понятнее и доступнее как инвестиционный продукт.

### Для B2B-потребителей энергии
Можно участвовать в модели с utility-like value capture через **ENERGY_POINTS**.

### Для регулируемых цифровых продуктов
DeKYC открывает путь к identity-aware onboarding и контролируемому доступу.

---

## Почему это интересно для судей

### Functionality
Проект показывает полный working flow:
login → buy → epoch → claim → OTC → history → judge page.

### Impact
Решает сразу две реальные проблемы:
- identity / KYC friction,
- доступность инвестиций в энергетику.

### Novelty
Главная новизна — **DeKYC как identity layer поверх tokenization use case**.

### UX
Walletless flow делает проект ближе к реальному продукту.

### Open-source / Composability
Архитектура разделена на reusable layers:
DeKYC можно переиспользовать и для других сервисов.

### Business potential
Проект масштабируется как в сторону energy financing, так и в сторону regulated identity infrastructure.

---

## Roadmap

### MVP сейчас
- [x] DeKYC login
- [x] walletless custodial flow
- [x] KZTE demo settlement
- [x] несколько on-chain energy assets
- [x] primary buy
- [x] revenue epoch
- [x] claim payout
- [x] OTC listing + fill
- [x] history с tx links
- [x] judge verification page
- [x] private/public asset access split
- [x] proof bundle / docs flow

### Далее
- [ ] production-grade biometric verification
- [ ] расширение DeKYC как отдельного identity layer
- [ ] richer proof bundle tooling
- [ ] investor analytics
- [ ] более продвинутая payout automation
- [ ] расширенное использование Token-2022
- [ ] интеграция с mature версией KZTE
- [ ] pilot в реальном energy / B2B use case

---