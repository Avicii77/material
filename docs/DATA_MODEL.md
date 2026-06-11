# DATA_MODEL — ReCos 데이터 모델 & RLS

Supabase Postgres 기준. v1 테이블만 생성하고, "나중에" 테이블은 주석으로 자리만 남긴다.
모든 테이블은 `id uuid default gen_random_uuid()`, `created_at timestamptz default now()`를 기본 포함.

---

## 1. ERD 요약

```
auth.users (Supabase 관리)
   │ 1:1
profiles ──< listings ──< listing_images
                    └────< listing_docs
profiles ──< bookmarks >── listings
profiles ──< recent_views >── listings
```

---

## 2. 테이블

### profiles  (auth.users 1:1 확장)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | = auth.users.id |
| display_name | text | 표시명 |
| contact_name | text | 담당자 이름 (연락용) |
| company_name | text | 회사명 |
| phone | text | 연락처 (로그인 시 열람) |
| contact_email | text | 연락 이메일 (로그인 시 열람) |
| region | text | 지역 |
| role | text | `user` \| `admin`, 기본 `user` |
| membership_tier | text | `free` \| `pro`, 기본 `free` — **멤버십 선반영** |
| created_at | timestamptz | |

- 가입 시 트리거로 자동 생성(`handle_new_user`): auth.users insert → profiles insert.

### listings  (원료 등록)
| 컬럼 | 타입 | 필수 | 비고 |
|---|---|:---:|---|
| id | uuid PK | | |
| owner_id | uuid FK→profiles | ✅ | 등록자 |
| title | text | ✅ | 원료명 |
| inci_name | text | ✅ | 영문명(INCI) |
| cas_no | text | ✅ | CAS-NO |
| manufacturer | text | ✅ | 제조원 |
| supplier | text | ✅ | 공급처 |
| type_category | text | ✅ | TYPES 중 1 (TAXONOMY) |
| function_tags | text[] | | FUNCTIONS 부분집합 |
| cert_tags | text[] | | CERTS 부분집합 |
| quantity | numeric | ✅ | 수량 |
| unit | text | ✅ | 단위(kg, g, L …) 기본 'kg' |
| expiry_date | date | ✅ | 유효기한 |
| has_msds | bool | ✅ | 기본 false |
| has_coa | bool | ✅ | 기본 false |
| price | numeric | | 가격(협의 시 null 허용) |
| price_negotiable | bool | ✅ | 기본 false. true면 price 무시/협의 표시 |
| discount_rate | numeric | | 할인율(%) 선택 |
| region | text | | 지역 |
| opened_status | text | | `unopened` \| `partial` (null 허용) |
| storage_condition | text | | `room` \| `cold` \| `dark` (null 허용) |
| original_packing_unit | text | | 원래 패킹 단위 |
| status | text | ✅ | `available` \| `reserved` \| `completed`, 기본 `available` |
| notes | text | | 기타사항 |
| created_at / updated_at | timestamptz | | updated_at 트리거 |

- 인덱스: `expiry_date`(임박순 정렬), `type_category`, `status`, `created_at`,
  `function_tags` GIN, `cert_tags` GIN, `title/inci_name/cas_no` 텍스트 검색용(`pg_trgm` 권장).
- 제약: `price_negotiable=false`면 `price` 권장(앱 레이어 검증). status는 CHECK 제약.

### listing_images
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| listing_id | uuid FK→listings (on delete cascade) | |
| storage_path | text | Storage 경로 |
| sort | int | 정렬 순서 기본 0 |

- 사진은 실물/패킹 구분 없이 한 칸에서 자유롭게 업로드. 등록 필수 규칙: 사진 ≥1장 (앱 레이어 검증).

### listing_docs
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| listing_id | uuid FK→listings (cascade) | |
| doc_type | text | `msds` \| `coa` \| `sds` |
| storage_path | text | |

### bookmarks (찜)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK→profiles | |
| listing_id | uuid FK→listings (cascade) | |
| created_at | timestamptz | |

- UNIQUE(user_id, listing_id).

### recent_views (최근 본)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK→profiles | |
| listing_id | uuid FK→listings (cascade) | |
| viewed_at | timestamptz | upsert로 갱신 |

- UNIQUE(user_id, listing_id), viewed_at DESC 조회. 최근 N개만 유지(앱 또는 정리 잡).

```
-- 나중에 (v1 미생성, 자리만):
-- ingredients(성분 사전), reports(신고), wants(구매희망), posts(게시판),
-- subscriptions(멤버십 결제/구독)
```

---

## 3. Storage 버킷

- `listing-images` (public read 또는 signed URL) — 실물/패킹 사진
- `listing-docs` (**비공개**, signed URL) — MSDS/COA/SDS. 서류는 민감할 수 있어 비공개 권장,
  접근은 로그인 사용자에게 signed URL 발급.

---

## 4. RLS 정책 (요지)

**profiles**
- SELECT: 본인 전체 / 타인은 공개 필드만. **연락 필드(phone, contact_email)는 앱 레이어에서
  로그인 여부로 노출 제어**(아래 5장). 단순화를 위해 listings 상세 API가 서버에서 판정.
- UPDATE: 본인만.

**listings**
- SELECT: 누구나(상태 `hidden` 도입 시 제외). 비로그인도 목록·상세 조회 가능(연락처 제외).
- INSERT: 로그인 사용자, `owner_id = auth.uid()`.
- UPDATE/DELETE: `owner_id = auth.uid()`만.

**listing_images / listing_docs**
- SELECT: images는 누구나(또는 signed). docs는 로그인 사용자만(signed URL).
- INSERT/DELETE: 해당 listing의 owner만.

**bookmarks / recent_views**
- ALL: `user_id = auth.uid()`인 본인 행만.

---

## 5. 연락처 열람 게이팅 (멤버십-Ready 핵심)

- 상세 페이지는 **서버 컴포넌트/Route Handler**에서 `lib/permissions.ts`의
  `can(user, "view_contact", listing)` 호출로 연락처 포함 여부를 결정.
- v1 규칙: 로그인 사용자면 허용, 비로그인이면 연락처 필드를 **응답에서 제거**(클라이언트로
  내려보내지 않음 — DOM 숨김만으로는 안 됨).
- 멤버십 활성화 시: `can`이 `user.membership_tier`를 검사하도록 한 줄 수정 → DB/화면 변경 불필요.

---

## 6. 마이그레이션 파일 구성 (Codex)

`supabase/migrations/0001_init.sql` 권장 순서:
1. extensions (`pgcrypto` 또는 `gen_random_uuid`, `pg_trgm`)
2. profiles + `handle_new_user` 트리거
3. listings + 인덱스
4. listing_images, listing_docs
5. bookmarks, recent_views
6. RLS enable + policies
7. storage 버킷 생성 (supabase 대시보드 또는 SQL/CLI)
