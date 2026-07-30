import {
  readFileSync,
  writeFileSync,
  globSync,
  mkdtempSync,
  rmSync,
} from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { createInterface } from "node:readline/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const configPath = resolve(projectRoot, "doctor.config.ts");
const cliPath = resolve(
  projectRoot,
  "node_modules",
  "react-doctor",
  "dist",
  "cli.js"
);
const DEBUG = process.argv.includes("--debug");

const originalConfig = readFileSync(configPath, "utf8");
let restored = false;

function restoreConfig() {
  if (restored) return;
  writeFileSync(configPath, originalConfig);
  restored = true;
}

process.on("exit", restoreConfig);
process.on("SIGINT", () => process.exit(1));
process.on("SIGTERM", () => process.exit(1));

function findMatchingBracket(content, openIndex) {
  const openChar = content[openIndex];
  const closeChar = openChar === "[" ? "]" : openChar === "{" ? "}" : null;
  if (!closeChar) {
    throw new Error(`Not an opening bracket at index ${openIndex}`);
  }

  let depth = 0;
  let inString = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = openIndex; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];

    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inString) {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === "/" && next === "/") {
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      continue;
    }
    if (ch === openChar) {
      depth++;
    } else if (ch === closeChar) {
      depth--;
      if (depth === 0) return i;
    }
  }

  throw new Error(`No matching bracket found for index ${openIndex}`);
}

