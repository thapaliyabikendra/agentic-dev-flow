#!/usr/bin/env bash
# Fires after every Bash tool call.
# If the command was a Playwright test run, prints the report location.

input=$(cat)

command=$(node -e "
  try {
    const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    process.stdout.write(d.tool_input?.command || '');
  } catch(e) {}
" <<< "$input" 2>/dev/null)

if [[ "$command" == *"playwright test"* ]]; then
  echo ""
  echo "  Playwright report → npx playwright show-report"
  echo "  Results JSON      → playwright-report/results.json"
  echo ""
fi
