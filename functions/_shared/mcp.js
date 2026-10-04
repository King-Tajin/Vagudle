import { version } from "../../package.json";
import { findMcpTool, listMcpTools } from "./mcpTools.js";

const MODERN_VERSIONS = ["2026-07-28"];
const LEGACY_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26"];
const SUPPORTED_VERSIONS = [...MODERN_VERSIONS, ...LEGACY_VERSIONS];

const VERSION_KEY = "io.modelcontextprotocol/protocolVersion";
const CAPABILITIES_KEY = "io.modelcontextprotocol/clientCapabilities";
const SERVER_INFO_KEY = "io.modelcontextprotocol/serverInfo";

const SERVER_INFO = { name: "vagudle", version };
const INSTRUCTIONS =
  "Vagudle is a word-guessing game. Use search_words and check_words to find valid words and see which dictionaries contain them, then create_challenge to make a shareable link that anyone can open and play.";
const CACHE = { ttlMs: 300000, cacheScope: "public" };

const NAME_FIELDS = {
  "tools/call": "name",
  "resources/read": "uri",
  "prompts/get": "name",
};

const CODES = {
  parse: -32700,
  invalidRequest: -32600,
  methodNotFound: -32601,
  invalidParams: -32602,
  headerMismatch: -32020,
  unsupportedVersion: -32022,
  internalError: -32603,
  rateLimited: 429,
};

const isPlainObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const respond = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

const accepted = () => new Response(null, { status: 202 });

const rpcResult = (id, result) => respond({ jsonrpc: "2.0", id, result });

const rpcError = (id, code, message, status = 200, data) =>
  respond(
    {
      jsonrpc: "2.0",
      id: id ?? null,
      error: { code, message, ...(data === undefined ? {} : { data }) },
    },
    status
  );

const headerMismatch = (id, detail) =>
  rpcError(id, CODES.headerMismatch, `Header mismatch: ${detail}`, 400);

const unsupportedVersion = (id, requested) =>
  rpcError(id, CODES.unsupportedVersion, "Unsupported protocol version", 400, {
    supported: SUPPORTED_VERSIONS,
    requested,
  });

