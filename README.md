# 라퀴진 클럽 (요리 동호회) 샘플 사이트

강의용으로 제작한 요리 동호회 웹사이트입니다. 순수 HTML/CSS/JS + Supabase(JS SDK, CDN)로 만들어져 있어서, 별도 빌드 과정 없이 바로 열어볼 수 있어요.

## 1. 먼저 할 일 — Supabase 테이블 만들기

1. https://supabase.com 대시보드에서 해당 프로젝트로 들어갑니다.
2. 왼쪽 메뉴 **SQL Editor** → **New query** 를 클릭합니다.
3. 이 폴더의 `sql/schema.sql` 내용을 전부 복사해서 붙여넣고 **Run** 을 누릅니다.
   - `cook_notices`(공지사항), `cook_recipes`(레시피), `cook_meetings`(정기모임) 3개 테이블이 만들어집니다.
   - RLS(Row Level Security)를 켜두었고, 강의/데모용으로 익명 사용자도 조회·작성·수정·삭제가 가능하도록 정책을 열어뒀습니다.
   - 파일 아래쪽에 샘플 데이터도 몇 건 들어있어요. 필요 없으면 그 부분만 지우고 실행해도 됩니다.

> ⚠️ 이 설정은 "로그인 없이 누구나 글을 쓰고 지울 수 있는" 데모용 구조입니다. 실제 서비스로 쓰려면 Supabase Auth로 로그인을 붙이고, RLS 정책을 "본인 글만 수정/삭제 가능"하도록 좁혀야 합니다.

## 2. 사이트 열어보기

- 폴더 전체를 그대로 웹 호스팅(예: Vercel, Netlify, GitHub Pages)에 올리거나,
- 로컬에서 `index.html`을 더블클릭해서 바로 열어봐도 됩니다. (별도 서버 없이 동작하도록 만들었어요.)

## 3. 폴더 구조

```
cooking-club-site/
├── index.html          # 홈 (이번 달 모임, 최근 공지/레시피 미리보기)
├── about.html           # 소개
├── notice.html          # 공지사항 게시판 (CRUD)
├── recipe.html          # 레시피 게시판 (CRUD, 카테고리 필터)
├── meeting.html         # 정기모임 안내 (CRUD)
├── contact.html         # 오시는길·문의
├── css/style.css        # 공통 디자인 (오렌지 메인 컬러 + 크림/허브그린)
├── js/
│   ├── common.js         # 모든 페이지 공통 (네비게이션, 포맷팅, 토스트) — Supabase 불필요
│   ├── supabase-client.js# Supabase 클라이언트 초기화 (URL/anon key)
│   ├── home.js            # 홈 동적 데이터
│   ├── notice.js          # 공지사항 CRUD
│   ├── recipe.js          # 레시피 CRUD
│   └── meeting.js         # 정기모임 CRUD
├── assets/
│   ├── hero-kitchen.svg   # 홈 히어로 일러스트 (커스텀 제작, 저작권 이슈 없음)
│   └── motif-strip.svg    # 여분 장식용 일러스트
└── sql/schema.sql        # 테이블 생성 SQL (Supabase SQL Editor에서 실행)
```

## 4. 데이터베이스 구조 (접두어 `cook_`)

| 테이블 | 설명 | 주요 컬럼 |
|---|---|---|
| `cook_notices` | 공지사항 | title, content, author, created_at |
| `cook_recipes` | 레시피 게시판 | title, category, content, author, created_at |
| `cook_meetings` | 정기모임 안내 | meeting_date, meeting_time, location, theme, host, max_participants, description |

세 게시판 모두 목록 조회 / 글쓰기 / 수정 / 삭제(CRUD)가 화면에서 바로 동작합니다.

## 5. 디자인 메모

- 메인 컬러는 구리빛 오렌지(`#C1622A`)이고, 크림색 배경(`#FBF3E6`)과 허브 그린(`#45573A`)을 보조로 사용했습니다.
- "프랑스 빈티지 주방" 느낌은 실제 사진 대신 구리 냄비·거품기·허브·항아리를 그린 커스텀 SVG 일러스트로 표현했어요. (저작권 걱정 없이 자유롭게 색상만 바꿔써도 됩니다.)
- 제목 폰트는 `Gowun Batang`(세리프), 본문은 `Noto Sans KR`을 사용했습니다.
