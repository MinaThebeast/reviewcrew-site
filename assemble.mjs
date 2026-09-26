import { mkdirSync, readFileSync, writeFileSync } from "fs";
const n = 7;
const parts = Array.from({length: n}, (_, i) => readFileSync(`p${i}.txt`, "utf8"));
const html = Buffer.from(parts.join(""), "base64").toString("utf8");
mkdirSync("public", { recursive: true });
writeFileSync("public/index.html", html);
console.log("assembled", html.length);
