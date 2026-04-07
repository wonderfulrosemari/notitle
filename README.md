# KB 스켈레톤 프로젝트 (간단 CRUD + URL 이동)

팀원이 클론 후 바로 실행하고, URL 이동으로 CRUD를 확인할 수 있게 구성한 버전입니다.

## 1) 환경 세팅 (복붙용)

```bash
git clone https://github.com/wonderfulrosemari/notitle.git
cd 파일이동
nvm install
nvm use
npm ci
npm install -g json-server@1.0.0-beta.15
```

## 2) 실행

터미널 1 (json-server, 3001 포트):

```bash
npm run db
```

터미널 2 (Vue):

```bash
npm run dev
```

## 3) src 구조

-   `src/router/index.js`: URL 라우팅 정의
-   `src/views/BookList.vue`: 목록(GET/DELETE)
-   `src/views/AddBook.vue`: 추가/수정(POST/PUT)
-   `src/App.vue`: 상단 네비게이션 + RouterView

## 4) 현재 기준 버전

-   vue: `3.5.31`
-   axios: `1.14.0`
-   pinia: `3.0.4`
-   vue-router: `4.6.4`
-   vite: `7.3.1`
-   @vitejs/plugin-vue: `6.0.5`
-   vite-plugin-vue-devtools: `8.1.1`
-   json-server: `1.0.0-beta.15`
