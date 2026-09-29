export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function parseJson(request: Request) {
  return request.json().catch(() => null) as Promise<unknown>;
}