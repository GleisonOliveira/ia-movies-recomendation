---
name: read-clean-file
description: Read a source file in a token-efficient way by removing comments and unnecessary whitespace.
---

# read-clean-file

## Purpose

Read a source file in a token-efficient way by removing comments and unnecessary whitespace.

---

## When to Use

The agent MUST use this skill whenever it needs to read a file .ts or .tsx.

---

## Workflow
Instead of reading the file directly, run:

clean-code.js <file_path>

---

## Behavior

This command will:

* Remove all comments
* Remove empty lines
* Trim unnecessary whitespace
* Preserve code structure and logic

---

## Output

The returned code is:

* Compact
* Structurally intact
* Optimized for token usage

---

## Rules

* NEVER read raw files directly
* ALWAYS use this skill first
* ONLY request raw code if absolutely necessary

---

## Requesting More Data

If additional details are needed:

* Request specific functions or sections only

### Example:

"Provide only the implementation of function `createUser` from src/user.service.ts"

---

## Notes

* The compacted code is sufficient for most analysis tasks
* Missing comments should NOT be treated as missing logic
* Focus on structure and behavior, not formatting
