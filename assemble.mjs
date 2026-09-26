import { mkdirSync, readFileSync, writeFileSync } from "fs";
const parts = ["c0.txt", "c1.txt", "c2.txt", "c3.txt"].map((f) => readFileSync(f, "utf8"));
const html = Buffer.from(parts.join(""), "base64").toString("utf8");
mkdirSync("public", { recursive: true });
writeFileSync("public/index.html", html);
console.log("assembled", html.length, "bytes -> public/index.html");
