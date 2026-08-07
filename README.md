# 보홀 · 시키호르 여행 일정표 (2026.09.13–18)

팡라오 · 시키호르 스노클링 여행 일정표입니다. `index.html` 한 장짜리 정적 페이지이고 외부 의존성이 없습니다 (CSS·JS 전부 인라인).

---

## GitHub Pages로 올리기

### 방법 A — 웹 브라우저만으로 (제일 쉬움, 3분)

1. https://github.com/new 에서 새 리포 생성
   - 이름: `bohol-2026` (아무거나)
   - **Public 선택** ← 중요. 무료 계정은 Private 리포에 Pages를 못 씁니다 (Pro 이상 필요)
   - "Add a README file" 체크 해제
2. 만들어진 빈 리포 화면에서 **uploading an existing file** 클릭
3. `index.html` 과 `README.md` 를 드래그해서 올리고 **Commit changes**
4. 리포 상단 **Settings → Pages**
   - Source: `Deploy from a branch`
   - Branch: `main` / 폴더 `/ (root)` → **Save**
5. 1~2분 뒤 주소가 뜹니다:
   `https://<깃허브아이디>.github.io/bohol-2026/`

### 방법 B — 터미널에서

```bash
cd bohol-2026

git init
git add .
git commit -m "보홀 시키호르 일정표"
git branch -M main

# 아래 <깃허브아이디> 를 본인 것으로 바꾸세요
git remote add origin https://github.com/<깃허브아이디>/bohol-2026.git
git push -u origin main
```

푸시한 뒤 **Settings → Pages**에서 Branch를 `main` / `/ (root)`로 지정하면 끝입니다.

> `gh` CLI가 깔려 있다면 리포 생성까지 한 번에:
> ```bash
> gh repo create bohol-2026 --public --source=. --push
> ```

---

## 비공개로 유지하고 싶다면

GitHub Pages는 **무료 계정에서 Private 리포를 지원하지 않습니다.** 선택지는 셋입니다.

| 방법 | 비용 | 비고 |
|---|---|---|
| **GitHub Pro** | 월 $4 | Private 리포 + Pages 가능. 링크를 아는 사람만 접근하도록 설정 |
| **Public 리포로 두기** | 무료 | 실질적으로는 URL을 아는 사람만 찾아옵니다. 개인정보가 없는 문서라 무난 |
| **Cloudflare Pages / Netlify** | 무료 | 아래 참고 — 깃허브 없이도 됩니다 |

---

## 깃허브 없이 올리는 방법 (더 빠릅니다)

일정표가 **단일 HTML 파일**이라 드래그 앤 드롭 호스팅이 그냥 됩니다.

- **Netlify Drop** — https://app.netlify.com/drop
  폴더를 브라우저 창에 끌어다 놓으면 즉시 URL이 나옵니다. 로그인 없이도 임시 배포 가능
- **Cloudflare Pages** — https://pages.cloudflare.com
  Direct Upload 방식. 무료 플랜에서 **비공개 접근 제어(Cloudflare Access)** 를 붙일 수 있어서, 진짜로 비공개를 원하면 여기가 정답입니다
- **Vercel** — https://vercel.com/new 에서도 동일

---

## 파일 구성

```
bohol-2026/
├── index.html   ← 일정표 본체 (단일 파일, 76KB)
└── README.md    ← 이 문서
```

수정하려면 `index.html`을 텍스트 에디터로 열면 됩니다. 상단 `<style>` 블록의 `:root` 변수에서 색을, 그 아래 `<table class="sched">` 에서 일정을 고칠 수 있습니다.

---

## 내용 요약

- **조석표** — 9/13~18 팡라오·시키호르 실측 예보, 세션마다 예상 조위 표기
- **일정** — 5일치 시각별 동선 (물놀이는 전부 07:00~10:30 배치)
- **연락처** — 스파·식당·오토바이 렌탈·페리 전화번호
- **BBC 앞바다** — 리프 스펙과 수영 가능 시간대
- **해변 입장법** — 리조트별 "밥먹고 들어가기" 요금 비교, 무료 진입 경로

요금·영업시간은 2024–2026년 공개 자료 기준이며, 확인되지 않은 항목은 `미확인`으로 표기해 두었습니다.
