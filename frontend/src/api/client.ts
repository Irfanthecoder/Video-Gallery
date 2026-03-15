import { API_BASE, UPLOAD_PATH_PREFIX } from "../constants";
import { buildQueryString, toUserFriendlyError } from "../utils";

function buildUrl(path: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) return path;
  return path + buildQueryString(params);
}

export async function request<T>(
  path: string,
  options?: RequestInit & { params?: Record<string, string> }
): Promise<T> {
  const { params, body, headers = {}, ...rest } = options ?? {};
  const url = API_BASE + buildUrl(path, params);
  const isForm = body instanceof FormData;
  const sendHeaders: HeadersInit = { ...(headers as Record<string, string>) };
  if (!isForm && body !== undefined) {
    (sendHeaders as Record<string, string>)["Content-Type"] = "application/json";
  }
  const res = await fetch(url, { ...rest, body, headers: sendHeaders });
  const responseBody = (await res.json().catch(() => ({}))) as
    | { messageCode?: string; message?: string; data?: T; error?: string }
    | null
    | undefined;
  const payload = responseBody ?? {};
  if (!res.ok) {
    const raw = payload.message ?? payload.error ?? res.statusText;
    throw new Error(toUserFriendlyError(raw));
  }
  return (payload.data !== undefined ? payload.data : payload) as T;
}

export function mediaUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const clean = path.replace(/\\/g, "/").replace(/^\/+/, "");
  const normalized = clean.startsWith("uploads/") ? "/" + clean : UPLOAD_PATH_PREFIX + clean;
  return API_BASE + normalized;
}
