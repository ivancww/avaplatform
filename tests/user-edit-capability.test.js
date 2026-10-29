// Tests the documented schema's used keyword subset and representative positive/negative instances.
// It does not replace validation with a full Draft 2020-12 implementation in consuming Apps.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(__dirname, '..', 'docs');
const read = name => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
const schema = read('user-edit-capability.schema.json');
function validates(s, value) {
  if (s.const !== undefined && value !== s.const) return false;
  if (s.enum && !s.enum.includes(value)) return false;
  if (s.type) {
    const actual = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
    if (!(Array.isArray(s.type) ? s.type : [s.type]).includes(actual)) return false;
  }
  if (typeof value === 'string') {
    if (s.minLength !== undefined && value.length < s.minLength) return false;
    if (s.maxLength !== undefined && value.length > s.maxLength) return false;
    if (s.pattern && !new RegExp(s.pattern).test(value)) return false;
  }
  if (Array.isArray(value)) {
    if (s.minItems !== undefined && value.length < s.minItems) return false;
    if (s.maxItems !== undefined && value.length > s.maxItems) return false;
    if (s.uniqueItems && new Set(value.map(v => JSON.stringify(v))).size !== value.length) return false;
    if (s.items && value.some(v => !validates(s.items, v))) return false;
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (s.required && s.required.some(k => !Object.hasOwn(value, k))) return false;
    if (s.additionalProperties === false && Object.keys(value).some(k => !Object.hasOwn(s.properties || {}, k))) return false;
    for (const [k, child] of Object.entries(s.properties || {})) if (Object.hasOwn(value, k) && !validates(child, value[k])) return false;
  }
  if (s.allOf && s.allOf.some(child => !validates(child, value))) return false;
  if (s.if) { const branch = validates(s.if, value) ? s.then : s.else; if (branch && !validates(branch, value)) return false; }
  return true;
}
const clone = v => JSON.parse(JSON.stringify(v));
const supported = read('user-edit-capability-supported.example.json');
const unsupported = read('user-edit-capability-unsupported.example.json');
test('documented schema examples and inconsistent declarations', () => {
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(validates(schema, supported), true);
  assert.equal(validates(schema, unsupported), true);
  const negatives = [];
  let x = clone(supported); x.userEdit.editableFields = []; negatives.push(x);
  x = clone(supported); x.entries.user = false; negatives.push(x);
  x = clone(supported); x.userEdit.userStorage = null; negatives.push(x);
  x = clone(supported); x.userEdit.editableFields.push('home.title'); negatives.push(x);
  x = clone(supported); x.userEdit.editableFields = ['Bad field']; negatives.push(x);
  x = clone(supported); x.contractVersion = '2.0'; negatives.push(x);
  x = clone(supported); x.entries.frontend = false; negatives.push(x);
  x = clone(supported); x.extra = true; negatives.push(x);
  x = clone(unsupported); x.entries.user = true; negatives.push(x);
  x = clone(unsupported); x.userEdit.editableFields = ['home.title']; negatives.push(x);
  x = clone(unsupported); x.userEdit.userStorage = 'local'; negatives.push(x);
  for (const invalid of negatives) assert.equal(validates(schema, invalid), false, JSON.stringify(invalid));
});
