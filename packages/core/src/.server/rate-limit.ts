import { prisma } from "@repo/database";

/**
 * 매우 단순한 DB 기반 rate limiter. (audit C7)
 *
 * 키별 sliding window 카운트:
 * 1. 현재 시각 기준 `windowSec` 이전부터의 이벤트 count 조회
 * 2. `max` 이상이면 즉시 `Response(429)` throw (loader/action 에서 바로 응답으로 변환)
 * 3. 통과 시 이벤트 한 줄 INSERT
 *
 * 정확도보다 단순함을 우선. 매우 짧은 시간 동시 호출이 race condition 으로
 * 1~2회 추가 통과될 수 있으나, abuse 시나리오에서는 동일 키 반복 시도가
 * 누적되어 결국 차단됨. 분산락/원자적 카운터 미사용.
 *
 * @param key      식별자. 예: `login:ip:1.2.3.4`, `sms-send:phone:+8210...`
 * @param max      윈도우 내 최대 허용 횟수
 * @param windowSec 윈도우 길이(초)
 * @param message  429 응답 본문. 미지정 시 한국어 기본 메시지
 */
export async function enforceRateLimit(
  key: string,
  max: number,
  windowSec: number,
  message?: string,
): Promise<void> {
  const since = new Date(Date.now() - windowSec * 1000);

  const count = await prisma.rate_limit_events.count({
    where: { key, occurred_at: { gte: since } },
  });

  if (count >= max) {
    throw new Response(
      message ??
        `요청이 너무 많습니다. ${Math.ceil(windowSec / 60)}분 후 다시 시도해 주세요.`,
      {
        status: 429,
        headers: { "Retry-After": String(windowSec) },
      },
    );
  }

  await prisma.rate_limit_events.create({ data: { key } });
}

/**
 * 카운트만 증가시키지 않고 미리 차단 여부만 확인. action 의 검증 단계가 통과한
 * 뒤에만 실제 비용 발생 시 사용. 거의 안 쓰지만 필요할 수 있어 export.
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowSec: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const since = new Date(Date.now() - windowSec * 1000);
  const count = await prisma.rate_limit_events.count({
    where: { key, occurred_at: { gte: since } },
  });
  return { allowed: count < max, remaining: Math.max(0, max - count) };
}

/**
 * 30일 지난 이벤트 청소. 운영 환경에서 주기적으로 호출 (cron 또는 startup).
 * 한 번에 다 지우지 않고 LIMIT 으로 잘라 트랜잭션 짧게 유지.
 */
export async function purgeOldRateLimitEvents(): Promise<number> {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const result = await prisma.rate_limit_events.deleteMany({
    where: { occurred_at: { lt: cutoff } },
  });
  return result.count;
}

/**
 * Request 객체에서 IP 를 best-effort 로 추출. 신뢰할 수 있는 프록시(Vercel,
 * Cloudflare) 뒤에 있을 때 `x-forwarded-for` 의 첫 값을 사용. 그 외엔
 * `x-real-ip` 또는 빈 문자열.
 *
 * 무신뢰 환경에서는 사용자가 헤더를 위조 가능. 따라서 IP 기반 rate limit 은
 * 보조 수단이며 강력한 보호가 필요하면 인증 후 사용자 ID 키로 보완할 것.
 */
export function getRequestIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = request.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}
