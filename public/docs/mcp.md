# Vagudle MCP server

Vagudle has a public [Model Context Protocol](https://modelcontextprotocol.io) server. It lets an AI assistant find valid words and create custom challenge links for you, the same links you get from the Challenge tab in Settings.

- **URL:** `https://vagudle.king-tajin.dev/mcp`
- **Transport:** Streamable HTTP, `POST` only
- **Authentication:** none

## Connect

**Claude (claude.ai, desktop and mobile)**

1. Open Settings, then Connectors.
2. Click Add custom connector.
3. Paste `https://vagudle.king-tajin.dev/mcp` and click Add.
4. In a chat, turn the connector on from the tools menu.

On Team and Enterprise plans an owner may need to add the connector for the organization first.

**Claude Code**

```
claude mcp add --transport http vagudle https://vagudle.king-tajin.dev/mcp
```

**Other clients**

Any MCP client that supports remote Streamable HTTP servers can use the URL above. To explore the tools by hand, run `npx @modelcontextprotocol/inspector`, choose Streamable HTTP and enter the URL.

## Try it

Once connected, ask something like:

- "Make me a Vagudle challenge with a 6-letter word about the ocean and send me the link."
- "Find me a hard 7-letter word that starts with str and make it a 9-guess challenge."
- "Is _crane_ a valid word, and in which dictionaries?"
- "Create a Vagudle challenge." The AI will ask how hard you want it, how long the word should be, whether you want a theme, and whether you want hints.

## Dictionaries

Challenges draw their secret word from one of three dictionaries:

| Name     | Contents                         |
| -------- | -------------------------------- |
| `normal` | Common words                     |
| `hard`   | Uncommon words                   |
| `full`   | The complete Scrabble dictionary |

The dictionaries only partly overlap. A word can be in one, two or all three, and some `normal` words are not in `full`. A challenge only works if its word is in the dictionary it was created with, which is why the lookup tools report every dictionary a word belongs to. All words are 4 to 7 letters long.

## Tools

### `create_challenge`

Creates a shareable challenge link. Whoever opens it plays Vagudle with your secret word and settings. The link hides the word and results never count toward the player's stats.

| Argument  | Type                       | Description                                      |
| --------- | -------------------------- | ------------------------------------------------ |
| `word`    | string, required           | The secret word, 4 to 7 letters                  |
| `dict`    | `normal`, `hard` or `full` | Dictionary the word must be in. Default `normal` |
| `guesses` | `9` or `11`                | Guesses the player gets. Default `11`            |

If the word isn't in the chosen dictionary, the error names the dictionaries that do contain it, or says it isn't a valid word at all.

### `check_words`

Checks whether words are valid and reports every dictionary containing each one.

| Argument | Type                       | Description                             |
| -------- | -------------------------- | --------------------------------------- |
| `words`  | array of strings, required | 1 to 25 words, up to 32 characters each |

### `search_words`

Searches one dictionary and returns matching words, each with every dictionary it belongs to.

| Argument  | Type                       | Description                                                                                                                                          |
| --------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pattern` | string                     | Whole-word pattern of up to 20 characters. `?` matches exactly one letter and `*` matches any run of letters, for example `c?a*e`, `str*` or `*ight` |
| `length`  | integer                    | Word length, 4 to 7                                                                                                                                  |
| `dict`    | `normal`, `hard` or `full` | Dictionary to search. Default `normal`                                                                                                               |
| `limit`   | integer                    | Words to return, 1 to 50. Default 10                                                                                                                 |

When more words match than `limit`, a random sample is returned along with the total number of matches.

## Prompts

### `new_challenge`

A ready-made "Create a challenge" template. In clients that list MCP prompts, picking it starts a chat where the AI asks about difficulty, word length, theme and hints, then creates the link. The exact place a client shows prompts depends on the client.

Every argument is optional. Anything you fill in is not asked again, and if you fill in all four the AI goes straight to creating the challenge.

| Argument      | Description                                            |
| ------------- | ------------------------------------------------------ |
| `difficulty`  | `Easy`, `Medium`, `Hard` or `Extreme`                  |
| `word_length` | `4`, `5`, `6`, `7` or `random`                         |
| `theme`       | A theme for the word, or `random`                      |
| `hints`       | `none`, or what you want: the theme, first letter, etc |

Difficulty maps to challenge settings like this:

| Difficulty | Dictionary | Guesses |
| ---------- | ---------- | ------- |
| Easy       | `normal`   | 11      |
| Medium     | `normal`   | 9       |
| Hard       | `hard`     | 9       |
| Extreme    | `full`     | 9       |

The game has no built-in hints, so any hints come from the AI in the chat. The server also sends these same questions as its instructions, so assistants that read server instructions ask them even if you never pick the prompt.

## Calling it directly

The server is stateless, so no handshake or session is needed:

```
curl -X POST https://vagudle.king-tajin.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_words","arguments":{"pattern":"c?a*e","length":5,"dict":"full","limit":5}}}'
```

## Protocol support

The server speaks MCP protocol versions 2026-07-28, 2025-11-25, 2025-06-18 and 2025-03-26. Clients using 2026-07-28 call `server/discover`; older clients use `initialize`. There are no sessions, and JSON-RPC batching is not supported. `GET` and `DELETE` return `405`.

Requests carrying a browser `Origin` header from another site are rejected, so browser-based clients on other origins can't connect. Server-side and desktop clients don't send one.

## Rate limit

Each IP address may send up to 60 requests per minute. Beyond that the server responds with HTTP `429` and a `Retry-After: 60` header.
