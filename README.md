# KB 가계부 (PC 대시보드)

Vue 3 + Composition API + json-server 기반 가계부 프로젝트입니다.

## 실행

```bash
nvm install
nvm use
npm ci
```

터미널 1:

```bash
npm run db
```

터미널 2:

```bash
npm run dev
```

## Node 버전

- `.nvmrc`: `20.19.0`

## 데이터 파일 결정 (Day1 확정)

`db.json`은 아래 3개 컬렉션을 기본으로 사용합니다.

1. `transactions`: 거래 원장 (핵심 CRUD 대상)
2. `categories`: 카테고리 기준 정보 (수입/지출 분리)
3. `assets`: 자산/결제수단 기준 정보

### transactions 스키마

```json
{
  "id": "tr-1001",
  "date": "2026-04-01",
  "type": "income | expense",
  "asset": "계좌이체",
  "category": "급여",
  "amount": 3200000,
  "memo": "4월 급여",
  "createdAt": 1743465600000
}
```

### json-server 엔드포인트

- `GET/POST /transactions`
- `PUT/DELETE /transactions/:id`
- `GET /categories`
- `GET /assets`

## 기능 요약

- 수입/지출 거래 기록 (추가/수정/삭제)
- 기간/유형/카테고리/자산/검색 필터 조회
- 월 이동 + 이번 달 빠른 이동
- 합계/수입/지출/여유 요약 카드
- 다건 선택 삭제
