export async function GET(request: Request) {
  const headers = request.headers;
  const ip =
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null;

  return Response.json(
    {
      ip,
      country: headers.get("cf-ipcountry"),
      note: ip ? "Endereço observado pelo servidor desta aplicação." : "IP não disponível neste ambiente.",
    },
    { headers: { "Cache-Control": "no-store, private" } },
  );
}
