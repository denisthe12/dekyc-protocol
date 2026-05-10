# DeKYC Energy — Архитектура

## Обзор

**DeKYC Energy** — это двухслойная система:

- **DeKYC** — слой идентичности, permission-логики и контролируемого доступа
- **ENERGY** — walletless инвестиционное приложение для токенизированных прав на доход от энергетических проектов

Архитектура намеренно разделена именно так, потому что одной только токенизации недостаточно для реалистичного продукта.  
Ключевая идея проекта — **идентичность, доступ, расчеты, документы и on-chain состояние должны работать вместе**.

На верхнем уровне:

- **DeKYC** отвечает на вопрос: *кто пользователь, к чему у него есть доступ и какие данные сервис может получить?*
- **ENERGY** отвечает на вопрос: *какой актив можно купить, как распределяются выплаты и как позиции торгуются на вторичном рынке?*

---

## Высокоуровневая схема системы

```text
┌──────────────────────────────────────────────────────────────┐
│                     Пользовательский слой                    │
│ Browser / UI / mock-биометрия / ЭЦП-контекст / session      │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    DeKYC Frontend                            │
│ Landing · профиль · identity UX · permission UX             │
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
│ Marketplace · Asset detail · Portfolio · OTC · History      │
│ Judge page · walletless пользовательские действия            │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     ENERGY Backend                           │
│ Custodial signer · asset orchestration · buy/claim/OTC      │
│ proof bundle handling · payouts · history · policy          │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      Solana Layer                            │
│ Anchor programs · PDA state · Token-2022 mints              │
│ revenue epochs · claim receipts · listings · escrow         │
└──────────────────────────────────────────────────────────────┘
```

---

## Почему архитектура устроена именно так

Архитектура выбрана по четырем причинам.

### 1. Реалистичный продуктовый UX
Пользователь не должен разбираться в:

- Phantom
- seed phrase
- ручных подписи транзакций
- token accounts
- PDA

Именно поэтому blockchain-операции выполняются через **доверенную backend-зону**.

### 2. Контролируемая идентичность и доступ
Чувствительные данные нельзя бесконтрольно размазывать по разным сервисам.  
DeKYC централизует:

- identity context
- access permissions
- service-facing access responses

### 3. Честное разделение on-chain и off-chain
Проект **не делает вид**, что персональные данные нужно хранить в блокчейне.

- **On-chain**: состояния, хеши, ссылки, правила
- **Off-chain**: документы, proof bundle, identity payload, чувствительные данные

### 4. Демонстрируемый hackathon flow
Судьи должны увидеть:

- реальные активы
- реальную покупку
- реальную payout-логику
- реальный OTC flow
- реальные tx links
- понятную архитектурную структуру

Эта архитектура поддерживает именно такой сценарий.

---

## Основные архитектурные принципы

### Backend — trusted execution zone
Все blockchain-операции выполняются backend-controlled signer’ом.

Сюда входит:

- создание asset
- выпуск shares
- primary buy
- create payout epoch
- claim payout
- create OTC listing
- fill OTC listing

### Никаких пользовательских кошельков
Пользователь не управляет blockchain-кошельком напрямую через интерфейс.

Вместо этого система использует:

- custodial address
- backend signer
- local JWT session
- product-native действия

### PII никогда не уходит on-chain
Персональные данные, документы и identity payload остаются off-chain.

### Блокчейн хранит правила и доказательства, а не приватные документы
В блокчейне хранятся:

- PDA состояния
- permission state
- payout state
- listing state
- hash roots
- технические ссылки и receipts

### Token-2022 используется осмысленно
Token-2022 — это часть продуктовой модели:

- **KZTE mint**
- **share mint для каждого asset**
- **ENERGY_POINTS mint**

---

## Структура монорепозитория