function extractQuotedStrings(text) {
  return [...text.matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
}

function parseOverrideEntries(content) {
  const overridesKeyMatch = content.match(/overrides\s*:\s*\[/);
  if (!overridesKeyMatch) {
    throw new Error("Could not find `ignore.overrides` in doctor.config.ts");
  }

  const arrayOpenIndex =
    overridesKeyMatch.index + overridesKeyMatch[0].length - 1;
  const arrayCloseIndex = findMatchingBracket(content, arrayOpenIndex);

  const entries = [];
  let i = arrayOpenIndex + 1;
  while (i < arrayCloseIndex) {
    const ch = content[i];
    if (ch === "{") {
      const entryClose = findMatchingBracket(content, i);
      let end = entryClose + 1;
      if (content[end] === ",") end++;

      const rawText = content.slice(i, entryClose + 1);
      const filesKeyMatch = rawText.match(/files\s*:\s*\[/);
      const rulesMatch = rawText.match(/rules\s*:\s*\[([\s\S]*?)]/);
      if (!filesKeyMatch) {
        throw new Error(`Override entry missing "files" array:\n${rawText}`);
      }

      const filesArrayStart =
        i + filesKeyMatch.index + filesKeyMatch[0].length - 1;
      const filesArrayEnd = findMatchingBracket(content, filesArrayStart);
      const filesArrayInner = content.slice(filesArrayStart + 1, filesArrayEnd);
      const filesIndentMatch = rawText.match(/\n([ \t]*)files\s*:/);
      const filesIndent = filesIndentMatch ? filesIndentMatch[1] : "        ";

      entries.push({
        start: i,
        end,
        files: extractQuotedStrings(filesArrayInner),
        rules: rulesMatch ? extractQuotedStrings(rulesMatch[1]) : undefined,
        filesArrayStart,
        filesArrayEnd,
        filesIndent,
      });
      i = end;
    } else {
      i++;
    }
  }

  return entries;
}

function normalizeFilePath(filePath) {
  if (filePath.startsWith("file:")) {
    return fileURLToPath(filePath);
  }
  return resolve(projectRoot, filePath);
}

function resolveFilesPerGlob(globs) {
  return globs.map((pattern) => ({
    pattern,
    files: [...new Set(globSync(pattern, { cwd: projectRoot }))],
  }));
}

function formatFilesArray(globs, indent) {
  if (globs.length === 0) return "[]";
  if (globs.length === 1) return `["${globs[0]}"]`;
  const itemIndent = `${indent}  `;
  const items = globs.map((g) => `${itemIndent}"${g}",`).join("\n");
  return `[\n${items}\n${indent}]`;
}

function runCli(tempDir) {
  const jsonOutPath = join(tempDir, "report.json");
  const args = [
    cliPath,
    projectRoot,
    "--json",
    "--json-out",
    jsonOutPath,
    "--no-score",
    "--yes",
    "--scope",
    "full",
  ];

  try {
    execFileSync(process.execPath, args, {
      cwd: projectRoot,
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 1024 * 1024 * 64,
    });
  } catch {
    // Non-zero exit is expected when blocking diagnostics are found;
    // the JSON report is still written. Real crashes surface below
    // when the report file can't be read/parsed.
  }

  const raw = readFileSync(jsonOutPath, "utf8");
  return JSON.parse(raw);
}

function removeEntry(content, entry) {
  return content.slice(0, entry.start) + content.slice(entry.end);
}

async function checkEntry(entry) {
  const globMatches = resolveFilesPerGlob(entry.files);
  const matchedFiles = [...new Set(globMatches.flatMap((g) => g.files))];
  if (DEBUG)
    console.log(`\n  [debug] matchedFiles=${JSON.stringify(matchedFiles)}`);

  if (matchedFiles.length === 0) {
    return {
      entry,
      status: "UNUSED",
      reason: "glob pattern(s) match no files",
      firingFiles: [],
      staleFiles: [],
      staleGlobs: entry.files,
      keepGlobs: [],
    };
  }

  writeFileSync(configPath, removeEntry(originalConfig, entry));
  restored = false;

  const tempDir = mkdtempSync(join(tmpdir(), "check-unused-overrides-"));
  let report;
  try {
    report = runCli(tempDir);
  } finally {
    restoreConfig();
    rmSync(tempDir, { recursive: true, force: true });
  }

  const projectEntry = report.projects?.[0];
  if (DEBUG) {
    console.log(
      `\n  [debug] reactDetected=${report.reactDetected} scannedFileCount=${projectEntry?.scannedFileCount} totalDiagnostics=${report.diagnostics?.length} skippedChecks=${JSON.stringify(projectEntry?.skippedChecks)} skippedCheckReasons=${JSON.stringify(projectEntry?.skippedCheckReasons)}`
    );
  }

  const matchedFileSet = new Set(
    matchedFiles.map((f) => resolve(projectRoot, f))
  );
  const relevantDiagnostics = (report.diagnostics ?? []).filter((d) => {
    const rawPath = d.normalizedFilePath ?? d.filePath;
    const filePathAbs = normalizeFilePath(rawPath);
    if (!matchedFileSet.has(filePathAbs)) return false;
    if (!entry.rules) return true;
    return entry.rules.includes(`${d.plugin}/${d.rule}`);
  });

  const firingFileSet = new Set(
    relevantDiagnostics.map((d) =>
      normalizeFilePath(d.normalizedFilePath ?? d.filePath)
    )
  );
  const firingFiles = matchedFiles.filter((f) =>
    firingFileSet.has(resolve(projectRoot, f))
  );
  const staleFiles = matchedFiles.filter(
    (f) => !firingFileSet.has(resolve(projectRoot, f))
  );

  const staleGlobs = globMatches
    .filter(
      (g) =>
        g.files.length === 0 ||
        g.files.every((f) => !firingFileSet.has(resolve(projectRoot, f)))
    )
    .map((g) => g.pattern);
  const keepGlobs = entry.files.filter((p) => !staleGlobs.includes(p));

  if (firingFiles.length === 0) {
    return {
      entry,
      status: "UNUSED",
      reason: "rule no longer fires on any of these files",
      firingFiles,
      staleFiles,
      staleGlobs,
      keepGlobs,
    };
  }

  if (staleFiles.length === 0) {
    const count = relevantDiagnostics.length;
    return {
      entry,
      status: "NEEDED",
      reason: `still fires (${count} finding${count === 1 ? "" : "s"}) on all ${matchedFiles.length} file(s)`,
      firingFiles,
      staleFiles,
      staleGlobs,
      keepGlobs,
    };
  }

  return {
    entry,
    status: "PARTIAL",
    reason: `still fires on ${firingFiles.length}/${matchedFiles.length} file(s); stale on ${staleFiles.length}`,
    firingFiles,
    staleFiles,
    staleGlobs,
    keepGlobs,
  };
}

async function promptYesNo(rl, question) {
  const answer = (await rl.question(`${question} (Y/n) `)).trim().toLowerCase();
  return answer === "" || answer === "y" || answer === "yes";
}

async function maybeApplyFixes(unused, partial) {
  const trimmable = partial.filter((r) => r.staleGlobs.length > 0);
  const untrimmable = partial.filter((r) => r.staleGlobs.length === 0);
  const label = (r) =>
    r.entry.rules ? r.entry.rules.join(", ") : "(all rules)";

  if (untrimmable.length > 0) {
    console.log(
      `\n${untrimmable.length} can't be auto-trimmed (wildcard glob mixes needed and stale files):`
    );
    for (const r of untrimmable) {
      console.log(`  - ${label(r)}`);
      if (DEBUG) {
        console.log(`      still needed: ${r.firingFiles.join(", ")}`);
        console.log(`      stale: ${r.staleFiles.join(", ")}`);
      }
    }
  }

  if (unused.length === 0 && trimmable.length === 0) return;

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const edits = [];

  try {
    if (unused.length > 0) {
      console.log(`\n${unused.length} fully unused:`);
      for (const r of unused) console.log(`  - ${label(r)}`);
      const doRemove = await promptYesNo(rl, "Remove these?");
      if (doRemove) {
        for (const r of unused) {
          edits.push({ start: r.entry.start, end: r.entry.end, text: "" });
        }
        console.log(`  Removed ${unused.length}.`);
      } else {
        console.log("  Skipped.");
      }
    }

    if (trimmable.length > 0) {
      console.log(`\n${trimmable.length} partially unused:`);
      for (const r of trimmable) {
        console.log(
          `  - ${label(r)} (${r.staleFiles.length}/${r.firingFiles.length + r.staleFiles.length} files stale)`
        );
      }
      const doTrim = await promptYesNo(rl, "Trim stale files from these?");
      if (doTrim) {
        for (const r of trimmable) {
          edits.push({
            start: r.entry.filesArrayStart,
            end: r.entry.filesArrayEnd + 1,
            text: formatFilesArray(r.keepGlobs, r.entry.filesIndent),
          });
        }
        console.log(`  Trimmed ${trimmable.length}.`);
      } else {
        console.log("  Skipped.");
      }
    }
  } finally {
    rl.close();
  }

  if (edits.length === 0) return;

  edits.sort((a, b) => b.start - a.start);
  let finalContent = originalConfig;
  for (const edit of edits) {
    finalContent =
      finalContent.slice(0, edit.start) +
      edit.text +
      finalContent.slice(edit.end);
  }
  writeFileSync(configPath, finalContent);
  restored = true;
  console.log("\ndoctor.config.ts updated. Review the diff before committing.");
}

async function main() {
  const entries = parseOverrideEntries(originalConfig);
  console.log(`Found ${entries.length} override(s) in doctor.config.ts\n`);

  const results = [];
  for (const entry of entries) {
    const label = entry.rules ? entry.rules.join(", ") : "(all rules)";
    process.stdout.write(`Checking ${label} ... `);
    const result = await checkEntry(entry);
    console.log(result.status);
    results.push(result);
  }

  const unused = results.filter((r) => r.status === "UNUSED");
  const partial = results.filter((r) => r.status === "PARTIAL");

  console.log("\n=== Summary ===");
  console.table(
    results.map((r) => {
      const fileCount = r.firingFiles.length + r.staleFiles.length;
      return {
        Rule: r.entry.rules ? r.entry.rules.join(", ") : "(all rules)",
        Files:
          fileCount > 0
            ? `${fileCount} file${fileCount === 1 ? "" : "s"}`
            : "no match",
        Status: r.status,
      };
    })
  );

  if (unused.length === 0 && partial.length === 0) {
    console.log(
      "\nAll overrides still suppress something on every listed file. Nothing to clean up."
    );
    return;
  }

  await maybeApplyFixes(unused, partial);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
