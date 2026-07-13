// @ts-nocheck
import { readdir, readFile, writeFile, stat } from "fs/promises";
import path from "path";
import { optimize } from "svgo";

const distDir = path.resolve(process.cwd(), "dist");

const svgoConfig = {
  multipass: true,
  js2svg: {
    pretty: false,
  },
  plugins: ["preset-default"],
};

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
};

const optimizeSvg = async (filePath) => {
  const before = (await stat(filePath)).size;
  const original = (await readFile(filePath)).toString();
  const result = optimize(original, { ...svgoConfig, path: filePath });
  const output = String(result.data);
  await writeFile(filePath, output);
  const after = Buffer.byteLength(output);
  return { before, after };
};

const minifyJson = async (filePath) => {
  const before = (await stat(filePath)).size;
  const original = (await readFile(filePath)).toString();
  const parsed = JSON.parse(original);
  const minified = JSON.stringify(parsed);
  await writeFile(filePath, minified);
  const after = Buffer.byteLength(minified);
  return { before, after };
};

const run = async () => {
  let files;
  try {
    files = await walk(distDir);
  } catch {
    console.warn(
      `optimize-dist: no dist/ folder found at ${distDir}, skipping.`
    );
    return;
  }

  let totalBefore = 0;
  let totalAfter = 0;
  let svgCount = 0;
  let jsonCount = 0;

  for (const filePath of files) {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === ".svg") {
      try {
        const { before, after } = await optimizeSvg(filePath);
        totalBefore += before;
        totalAfter += after;
        svgCount += 1;
      } catch (err) {
        console.warn(
          `optimize-dist: failed to optimize ${filePath}:`,
          err.message
        );
      }
      continue;
    }

    if (ext === ".json") {
      try {
        const { before, after } = await minifyJson(filePath);
        totalBefore += before;
        totalAfter += after;
        jsonCount += 1;
      } catch (err) {
        console.warn(
          `optimize-dist: failed to minify ${filePath}:`,
          err.message
        );
      }
    }
  }

  const savedKb = ((totalBefore - totalAfter) / 1024).toFixed(1);
  console.log(
    `optimize-dist: optimized ${svgCount} svg + ${jsonCount} json file(s), saved ${savedKb} KB`
  );
};

await run();
