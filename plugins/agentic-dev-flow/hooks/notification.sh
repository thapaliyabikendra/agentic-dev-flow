#!/usr/bin/env bash
# Fires when Claude is waiting for user input (e.g. mid-pipeline confirmation).
# Shows a Windows toast notification so you can step away and be alerted.

input=$(cat)
message=$(node -e "
  try {
    const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    process.stdout.write(d.message || 'Claude needs your attention');
  } catch(e) { process.stdout.write('Claude needs your attention'); }
" <<< "$input" 2>/dev/null)

# Windows toast via PowerShell
powershell.exe -NoProfile -Command "
  Add-Type -AssemblyName System.Windows.Forms
  \$n = New-Object System.Windows.Forms.NotifyIcon
  \$n.Icon = [System.Drawing.SystemIcons]::Information
  \$n.Visible = \$true
  \$n.ShowBalloonTip(6000, 'Claude Code — QA Pipeline', '$message', [System.Windows.Forms.ToolTipIcon]::Info)
  Start-Sleep -Seconds 1
  \$n.Dispose()
" 2>/dev/null || true
