const fs = require('fs');
const code = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');
let depth = 0;
let inStr = null;
let escape = false;
let line = 1;
for (let i = 0; i < code.length; i++) {
  const ch = code[i];
  if (ch === '\n') { line++; continue; }
  if (escape) { escape = false; continue; }
  if (ch === '\\' && inStr) { escape = true; continue; }
  if ((ch === "'" || ch === '"' || ch === '`') && (!inStr || inStr === ch)) {
    inStr = inStr ? null : ch;
    continue;
  }
  if (inStr) { if (ch === '\\') escape = true; continue; }
  if (ch === '{') depth++;
  if (ch === '}') { depth--; if (depth < 0) { console.log('UNBALANCED } at char', i, 'line', line); process.exit(1); } }
}
console.log('Final depth:', depth);
