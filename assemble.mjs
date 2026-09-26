import { mkdirSync, readFileSync, writeFileSync } from "fs";
const n = 13;
const parts = Array.from({length: n}, (_, i) => readFileSync(`q${i}.txt`, "utf8").replace(/\s+/g, ""));
const html = Buffer.from(parts.join(""), "base64").toString("utf8");
mkdirSync("public", { recursive: true });
writeFileSync("public/index.html", html);
console.log("assembled", html.length);
