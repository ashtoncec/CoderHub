const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "script.js"), "utf8");
const page = fs.readFileSync(path.join(root, "two-integer-sum-ii.html"), "utf8");
const config = JSON.parse(page.match(/<script id="practice-config" type="application\/json">([\s\S]*?)<\/script>/)[1]);

function setup() {
  const context = vm.createContext({
    practiceConfig: config,
    baseIndent: config.baseIndent,
    indentUnit: config.indentUnit,
    practiceInput: { value: "", selectionStart: 0, selectionEnd: 0 },
    document: { querySelector: () => ({ textContent: "from typing import List\nclass Solution:\n    def twoSum(self, numbers: List[int], target: int) -> List[int]:" }) },
    savePracticeDraft() {},
    updatePracticeState() {},
    setCursorPosition(position) {
      context.practiceInput.selectionStart = position;
      context.practiceInput.selectionEnd = position;
    }
  });
  vm.runInContext(
    source.slice(source.indexOf("const PYTHON_KEYWORDS"), source.indexOf("const defaultConfig")) +
    source.slice(source.indexOf("function normalizeLine"), source.indexOf("function setFeedback")) +
    source.slice(source.indexOf("function insertAtSelection"), source.indexOf("const initialProgress")), context);
  return context;
}

function check(context, input) {
  return context.evaluateSolution(context.normalizeSolution(input), config.targetSolution, context.extractFixedIdentifiers());
}

function backspace(context, value, cursor) {
  Object.assign(context.practiceInput, { value, selectionStart: cursor, selectionEnd: cursor });
  let prevented = false;
  context.handlePracticeKeydown({ key: "Backspace", preventDefault() { prevented = true; } });
  return { prevented, value: context.practiceInput.value };
}

test("renamed variables and an unfinished if are pending, including indented blank lines", () => {
  const context = setup();
  const input = "        left, right = 0, len(numbers) - 1\n        \n        while left < right:\n            currSum = numbers[left] + numbers[right]\n            \n            if";
  assert.equal(check(context, input).state, "pending");
  assert.equal(check(context, config.targetSolution.replace(/\bl\b/g, "left").replace(/\br\b/g, "right")).state, "exact");
});

test("Backspace cannot remove the base indent before existing code", () => {
  const context = setup();
  const input = "        left, right = 0, len(numbers) - 1";
  for (let count = 0; count < 8; count++) {
    const result = backspace(context, input, 8);
    assert.equal(result.prevented, true);
    assert.equal(result.value, input);
  }
});

test("Backspace dedents a nested line but stops at the function body", () => {
  const context = setup();
  const input = "            left = 0";
  assert.equal(backspace(context, input, 12).value, "        left = 0");
  assert.equal(backspace(context, "          left = 0", 10).value, "        left = 0");
});

test("Backspace can remove a blank line without damaging adjacent code", () => {
  const context = setup();
  const first = "        left, right = 0, len(numbers) - 1";
  assert.equal(backspace(context, first + "\n        \n        while left < right:", first.length + 9).value,
    first + "\n        while left < right:");
});

test("indentation errors identify the physical line and recover after correction", () => {
  const context = setup();
  const invalid = "        left, right = 0, len(numbers) - 1\n\n    while left < right:";
  const result = check(context, invalid);
  assert.equal(result.state, "error");
  assert.equal(result.line, 3);
  assert.match(result.reason, /8 spaces.*4/);
  assert.equal(check(context, invalid.replace("    while", "        while")).state, "success");
});

test("real mistakes remain errors, and correction clears them", () => {
  const context = setup();
  const correct = "        left, right = 0, len(numbers) - 1\n        while left < right:";
  assert.equal(check(context, correct.replace("<", ">" )).state, "error");
  assert.equal(check(context, correct).state, "success");
  assert.equal(backspace(context, "        left = 0", 16).prevented, false);
});

test("Top K accepts dict as a renamed count variable, from first line to full solution", () => {
  const context = setup();
  const page = fs.readFileSync(path.join(root, "top-k-frequent-elements.html"), "utf8");
  const config = JSON.parse(page.match(/<script id="practice-config" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  const fixed = new Set(["self", "topKFrequent", "nums", "k", "List", "int"]);
  const evaluate = (input) => context.evaluateSolution(input, config.targetSolution, fixed);
  assert.equal(evaluate("        dict = {}").state, "success");
  const renamed = config.targetSolution.replace(/\bcount\b/g, "dict");
  assert.equal(evaluate(renamed).state, "exact");
  assert.equal(evaluate(renamed.replace("dict.get", "count.get")).state, "error");
  assert.equal(evaluate(renamed.replace("range(len(nums)", "range(size(nums)")).state, "error");
  assert.equal(evaluate("        for = {}").state, "error");
  assert.equal(evaluate("        nums = {}").state, "error");
});
