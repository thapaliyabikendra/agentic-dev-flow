#!/usr/bin/env bash
# Fires when Claude stops — prints TC pipeline status summary.

PLANS_DIR="plans"

if [ ! -d "$PLANS_DIR" ]; then
  exit 0
fi

pending=0; exploring=0; scripted=0; running=0; complete=0; failed=0; escalated=0

while IFS= read -r file; do
  status=$(grep -m1 '^\*\*Status:\*\*' "$file" 2>/dev/null | sed 's/\*\*Status:\*\* //' | tr -d '[:space:]')
  case "$status" in
    pending)    ((pending++))   ;;
    exploring)  ((exploring++)) ;;
    scripted)   ((scripted++))  ;;
    running)    ((running++))   ;;
    complete)   ((complete++))  ;;
    failed)     ((failed++))    ;;
    escalated)  ((escalated++)) ;;
  esac
done < <(find "$PLANS_DIR" -name "*.md" 2>/dev/null)

total=$((pending + exploring + scripted + running + complete + failed + escalated))

if [ "$total" -eq 0 ]; then
  exit 0
fi

echo ""
echo "┌─────────────────────────────────────┐"
echo "│       QA Pipeline — TC Status       │"
echo "├──────────────────────┬──────────────┤"
[ "$pending" -gt 0 ]    && printf "│  ○ pending             │  %-10s│\n" "$pending"
[ "$exploring" -gt 0 ]  && printf "│  ◎ exploring           │  %-10s│\n" "$exploring"
[ "$scripted" -gt 0 ]   && printf "│  ◉ scripted            │  %-10s│\n" "$scripted"
[ "$running" -gt 0 ]    && printf "│  ⟳ running             │  %-10s│\n" "$running"
[ "$complete" -gt 0 ]   && printf "│  ✓ complete            │  %-10s│\n" "$complete"
[ "$failed" -gt 0 ]     && printf "│  ✗ failed              │  %-10s│\n" "$failed"
[ "$escalated" -gt 0 ]  && printf "│  ⚠ escalated           │  %-10s│\n" "$escalated"
echo "├──────────────────────┼──────────────┤"
printf "│  total                 │  %-10s│\n" "$total"
echo "└──────────────────────┴──────────────┘"
echo ""
