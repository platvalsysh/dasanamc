# React 가이드

React 공식 문서의 핵심 내용을 요약한 가이드입니다. 개발 시 다음 API와 컴포넌트를 적절히 활용하세요.

## 1. Components (컴포넌트)

[공식 문서 참조](https://react.dev/reference/react/components)

React에는 다음과 같은 내장 컴포넌트가 포함되어 있습니다.

- **[`<Fragment>`](https://react.dev/reference/react/Fragment) (`<>...< />`)**: DOM에 별도의 노드를 추가하지 않고 여러 자식 요소를 그룹화할 때 사용합니다.
- **[`<Profiler>`](https://react.dev/reference/react/Profiler)**: React 트리의 렌더링 성능(빈도, 소요 시간 등)을 프로그래밍 방식으로 측정합니다.
- **[`<Suspense>`](https://react.dev/reference/react/Suspense)**: 자식 컴포넌트가 로딩되는 동안 스피너 등 대체 UI(fallback)를 표시합니다.
- **[`<StrictMode>`](https://react.dev/reference/react/StrictMode)**: 개발 모드에서 잠재적인 버그(불순한 렌더링, deprecated API 사용 등)를 찾기 위해 추가 검사를 수행합니다.
- **[`<Activity>`](https://react.dev/reference/react/Activity)**: 자식 컴포넌트의 UI와 내부 상태를 메모리에 유지한 채로 숨기거나 복원할 수 있게 해줍니다. (React 19+)

## 2. Hooks (훅)

[공식 문서 참조](https://react.dev/reference/react/hooks)

### State Hooks (상태 관리)

컴포넌트가 사용자 입력 등의 정보를 "기억"하게 합니다.

- **[`useState`](https://react.dev/reference/react/useState)**: 직접 업데이트 가능한 상태 변수를 선언합니다.
- **[`useReducer`](https://react.dev/reference/react/useReducer)**: 리듀서 함수 내에 업데이트 로직을 포함시켜 상태를 관리합니다.

### Context Hooks (컨텍스트)

props를 전달하지 않고도 먼 부모 컴포넌트로부터 정보를 수신합니다.

- **[`useContext`](https://react.dev/reference/react/useContext)**: 컨텍스트를 구독하고 값을 읽습니다.

### Ref Hooks (레퍼런스)

렌더링과 무관한 정보를 보관하거나 DOM 노드에 접근할 때 사용합니다.

- **[`useRef`](https://react.dev/reference/react/useRef)**: 값을 보관하거나 DOM 요소를 참조합니다 (값 변경 시 리렌더링되지 않음).
- **[`useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle)**: 부모 컴포넌트에게 노출할 ref 핸들을 커스터마이징합니다.

### Effect Hooks (이펙트)

외부 시스템(네트워크, 브라우저 DOM 등)과 컴포넌트를 동기화합니다.

- **[`useEffect`](https://react.dev/reference/react/useEffect)**: 외부 시스템과 연결합니다.
- **[`useLayoutEffect`](https://react.dev/reference/react/useLayoutEffect)**: 브라우저가 화면을 다시 그리기 전(repaint 전)에 실행됩니다. (레이아웃 측정 용도)
- **[`useInsertionEffect`](https://react.dev/reference/react/useInsertionEffect)**: React가 DOM을 변경하기 전에 실행됩니다. (CSS-in-JS 라이브러리 용도)

### Performance Hooks (성능 최적화)

불필요한 작업이나 리렌더링을 건너뛰어 성능을 최적화합니다.

- **[`useMemo`](https://react.dev/reference/react/useMemo)**: 비용이 많이 드는 계산 결과를 캐싱합니다.
- **[`useCallback`](https://react.dev/reference/react/useCallback)**: 함수 정의를 캐싱하여 자식 컴포넌트에 전달할 때 유용합니다.
- **[`useTransition`](https://react.dev/reference/react/useTransition)**: 상태 업데이트를 비차단(non-blocking)으로 표시하여 UI 응답성을 유지합니다.
- **[`useDeferredValue`](https://react.dev/reference/react/useDeferredValue)**: UI의 중요하지 않은 부분 업데이트를 지연시킵니다.

### Other Hooks (기타)

- **[`useActionState`](https://react.dev/reference/react/useActionState)**: 폼 액션(Form Action)의 상태를 관리합니다.
- **[`useId`](https://react.dev/reference/react/useId)**: 접근성 API 등을 위한 고유 ID를 생성합니다.
- **[`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore)**: 외부 스토어(external store)를 구독합니다.
- **[`useDebugValue`](https://react.dev/reference/react/useDebugValue)**: React DevTools에 표시될 커스텀 훅의 라벨을 설정합니다.

## 3. APIs

[공식 문서 참조](https://react.dev/reference/react/apis)

### Resource APIs

- **[`use`](https://react.dev/reference/react/use)**: Promise나 Context와 같은 리소스의 값을 읽습니다. (예: `const value = use(resource)`)