```text
apps/
  api/             # backend DeKYC
  platform/        # frontend DeKYC
  energy-api/      # backend ENERGY
  energy-web/      # frontend ENERGY

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

## Архитектура DeKYC

## Роль DeKYC

DeKYC — это не просто экран логина.  
Это reusable identity и permission infrastructure для всей системы.

DeKYC дает:

- service-auth вход
- identity context
- permission-aware access
- signed responses для сервисов
- переиспользуемый KYC / identity flow

## Ответственность фронтенда DeKYC

Frontend DeKYC отвечает за:

- landing / narrative проекта
- login и identity UX
- профиль и настройки
- permission awareness
- каталог сервисов
- пользовательский контроль доступа

## Ответственность бэкенда DeKYC

Backend DeKYC отвечает за:

- service-auth логику
- identity resolution
- контролируемую выдачу claims
- permission checks
- signed responses / envelopes
- EDS-driven identity logic
- off-chain protected data handling

## Почему ЭЦП важна архитектурно

В проекте **ЭЦП / цифровая подпись** — это основа доверенного identity-контекста.

Это означает:

- идентичность строится не только на email/password
- доступ к сервисам можно связывать с более сильной моделью доверия
- продукт выглядит ближе к реальной национальной и регулируемой инфраструктуре

На продуктовом языке это означает, что DeKYC превращает **контекст доверия ЭЦП** в reusable access layer для сервисов.

---

## Архитектура ENERGY

## Роль ENERGY

ENERGY — это прикладной слой, где происходит токенизированная экономическая активность.

Он отвечает за:

- каталог энергетических активов
- asset detail UX
- разделение private/public access
- primary purchases
- payouts
- OTC trading
- portfolio
- history
- judge verification view

## Ответственность фронтенда ENERGY

Frontend ENERGY реализует:

- marketplace UI
- фильтры и каталог
- подробную страницу актива
- proof bundle display
- portfolio view
- payout claim UX
- OTC UX
- transaction history
- judge page

## Ответственность бэкенда ENERGY

Backend ENERGY отвечает за:

- custodial wallet orchestration
- построение и отправку Solana-транзакций
- регистрацию активов
- синхронизацию on-chain и database projection
- payout split logic
- OTC listing management
- claim accounting
- proof bundle metadata
- private access policy

---

## Архитектура Solana-слоя

## Программы

В Solana-слое используются две программы.

### 1. `permission_protocol`
Это on-chain permission layer со стороны DeKYC.

Он нужен для:

- permission state
- grant / revoke логики
- проверяемого access state

### 2. `tokenization_case`
Это asset, payout и OTC layer со стороны ENERGY.

Он нужен для:

- energy asset registry
- share issuance
- primary buy
- payout epochs
- payout claims
- listings
- escrow-based OTC

---

## PDA-модель

Система использует явную PDA-based state model.

Ключевые аккаунты:

- `PlatformConfigPDA`
- `UserVaultPDA`
- `EnergyAssetPDA`
- `AssetTreasuryPDA`
- `OfferingPDA`
- `InvestorPositionPDA`
- `RevenueEpochPDA`
- `ClaimReceiptPDA`
- `ListingPDA`

Это важно, потому что бизнес-смысл хранится не в случайных аккаунтах, а в понятной и структурированной модели состояний.

---

## Токенная модель

### KZTE
Демонстрационный settlement token.

Используется для:

- primary purchases
- payout distribution
- OTC settlement

### Share mint
Каждый asset получает свой собственный share mint.

Используется для:

- представления позиции в revenue rights
- первичного распределения
- escrow transfer в OTC flow

### ENERGY_POINTS
Utility-style reward token для альтернативной payout-логики.

Используется для:

- альтернативного payout mode
- продуктовой дифференциации
- сценариев для energy-consuming участников

---

## Жизненный цикл актива

## 1. Create asset
Backend создает новый energy asset и сохраняет:

- metadata
- hashes
- treasury references
- mint references
- database record

## 2. Issue shares
Backend выпускает shares в treasury / controlled distribution path.

## 3. Primary buy
Пользователь покупает shares через walletless backend flow.

Backend:

- проверяет session
- проверяет wallet state
- определяет payout mode
- отправляет buy transaction
- обновляет DB projection
- сохраняет purchase history

## 4. Revenue epoch
Backend создает payout epoch для конкретного asset.

Epoch включает:

- total payout amount
- amount per share
- snapshot value
- treasury references
- epoch index

## 5. Claim payout
Пользователь делает claim.

Claim может приводить к:

- выплате в KZTE
- начислению ENERGY_POINTS
- bucket-aware payout логике

## 6. OTC listing
Пользователь выставляет shares на OTC.

MVP использует **escrow account design**, а не token freeze.

## 7. OTC fill
Другой пользователь заполняет listing.

Backend:

- проводит KZTE settlement
- освобождает shares из escrow
- обновляет позиции
- сохраняет tx references

---

## Граница между on-chain и off-chain

## Что хранится on-chain

- PDA states
- permission states
- hash roots
- payout state
- listing state
- settlement state
- receipts
- mint references

## Что хранится off-chain

- private documents
- proof bundles
- identity-sensitive data
- access metadata
- database projections
- UI-friendly denormalized records

Это разделение не случайно, а принципиально необходимо.

---

## Архитектура proof bundle

Proof bundle нужен для связи реального энергетического объекта с токенизированным правом на доход **без попытки утащить все доказательства on-chain**.

### Off-chain proof bundle включает
- документы проекта
- изображения
- supporting files
- операторские материалы
- business / legal references для MVP

### On-chain reference включает
- `proofRootHash`
- `metadataUriHash`
- state references

Это дает проекту одновременно:

- приватность и практичность
- проверяемость

---

## Модель доступа

## Public mode
Гость может видеть:

- marketplace
- non-sensitive asset preview
- общий product surface

## Private mode
Авторизованный пользователь может видеть:

- private asset detail
- proof bundle
- полный docs block
- purchase flow
- portfolio
- claim flow
- OTC flow

Это важно, потому что доступ здесь — это **product state**, а не просто backend flag.

---

## Judge view как часть архитектуры

Judge page существует для того, чтобы открыто показывать реальную структуру системы.

Судья должен иметь возможность проверить:

- assets
- positions
- payout epochs
- claim receipts
- OTC listings
- escrow share accounts
- tx links
- on-chain addresses

Это не debug-экран.  
Это архитектурная verification surface.

---

## Security architecture

### Trusted backend signer
Все on-chain операции выполняются через backend signer logic.

### Action password
Чувствительные действия пользователя могут дополнительно защищаться action password.

### Никаких секретов в query params
Секреты и чувствительные служебные значения не должны передаваться через URL.

### Минимизация утечек
UI и API не должны светить лишние внутренние данные.

### Контролируемая permission-модель
Доступ к приватной функциональности управляется через product state и backend policy.

---

## Почему эта архитектура сильна для хакатона

Она демонстрирует:

- реальное product thinking
- чистое разделение on-chain / off-chain
- реалистичный UX
- осмысленное использование Solana
- понятность для судей
- расширяемость после хакатона

Это не просто «смарт-контракт плюс страница».  
Это система с identity-, policy-, settlement- и application-слоями.

---

## Post-hackathon развитие

Архитектура уже сейчас готова расти в сторону:

- более сильной биометрической верификации
- richer proof bundle validation
- большего количества DeKYC-powered сервисов
- более автоматизированной payout logic
- enterprise / regulated pilots
- более продвинутого использования Token-2022

---

## Короткое резюме архитектуры

**DeKYC Energy** — это слоистый Solana-продукт, где DeKYC дает reusable identity и permission infrastructure, ENERGY дает walletless UX для токенизированных прав на доход, а Solana хранит проверяемое состояние, хеши и settlement-логику.