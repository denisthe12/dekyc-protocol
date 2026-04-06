# ===== docs/api.md =====

# DeKYC Energy — Обзор API

## Зачем нужен этот документ

Этот документ дает практическое описание API-слоя проекта.

Это не полный OpenAPI dump и не попытка расписать все DTO до последнего поля.  
Цель документа — помочь понять:

- какой backend за что отвечает,
- как взаимодействуют DeKYC и ENERGY,
- где живут identity, access и blockchain orchestration,
- как выглядит логика продукта с точки зрения API.

---

## API-слои системы

В проекте два backend-слоя:

## 1. DeKYC API
Путь в репозитории:

```text
apps/api
```

Отвечает за:

- identity и access logic
- service-auth
- service-facing signed access logic
- backend-логику платформы DeKYC

## 2. ENERGY API
Путь в репозитории:

```text
apps/energy-api
```

Отвечает за:

- custodial wallet orchestration
- управление энергетическими активами
- on-chain transaction orchestration
- portfolio / payouts / OTC
- proof bundle metadata
- judge summary
- пользовательские действия внутри ENERGY

---

## Обзор DeKYC API

## Основная роль
DeKYC backend — это authority для identity и permission logic.

Это backend, который отвечает на вопросы:

- кто этот пользователь,
- какой сервис запрашивает доступ,
- что именно разрешено,
- какие claims можно вернуть,
- какой signed response должен считать доверенным внешний сервис?

## Типичные логические домены
На стороне DeKYC API обычно живут модули вроде:

- auth
- service-auth
- services
- permissions
- service-api
- protocol monitor
- user cert / EDS-related flow
- KYC / identity context
- signed response logic

## Типичные DeKYC API flows

### Service-auth login
Используется, когда внешний сервис хочет войти через DeKYC.

### Permission-aware service access
Проверяет, может ли сервис получить доступ к пользователю в конкретном контексте.

### Signed envelope / signed response
Возвращает сервису контролируемый ответ с access state и разрешенными claims.

---

## Обзор ENERGY API

## Основная роль
ENERGY backend — это product execution layer.

Именно он отвечает на вопросы:

- какие assets существуют,
- кто чем владеет,
- может ли пользователь купить,
- может ли пользователь сделать claim,
- может ли он создать OTC listing,
- какую on-chain транзакцию нужно построить,
- как обновить database projection?

---

## Основные домены ENERGY API

## 1. Users
Используются для:

- current user state
- DeKYC-linked identity entry
- product profile

## 2. Wallets
Используются для:

- создания custodial wallet
- создания token accounts
- подготовки пользователя к product actions

## 3. Energy assets
Используются для:

- demo asset creation
- asset catalog
- asset metadata
- list endpoints

## 4. Positions
Используются для:

- portfolio state
- bucket-aware positions
- reconciliation после on-chain действий

## 5. Payouts
Используются для:

- epoch creation
- claim payout
- claim history
- payout records

## 6. OTC
Используются для:

- listing creation
- listing fill
- OTC board data

## 7. Judge
Используются для:

- judge summary
- verification page

## 8. Settings / security
Используются для:

- action password
- защиту чувствительных пользовательских действий

---

## Ключевые ENERGY endpoints по продуктовым flow

Ниже — flow-oriented описание API, а не список всех route path.

---

## Login и user state

### Создание сессии через DeKYC
Логическая цель:

- пользователь входит в ENERGY через DeKYC
- backend создает local product session
- backend создает или восстанавливает product-side user state

### Current user endpoint
Логическая цель:

- вернуть current user profile
- вернуть wallet state
- вернуть role / session state

---

## Wallet setup

### Ensure custodial wallet
Логическая цель:

- создать wallet, если его еще нет
- создать token accounts, если их еще нет
- подготовить пользователя к product actions

### Initial KZTE airdrop
Логическая цель:

- убедиться, что demo user имеет product-ready balance

---

## Asset endpoints

### List assets
Логическая цель:

- marketplace
- filters
- asset discovery

### Asset detail
Логическая цель:

