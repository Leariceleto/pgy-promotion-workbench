import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const standalonePath = resolve(projectRoot, "推广工作台.html");

test("独立工作台不依赖本地服务器或外部构建文件", async () => {
  const html = await readFile(standalonePath, "utf8");
  const scriptStart = html.indexOf('<script type="module">');
  const scriptEnd = html.indexOf("</script>", scriptStart);
  const documentShell = `${html.slice(0, scriptStart)}${html.slice(scriptEnd + 9)}`;

  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /<style>[\s\S]+<\/style>/);
  assert.match(html, /<script type="module">[\s\S]+<\/script>/);
  assert.doesNotMatch(documentShell, /<script\b[^>]*\bsrc=/);
  assert.doesNotMatch(documentShell, /<link\b[^>]*\brel="stylesheet"/);
  assert.ok(html.length > 100_000, "独立文件应包含完整的 CSS 和 JavaScript");
});
