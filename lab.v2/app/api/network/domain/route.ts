const DNS_TYPES = new Set(["A", "AAAA", "MX", "TXT", "NS", "CNAME"]);

function normalizeDomain(value: string | null) {
  const candidate = (value ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").split(/[/?#]/)[0].replace(/\.$/, "");
  if (
    !candidate ||
    candidate.length > 253 ||
    !candidate.includes(".") ||
    !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(candidate)
  ) {
    return null;
  }
  return candidate;
}

function registrationEvent(events: Array<{ eventAction?: string; eventDate?: string }> | undefined, action: string) {
  return events?.find((event) => event.eventAction === action)?.eventDate ?? null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const domain = normalizeDomain(url.searchParams.get("domain"));
  if (!domain) {
    return Response.json({ error: "Informe um domínio válido, como exemplo.com.br." }, { status: 400 });
  }

  const mode = url.searchParams.get("mode") === "rdap" ? "rdap" : "dns";
  try {
    if (mode === "rdap") {
      const response = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
        headers: { Accept: "application/rdap+json, application/json" },
      });
      if (!response.ok) {
        return Response.json({ error: `RDAP não retornou dados (${response.status}).` }, { status: response.status === 404 ? 404 : 502 });
      }
      const data = (await response.json()) as {
        ldhName?: string;
        unicodeName?: string;
        status?: string[];
        nameservers?: Array<{ ldhName?: string; unicodeName?: string }>;
        events?: Array<{ eventAction?: string; eventDate?: string }>;
        entities?: Array<{ roles?: string[]; vcardArray?: [string, Array<[string, unknown, string, unknown]>] }>;
      };
      const registrar = data.entities?.find((entity) => entity.roles?.includes("registrar"));
      const registrarName = registrar?.vcardArray?.[1]?.find((field) => field[0] === "fn")?.[3];
      return Response.json({
        mode,
        domain: data.unicodeName ?? data.ldhName ?? domain,
        registrar: typeof registrarName === "string" ? registrarName : null,
        registeredAt: registrationEvent(data.events, "registration"),
        expiresAt: registrationEvent(data.events, "expiration"),
        updatedAt: registrationEvent(data.events, "last changed"),
        status: data.status ?? [],
        nameservers: data.nameservers?.map((item) => item.unicodeName ?? item.ldhName).filter(Boolean) ?? [],
        source: "RDAP",
      });
    }

    const requestedType = (url.searchParams.get("type") ?? "A").toUpperCase();
    const type = DNS_TYPES.has(requestedType) ? requestedType : "A";
    const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}&do=1`, {
      headers: { Accept: "application/dns-json" },
    });
    if (!response.ok) {
      return Response.json({ error: `Consulta DNS indisponível (${response.status}).` }, { status: 502 });
    }
    const data = (await response.json()) as {
      Status?: number;
      AD?: boolean;
      Answer?: Array<{ name: string; type: number; TTL: number; data: string }>;
      Comment?: string;
    };
    return Response.json({
      mode,
      domain,
      type,
      status: data.Status ?? null,
      dnssecValidated: Boolean(data.AD),
      answers: (data.Answer ?? []).slice(0, 30),
      comment: data.Comment ?? null,
      source: "Google Public DNS via DoH",
    });
  } catch {
    return Response.json({ error: "Não foi possível concluir a consulta externa agora." }, { status: 502 });
  }
}
