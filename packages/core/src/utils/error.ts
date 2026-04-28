/**
 * `catch (e: unknown)` 블록에서 사용자 노출용 메시지 추출.
 * `Error` 인스턴스면 `message`, 아니면 `String(e)`.
 *
 * @example
 * try { ... } catch (e) {
 *   return { error: getErrorMessage(e) };
 * }
 */
export function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return String(e);
}
