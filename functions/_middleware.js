// noinspection JSUnusedGlobalSymbols
export async function onRequest(context) {
  const url = new URL(context.request.url);

  const targetDomain = "vagudle.king-tajin.dev";

  if (url.hostname.endsWith(".pages.dev")) {
    url.hostname = targetDomain;
    return Response.redirect(url.toString(), 301);
  }

  if (url.pathname === "/daily") {
    const assetUrl = new URL(context.request.url);
    assetUrl.pathname = "/";
    const assetRequest = new Request(assetUrl.toString(), context.request);
    const response = await context.env.ASSETS.fetch(assetRequest);
    return new Response(response.body, response);
  }

  return context.next();
}