const decodeHeaderValue = (value) => {
  const match = /^=\?base64\?(.*)\?=$/.exec(value);
  if (!match) return value;
  try {
    const bytes = Uint8Array.from(atob(match[1]), (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
};

const isRateLimited = async ({ request, env }) => {
  const limiter = env.MCP_RATE_LIMITER;
  if (!limiter) return false;

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const { success } = await limiter.limit({ key: `${ip}:mcp` });
  return !success;
};

const isOriginAllowed = (request) => {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
};

const modernResult = (result) => ({
  resultType: "complete",
  ...result,
  _meta: { ...result._meta, [SERVER_INFO_KEY]: SERVER_INFO },
});

const validateModernRequest = (request, message, params, meta) => {
  const { id, method } = message;
  const { headers } = request;
  const version = meta[VERSION_KEY];

  if (headers.get("MCP-Protocol-Version") !== version)
    return headerMismatch(
      id,
      "MCP-Protocol-Version does not match the request metadata."
    );

  if (!MODERN_VERSIONS.includes(version))
    return unsupportedVersion(id, version);

  if (!isPlainObject(meta[CAPABILITIES_KEY]))
    return rpcError(
      id,
      CODES.invalidParams,
      `Missing required _meta field: ${CAPABILITIES_KEY}`,
      400
    );

  if (headers.get("Mcp-Method") !== method)
    return headerMismatch(id, "Mcp-Method does not match the request method.");

  if (Object.hasOwn(NAME_FIELDS, method)) {
    const header = headers.get("Mcp-Name");
    if (
      header === null ||
      decodeHeaderValue(header) !== params[NAME_FIELDS[method]]
    )
      return headerMismatch(id, "Mcp-Name does not match the request body.");
  }

  return null;
};

const executeTool = async (params, context) => {
  if (typeof params.name !== "string") return { invalid: "Missing tool name." };

  const tool = findMcpTool(params.name);
  if (!tool) return { invalid: `Unknown tool: ${params.name}` };

  const args = params.arguments === undefined ? {} : params.arguments;
  if (!isPlainObject(args))
    return { invalid: "Tool arguments must be an object." };

  const { properties } = tool.inputSchema;
  const unknown = Object.keys(args).filter(
    (key) => !Object.hasOwn(properties, key)
  );
  if (unknown.length > 0)
    return {
      result: {
        content: [
          {
            type: "text",
            text: `Unknown argument: ${unknown.join(", ")}. Allowed: ${Object.keys(properties).join(", ")}.`,
          },
        ],
        isError: true,
      },
    };

  try {
    return { result: await tool.handler(args, context) };
  } catch (error) {
    console.error("MCP tool error:", error);
    return {
      result: {
        content: [{ type: "text", text: "The tool failed unexpectedly." }],
        isError: true,
      },
    };
  }
};

const dispatchTool = async (id, params, context, finalize) => {
  const outcome = await executeTool(params, context);
  if (outcome.invalid)
    return rpcError(id, CODES.invalidParams, outcome.invalid);
  return rpcResult(id, finalize(outcome.result));
};

const handleModern = async (message, params, context) => {
  const { id, method } = message;

  switch (method) {
    case "server/discover":
      return rpcResult(
        id,
        modernResult({
          supportedVersions: SUPPORTED_VERSIONS,
          capabilities: { tools: {} },
          instructions: INSTRUCTIONS,
          ...CACHE,
        })
      );
    case "tools/list":
      return rpcResult(id, modernResult({ tools: listMcpTools(), ...CACHE }));
    case "tools/call":
      return dispatchTool(id, params, context, modernResult);
    default:
      return rpcError(
        id,
        CODES.methodNotFound,
        `Method not found: ${method}`,
        404
      );
  }
};

const handleLegacy = async (message, params, context) => {
  const { id, method } = message;
  const headerVersion = context.request.headers.get("MCP-Protocol-Version");

  if (headerVersion !== null && !LEGACY_VERSIONS.includes(headerVersion))
    return unsupportedVersion(id, headerVersion);

  switch (method) {
    case "initialize": {
      if (typeof params.protocolVersion !== "string")
        return rpcError(id, CODES.invalidParams, "Missing protocolVersion.");
      const protocolVersion = LEGACY_VERSIONS.includes(params.protocolVersion)
        ? params.protocolVersion
        : LEGACY_VERSIONS[0];
      return rpcResult(id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      });
    }
    case "ping":
      return rpcResult(id, {});
    case "tools/list":
      return rpcResult(id, { tools: listMcpTools() });
    case "tools/call":
      return dispatchTool(id, params, context, (result) => result);
    default:
      return rpcError(id, CODES.methodNotFound, `Method not found: ${method}`);
  }
};

const processMcpRequest = async (context) => {
  const { request } = context;

  if (request.method !== "POST")
    return new Response(null, { status: 405, headers: { Allow: "POST" } });

  if (!isOriginAllowed(request))
    return rpcError(null, CODES.invalidRequest, "Origin not allowed.", 403);

  if (await isRateLimited(context)) {
    const limited = rpcError(
      null,
      CODES.rateLimited,
      "Too many requests. Please slow down.",
      429
    );
    limited.headers.set("Retry-After", "60");
    return limited;
  }

  let message;
  try {
    message = await request.json();
  } catch {
    return rpcError(null, CODES.parse, "Parse error.", 400);
  }

  if (Array.isArray(message))
    return rpcError(
      null,
      CODES.invalidRequest,
      "Batch requests are not supported.",
      400
    );

  if (!isPlainObject(message) || message.jsonrpc !== "2.0")
    return rpcError(null, CODES.invalidRequest, "Invalid request.", 400);

  const hasId = Object.hasOwn(message, "id");

  if (typeof message.method !== "string") {
    const isResponse =
      hasId &&
      (Object.hasOwn(message, "result") || Object.hasOwn(message, "error"));
    return isResponse
      ? accepted()
      : rpcError(null, CODES.invalidRequest, "Invalid request.", 400);
  }

  if (!hasId) return accepted();

  if (typeof message.id !== "string" && typeof message.id !== "number")
    return rpcError(null, CODES.invalidRequest, "Invalid request id.", 400);

  if (message.params !== undefined && !isPlainObject(message.params))
    return rpcError(
      message.id,
      CODES.invalidParams,
      "Params must be an object.",
      400
    );

  const params = message.params ?? {};
  const meta = isPlainObject(params._meta) ? params._meta : {};
  const headerVersion = request.headers.get("MCP-Protocol-Version");
  const isModern =
    meta[VERSION_KEY] !== undefined || MODERN_VERSIONS.includes(headerVersion);

  if (!isModern) return await handleLegacy(message, params, context);

  const invalid = validateModernRequest(request, message, params, meta);
  return invalid ?? (await handleModern(message, params, context));
};

export const handleMcpRequest = async (context) => {
  try {
    return await processMcpRequest(context);
  } catch (error) {
    console.error("MCP request error:", error);
    return rpcError(null, CODES.internalError, "Internal error.", 500);
  }
};
