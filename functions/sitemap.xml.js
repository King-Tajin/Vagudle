// noinspection JSUnusedGlobalSymbols,HttpUrlsUsage,JSCheckFunctionSignatures

import { getUtcDateString } from "./_shared/daily.js";
import { SITE_ORIGIN, escapeXml, parseLastUpdated } from "./_shared/seo.js";

async function fetchAsset(env, request, path) {
  let res = await env.ASSETS.fetch(new URL(path, request.url));
  if (res.status >= 300 && res.status < 400) {
    const redirectTo = res.headers.get("Location");
    if (redirectTo) {
      res = await env.ASSETS.fetch(new URL(redirectTo, request.url));
    }
  }
  return res;
}

async function readBuildDate(context) {
  try {
    const res = await fetchAsset(
      context.env,
      context.request,
      "/build-info.json"
    );
    if (!res.ok) return null;
    const { builtAt } = await res.json();
    const time = new Date(builtAt).getTime();
    if (Number.isNaN(time)) return null;
    return new Date(time).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

function readPolicyDate(source) {
  return async (context) => {
    try {
      const res = await fetchAsset(context.env, context.request, source);
      if (!res.ok) return null;
      return parseLastUpdated(await res.text());
    } catch {
      return null;
    }
  };
}

const PAGES = [
  {
    path: "/",
    changefreq: "weekly",
    priority: "1.0",
    lastmod: readBuildDate,
  },
  {
    path: "/daily",
    changefreq: "daily",
    priority: "0.9",
    lastmod: async () => getUtcDateString(),
  },
  {
    path: "/privacy",
    changefreq: "yearly",
    priority: "0.5",
    lastmod: readPolicyDate("/privacy_policy.txt"),
  },
  {
    path: "/terms",
    changefreq: "yearly",
    priority: "0.5",
    lastmod: readPolicyDate("/terms_of_service.txt"),
  },
];

function lastmodTag(lastmod) {
  return lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : "";
}

function pageEntry(page, lastmod) {
  return `  <url>
    <loc>${SITE_ORIGIN}${page.path}</loc>${lastmodTag(lastmod)}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
}

export async function onRequestGet(context) {
  const lastmods = await Promise.all(
    PAGES.map((page) => page.lastmod(context))
  );

  const entries = PAGES.map((page, i) => pageEntry(page, lastmods[i])).join(
    "\n"
  );
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
