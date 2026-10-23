import { useEffect, useRef, useState } from "react";

/**
 * 네이버 지도 (Maps JS API v3) — 병원 위치 1곳을 마커로 표시.
 *
 * - 키는 `VITE_NAVER_MAP_CLIENT_ID` (NCP Maps > Application 의 "Client ID" / ncpKeyId).
 *   브라우저에 노출되는 공개 키이며, NCP 콘솔의 Web 서비스 URL 에 등록된 도메인에서만 동작.
 * - 스크립트는 최초 1회만 삽입하고, 이후 인스턴스는 같은 전역(`window.naver`)을 재사용.
 * - 키가 없거나 로드에 실패하면 `fallback` (기본: 네이버 지도 링크 카드) 을 보여준다.
 */

const CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID as string | undefined;
const SCRIPT_ID = "naver-maps-sdk";

type NaverMaps = {
  maps: {
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => NaverMapInstance;
    LatLng: new (lat: number, lng: number) => unknown;
    Marker: new (opts: Record<string, unknown>) => unknown;
    InfoWindow: new (opts: Record<string, unknown>) => NaverInfoWindow;
    Point: new (x: number, y: number) => unknown;
    Event: { addListener: (target: unknown, name: string, fn: () => void) => void };
    MapTypeControlStyle: Record<string, unknown>;
    Position: Record<string, unknown>;
    Service?: {
      Status: { OK: unknown };
      geocode: (
        opts: { query: string },
        cb: (status: unknown, res: { v2?: { addresses?: { x: string; y: string }[] } }) => void,
      ) => void;
    };
  };
};
type NaverMapInstance = { destroy?: () => void; setCenter: (latlng: unknown) => void };
type NaverInfoWindow = { open: (map: NaverMapInstance, anchor: unknown) => void };
type NaverMarker = { setPosition: (latlng: unknown) => void };

/** 주소 → 좌표 (geocoder 서브모듈이 있고 Geocoding 이 켜진 키일 때만 성공, 아니면 null) */
function geocode(naver: NaverMaps, address: string): Promise<{ lat: number; lng: number } | null> {
  const svc = naver.maps.Service;
  if (!svc) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      svc.geocode({ query: address }, (status, res) => {
        const hit = res?.v2?.addresses?.[0];
        if (status === svc.Status.OK && hit) resolve({ lat: Number(hit.y), lng: Number(hit.x) });
        else resolve(null);
      });
    } catch {
      resolve(null);
    }
  });
}

declare global {
  interface Window {
    naver?: NaverMaps;
    navermap_authFailure?: () => void;
  }
}

let sdkPromise: Promise<NaverMaps> | null = null;
/**
 * 인증 실패는 SDK 스크립트 load 이후(JSONP 인증 응답 시점)에 통보되므로, 이미 resolve 된
 * 뒤에도 각 인스턴스가 알 수 있게 전역 플래그 + 리스너로 전파한다.
 */
let authFailed = false;
const authListeners = new Set<() => void>();

