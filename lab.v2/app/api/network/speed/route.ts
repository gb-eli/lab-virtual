const MAX_BYTES = 1024 * 1024;

export async function GET(request: Request) {
  const requested = Number(new URL(request.url).searchParams.get("bytes") ?? 524288);
  const size = Math.max(65536, Math.min(MAX_BYTES, Number.isFinite(requested) ? Math.floor(requested) : 524288));
  const bytes = new Uint8Array(size);
  for (let offset = 0; offset < size; offset += 65536) {
    crypto.getRandomValues(bytes.subarray(offset, Math.min(offset + 65536, size)));
  }
  return new Response(bytes, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/octet-stream",
      "Content-Length": String(size),
    },
  });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BYTES) {
    return Response.json({ error: "Amostra acima do limite de 1 MB." }, { status: 413 });
  }
  const buffer = await request.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) {
    return Response.json({ error: "Amostra acima do limite de 1 MB." }, { status: 413 });
  }
  return Response.json({ received: buffer.byteLength }, { headers: { "Cache-Control": "no-store" } });
}
