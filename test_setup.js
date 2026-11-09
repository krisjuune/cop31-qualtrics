// =====================================================================
// Test for choice_experiment_setup.js (run outside Qualtrics with Node)
// Usage: node test_setup.js choice_experiment_setup.js embedded_data_fields.txt
//
// Simulates N respondents and checks that:
//   - no task shows two identical packages,
//   - every field the script sets is declared, and every declared field is set,
//   - the text shown in each table cell matches the level coded for that
//     attribute (each code always maps to one and the same text),
//   - row orders and attribute levels are balanced.
// =====================================================================
const fs = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8');
const declared = new Set(fs.readFileSync(process.argv[3], 'utf8').trim().split('\n'));

let ed, onload;
global.Qualtrics = { SurveyEngine: {
  addOnload: f => { onload = f; },
  setJSEmbeddedData: (k, v) => { ed['__js_' + k] = String(v); } } };
new Function(src)();

const ATTRS = ['finance', 'priority', 'size'];
const PKGS = ['a', 'b'];
const N = 10000;
const counts = {}, orders = {}, codeToText = {};
let identical = 0, textMismatch = 0;
const undeclared = new Set(), unset = new Set();

for (let n = 0; n < N; n++) {
  ed = {};
  onload.call({ hidePreviousButton() {} });

  Object.keys(ed).forEach(k => { if (!declared.has(k)) undeclared.add(k); });
  declared.forEach(k => { if (!(k in ed) || ed[k] === 'undefined' || ed[k] === '') unset.add(k); });

  orders[ed.__js_attr_order] = (orders[ed.__js_attr_order] || 0) + 1;
  const order = ed.__js_attr_order.split('|');

  for (let i = 1; i <= 6; i++) {
    const pa = ATTRS.map(a => ed[`__js_task${i}_${a}_a_code`]).join();
    const pb = ATTRS.map(a => ed[`__js_task${i}_${a}_b_code`]).join();
    if (pa === pb) identical++;

    for (const a of ATTRS) for (const p of PKGS) {
      const c = a + ':' + ed[`__js_task${i}_${a}_${p}_code`];
      counts[c] = (counts[c] || 0) + 1;
    }

    // Each row shows one attribute (by the respondent's order); its text must
    // always be the same for the same coded level.
    order.forEach((a, r) => {
      for (const p of PKGS) {
        const code = a + ':' + ed[`__js_task${i}_${a}_${p}_code`];
        const text = ed[`__js_task${i}_row${r + 1}_${p}`];
        if (!(code in codeToText)) codeToText[code] = text;
        else if (codeToText[code] !== text) textMismatch++;
      }
    });
  }
}

console.log('respondents:', N);
console.log('identical pairs shown:', identical);
console.log('cells where text does not match the coded level:', textMismatch);
console.log('fields set but not declared:', [...undeclared]);
console.log('fields declared but not set:', [...unset]);
console.log('attribute (row) orders:', orders);
console.log('\nshare of packages per level (should be about 1/3 or 1/5):');
const tot = N * 12;
Object.keys(counts).sort().forEach(k => console.log('  ' + k.padEnd(22), (100 * counts[k] / tot).toFixed(1) + '%'));
console.log('\ncode -> text shown:');
Object.keys(codeToText).sort().forEach(k => console.log('  ' + k.padEnd(22), codeToText[k]));