function onAuthFailure(listener: () => void) {
  if (authFailed) listener();
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

function loadSdk(clientId: string): Promise<NaverMaps> {
  if (authFailed) return Promise.reject(new Error("naver maps auth failure"));
  if (window.naver?.maps) return Promise.resolve(window.naver);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    // 인증 실패(미등록 도메인, 잘못된 키) 시 SDK 가 호출하는 전역 콜백
    window.navermap_authFailure = () => {
      authFailed = true;
      authListeners.forEach((fn) => fn());
      reject(new Error("naver maps auth failure"));
    };
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.id = SCRIPT_ID;
      script.async = true;
      // geocoder 서브모듈: NCP 앱에 Geocoding 이 켜져 있으면 주소 → 좌표 보정에 사용 (없어도 지도는 동작)
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}&submodules=geocoder`;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => {
      if (window.naver?.maps) resolve(window.naver);
      else reject(new Error("naver maps sdk missing after load"));
    });
    script.addEventListener("error", () => reject(new Error("naver maps sdk load error")));
  });
  sdkPromise.catch(() => {
    sdkPromise = null; // 재시도 가능하게
  });
  return sdkPromise;
}

export interface NaverMapProps {
  lat: number;
  lng: number;
  /** 마커 위 말풍선 제목 */
  title: string;
  /** 말풍선 부제 (주소 등) */
  subtitle?: string;
  /**
   * 지오코딩할 주소. 지정하면 lat/lng 를 초기값으로 쓰되, 네이버 지오코더가
   * 응답하면 그 좌표로 지도 중심·마커를 보정한다.
   */
  geocodeAddress?: string;
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  /** 키 없음·로드 실패 시 대체 UI */
  fallback?: React.ReactNode;
}

export function NaverMap({
  lat,
  lng,
  title,
  subtitle,
  geocodeAddress,
  zoom = 16,
  className,
  style,
  fallback,
}: NaverMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "ready" | "error">(CLIENT_ID ? "idle" : "error");

  useEffect(() => {
    if (!CLIENT_ID || !ref.current) return;
    let cancelled = false;
    let map: NaverMapInstance | null = null;

    // 지도 생성 이후에 인증 실패가 통보되면 빈 지도를 치우고 fallback 으로
    const offAuth = onAuthFailure(() => {
      if (cancelled) return;
      console.error("[NaverMap] 인증 실패 — NCP 콘솔의 Web 서비스 URL 에 현재 도메인이 등록되어 있는지 확인");
      setStatus("error"); // fallback 먼저 — 아래 destroy 는 SDK 가 이미 내부를 비운 뒤라 예외를 던질 수 있음
      safeDestroy(map);
      map = null;
    });

    loadSdk(CLIENT_ID)
      .then((naver) => {
        if (cancelled || !ref.current) return;
        const center = new naver.maps.LatLng(lat, lng);
        map = new naver.maps.Map(ref.current, {
          center,
          zoom,
          minZoom: 10,
          scaleControl: false,
          logoControlOptions: { position: naver.maps.Position.BOTTOM_LEFT },
          mapDataControl: false,
          zoomControl: true,
          zoomControlOptions: { position: naver.maps.Position.RIGHT_BOTTOM },
        });
        const marker = new naver.maps.Marker({ position: center, map, title }) as NaverMarker;

        // 주소 기반 보정 — 하드코딩 좌표가 대략값일 때 정확한 번지 위치로 이동
        if (geocodeAddress) {
          geocode(naver, geocodeAddress).then((pos) => {
            if (cancelled || !pos || !map) return;
            const exact = new naver.maps.LatLng(pos.lat, pos.lng);
            map.setCenter(exact);
            marker.setPosition(exact);
          });
        }
        const info = new naver.maps.InfoWindow({
          content: `<div style="padding:12px 16px;font:700 14px/1.4 'Apple SD Gothic Neo','Pretendard',sans-serif;color:#0d221e;white-space:nowrap">${escapeHtml(title)}${
            subtitle ? `<div style="margin-top:4px;font-weight:500;font-size:12.5px;color:#51635f">${escapeHtml(subtitle)}</div>` : ""
          }</div>`,
          borderWidth: 0,
          backgroundColor: "#fff",
          disableAnchor: false,
          anchorSize: new naver.maps.Point(12, 10),
          pixelOffset: new naver.maps.Point(0, -6),
        });
        info.open(map, marker);
        naver.maps.Event.addListener(marker, "click", () => info.open(map!, marker));
        setStatus("ready");
      })
      .catch((e) => {
        console.error("[NaverMap]", e);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      offAuth();
      safeDestroy(map);
    };
  }, [lat, lng, zoom, title, subtitle, geocodeAddress]);

  if (status === "error") {
    return <>{fallback ?? null}</>;
  }

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      role="region"
      aria-label={`${title} 위치 지도`}
    />
  );
}

/** 인증 실패 후 SDK 내부가 null 인 상태에서 destroy 가 예외를 던지는 경우가 있어 감싼다 */
function safeDestroy(map: NaverMapInstance | null) {
  try {
    map?.destroy?.();
  } catch {
    /* SDK 내부 정리 실패는 무시 */
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}
