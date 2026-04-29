#!/usr/bin/env node

import fs from "fs";
import path from "path";

function cleanCode(code) {
  return code
    // remove comentários de linha
    .replace(/\/\/.*$/gm, "")
    // remove comentários de bloco
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // remove linhas vazias + trim
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .join("\n");
}

function processFile(filePath) {
  const code = fs.readFileSync(filePath, "utf-8");
  const cleaned = cleanCode(code);
  return cleaned;
}

// entrada via CLI
const input = process.argv[2];

if (!input) {
  console.error("Uso: clean-code <arquivo>");
  process.exit(1);
}

const fullPath = path.resolve(process.cwd(), input);

if (!fs.existsSync(fullPath)) {
  console.error("Arquivo não encontrado:", fullPath);
  process.exit(1);
}

const result = processFile(fullPath);

// saída no stdout (importante para pipe)
console.log(result);