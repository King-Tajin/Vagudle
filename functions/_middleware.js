// noinspection JSUnusedGlobalSymbols

import { applyDailySeo } from "./_shared/dailySeo.js";

export async function onRequest(context) {
  const url = new URL(context.request.url);

  const targetDomain = "vagudle.king-tajin.dev";

  if (url.hostname.endsWith(".pages.dev")) {
    url.hostname = targetDomain;
    return Response.redirect(url.toString(), 301);
  }

  if (url.pathname === "/daily" || url.pathname === "/link-discord") {
    const assetUrl = new URL(context.request.url);
    assetUrl.pathname = "/";
    const assetRequest = new Request(assetUrl.toString(), context.request);
    const response = await context.env.ASSETS.fetch(assetRequest);

    if (url.pathname === "/daily") {
      const html = await response.text();
      return new Response(applyDailySeo(html), response);
    }

    return new Response(response.body, response);
  }

  return context.next();
}
