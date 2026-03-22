/**
 * build.js — index.html의 JS를 난독화해서 dist/index.html로 출력
 * 실행: node build.js
 */
const fs = require("fs");
const path = require("path");
const JavaScriptObfuscator = require("javascript-obfuscator");

const src = fs.readFileSync(
  path.join(__dirname, "src", "index.html"),
  "utf8"
);

// <script> ... </script> 블록 추출 (마지막 하나)
const scriptMatch = src.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
if (!scriptMatch) {
  console.error("❌ <script> 블록을 찾지 못했습니다.");
  process.exit(1);
}

const originalJs = scriptMatch[1];

console.log("🔒 난독화 중...");
const result = JavaScriptObfuscator.obfuscate(originalJs, {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.2,
  stringArray: true,
  stringArrayEncoding: ["base64"],
  stringArrayThreshold: 0.75,
  rotateStringArray: true,
  shuffleStringArray: true,
  splitStrings: true,
  splitStringsChunkLength: 6,
  unicodeEscapeSequence: false,
  identifierNamesGenerator: "hexadecimal",
  renameGlobals: false,
  selfDefending: true,
  disableConsoleOutput: true,
});

const obfuscatedJs = result.getObfuscatedCode();
const output = src.replace(
  /<script>([\s\S]*?)<\/script>(\s*<\/body>)/,
  `<script>${obfuscatedJs}</script>$2`
);

fs.writeFileSync(path.join(__dirname, "index.html"), output, "utf8");

console.log("✅ index.html 빌드 완료! (git push 하면 바로 배포)");
console.log(`   원본 JS: ${(originalJs.length / 1024).toFixed(1)}KB`);
console.log(`   난독화 후: ${(obfuscatedJs.length / 1024).toFixed(1)}KB`);
