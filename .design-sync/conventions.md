# dasanamc UI — 사용 규약

`@repo/ui` (window.RepoUi) 는 shadcn/ui 패턴을 따르는 React 컴포넌트 라이브러리.
이 시스템으로 디자인할 때:

## 라이브러리 import

```jsx
const { Button, Card, Dialog, Tabs /* … */ } = window.RepoUi;
```

전체 export 목록은 각 `<Name>.d.ts` 의 `<Name>Props` 인터페이스 + sub-component
(예: `Accordion` + `AccordionItem` + `AccordionTrigger` + `AccordionContent`) 를 참고.

## 컴포넌트 구성 패턴 (compound components)

shadcn 패턴이라 대부분의 컴포넌트는 root + 여러 sub-component 의 조합으로 사용.
필수 조립 예시:

```jsx
// Dialog
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild><Button>열기</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>제목</DialogTitle>
      <DialogDescription>설명</DialogDescription>
    </DialogHeader>
    {/* body */}
    <DialogFooter><Button>확인</Button></DialogFooter>
  </DialogContent>
</Dialog>

// Tabs
<Tabs defaultValue="a">
  <TabsList>
    <TabsTrigger value="a">A</TabsTrigger>
    <TabsTrigger value="b">B</TabsTrigger>
  </TabsList>
  <TabsContent value="a">…</TabsContent>
  <TabsContent value="b">…</TabsContent>
</Tabs>

// Card
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
    <CardDescription>설명</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
  <CardFooter>…</CardFooter>
</Card>
```

## 스타일링 — Tailwind utility + CSS 토큰

이 DS 는 **자체 stylesheet 를 ship 하지 않음**. 컴포넌트는 Tailwind utility
class 와 host 앱이 제공하는 CSS 변수를 참조. host 앱(`apps/web/app/app.css`)
이 정의하는 핵심 토큰:

| 토큰 | 용도 | 값 (다산원 브랜드) |
|---|---|---|
| `--color-ds-bg` | body 배경 | `#fbfaf7` |
| `--color-ds-dark` | hero / 다크 섹션 | `#062b28` |
| `--color-ds-dark-2` | primary 텍스트 / footer | `#0d3a35` |
| `--color-ds-dark-3` | footer 베이스 | `#04201d` |
| `--color-ds-teal` | accent primary | `#0e9d8c` |
| `--color-ds-teal-2` | 어두운 배경 위 accent | `#56c8b8` |
| `--color-ds-teal-3` | 가장 밝은 accent | `#6ed4c5` |
| `--color-ds-text` | 본문 텍스트 | `#0d3a35` |
| `--color-ds-text-sub` | 부 텍스트 | `#5c6b68` |
| `--color-ds-border` | 일반 보더 | `#e6e9e4` |

agent 가 디자인할 때 색상은 위 토큰 변수명을 사용 (`bg-[color:var(--color-ds-dark)]`
또는 `style={{ background: 'var(--color-ds-dark)' }}`).
폰트 패밀리는 `Spoqa Han Sans Neo` 가 기본 — host 의 `body` 가 이미 설정.

## 컴포넌트 props 의 권위 — `.d.ts`

각 `components/<Name>/<Name>.d.ts` 가 그 컴포넌트의 정식 props 계약. 본 sync
는 `.d.ts` 가 약화된 상태(synth-entry 모드)로 emit 됐을 수 있음 — Radix 의
forwarded ref/extends 가 단순화될 수 있으므로 실제 prop 사용 전에 React 의
standard HTML attribute (`onClick`, `disabled`, `value` 등) 도 기본적으로 받는다고
가정해도 됨.

## 안 쓰는 컴포넌트

`FullPageLoader` 는 이 sync 범위에서 제외됨. 필요하면 호스트 앱에서 직접 import.
