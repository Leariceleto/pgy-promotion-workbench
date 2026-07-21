import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(projectRoot, "dist");
const sourcePath = resolve(distDir, "index.html");
const outputPath = resolve(projectRoot, "推广工作台.html");

let html = await readFile(sourcePath, "utf8");
const scriptTag = html.match(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/);
const styleTag = html.match(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"[^>]*>/);

if (!scriptTag || !styleTag) {
  throw new Error("没有在构建结果中找到 JavaScript 或 CSS 入口");
}

const assetPath = (href) => resolve(distDir, href.replace(/^\/+/, ""));
const [javascript, stylesheet] = await Promise.all([
  readFile(assetPath(scriptTag[1]), "utf8"),
  readFile(assetPath(styleTag[1]), "utf8"),
]);

const safeJavascript = javascript.replace(/<\/script/gi, "<\\/script");
html = html
  .replace(scriptTag[0], () => `<script type="module">\n${safeJavascript}\n</script>`)
  .replace(styleTag[0], () => `<style>\n${stylesheet}\n</style>`);

await writeFile(outputPath, html, "utf8");
process.stdout.write(`${outputPath}\n`);