- показать public asset data
- показать private docs при наличии доступа
- показать on-chain references
- показать proof bundle metadata

### Create demo asset
Логическая цель:

- создать asset on-chain
- создать DB projection
- подготовить demo content

---

## Buy flow

### Buy shares
Логическая цель:

- проверить session и permissions
- подготовить wallet state
- определить treasury и share accounts
- отправить on-chain buy
- обновить DB projection
- сохранить purchase history

---

## Payout flow

### Create epoch
Логическая цель:

- создать payout event для asset
- зафиксировать amount per share
- сохранить epoch projection
- выдать tx proof

### Claim payout
Логическая цель:

- проверить claimability
- вычислить payout с учетом bucket logic
- отправить on-chain claim
- при необходимости mint ENERGY_POINTS
- сохранить claim projection

### List epochs / claims
Логическая цель:

- history
- UI rendering
- judge verification

---

## OTC flow

### List listings
Логическая цель:

- user-facing OTC board

### Create listing
Логическая цель:

- переместить shares в escrow
- создать listing record
- показать listing на board

### Fill listing
Логическая цель:

- провести KZTE settlement
- освободить shares из escrow
- обновить positions
- записать history

---

## History flow

### User history
Логическая цель:

- собрать primary buy
- OTC created / sold / bought
- claims
- tx links

Это не просто raw DB dump.  
Этот endpoint нужно воспринимать как product-facing activity feed.

---

## Judge flow

### Judge summary
Логическая цель:

- отдать current system state для verification
- показать assets
- показать positions
- показать epochs
- показать claims
- показать OTC listings
- показать tx / PDA / escrow data

---

## Принципы модели данных

## API не является единственным источником истины
API оркестрирует:

- DB projections
- identity logic
- on-chain execution
- access rules

Архитектура намеренно гибридная.

## Database projections product-friendly
Chain хранит каноническое состояние для on-chain логики.  
База данных хранит product-friendly projections для:

- UI speed
- filtering
- history
- richer UX

## Sensitive data контролируется отдельно
Приватные документы и identity-sensitive данные остаются вне публичного chain state.

---

## Принципы проектирования API

### 1. Product-oriented, а не blockchain-native UX
API скрывает от пользователя wallet / signer complexity.

### 2. Backend — оркестратор
Backend отвечает за transaction building и business coordination.

### 3. Четкое разделение модулей
Identity logic и energy investment logic не смешиваются хаотично.

### 4. Честная trust model
Backend — trusted zone.  
Это сознательное решение и оно соответствует MVP-цели.

### 5. Проверяемость там, где это важно
Ключевые действия возвращают:

- tx ids
- PDAs
- refs
- hashes
- state links

---

## Пример flow summary

## Login flow
1. Пользователь проходит auth через DeKYC
2. ENERGY backend создает или восстанавливает local session
3. Обеспечивается wallet state
4. Product UI становится доступен

## Buy flow
1. Пользователь выбирает asset
2. Отправляет buy action
3. Backend валидирует и строит tx
4. On-chain state обновляется
5. DB projection обновляется
6. История пополняется

## Claim flow
1. Существует epoch
2. Пользователь делает claim
3. Backend определяет bucket-aware позиции
4. On-chain claim исполняется
5. При необходимости mint ENERGY_POINTS
6. Claim record сохраняется

## OTC flow
1. Пользователь создает listing
2. Shares уходят в escrow
3. Другой пользователь делает fill
4. Происходит settlement
5. Обе стороны получают обновленные history / positions

---

## Как можно усилить API после хакатона

После хакатона API-слой можно усилить через:

- более формальные contracts
- richer validation docs
- OpenAPI / Swagger
- signed proof bundle delivery
- более строгие permission-aware response standards
- интеграционные SDK для внешних сервисов

---

## Короткое резюме API

API-архитектура DeKYC Energy намеренно разделена на:

- **DeKYC API** для identity и permission logic
- **ENERGY API** для walletless execution, asset lifecycle, payout logic и OTC flows

Именно это разделение позволяет продукту быть цельным, но при этом не смешивать identity и tokenization concerns в один хаотичный backend.