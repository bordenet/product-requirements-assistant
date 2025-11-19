# Compact Output Module for PowerShell
# Vertical real estate optimized with running timer

# ANSI escape sequences
$script:ANSI_CLEAR_LINE = "`e[2K"
$script:ANSI_CURSOR_SAVE = "`e[s"
$script:ANSI_CURSOR_RESTORE = "`e[u"
$script:ANSI_HIDE_CURSOR = "`e[?25l"
$script:ANSI_SHOW_CURSOR = "`e[?25h"

# Colors
$script:C_RED = "`e[0;31m"
$script:C_GREEN = "`e[0;32m"
$script:C_YELLOW = "`e[1;33m"
$script:C_BLUE = "`e[0;34m"
$script:C_CYAN = "`e[0;36m"
$script:C_GRAY = "`e[0;90m"
$script:C_BOLD = "`e[1m"
$script:C_RESET = "`e[0m"

# Symbols
$script:SYM_OK = "${C_GREEN}✓${C_RESET}"
$script:SYM_FAIL = "${C_RED}✗${C_RESET}"
$script:SYM_WARN = "${C_YELLOW}⚠${C_RESET}"
$script:SYM_RUN = "${C_BLUE}▸${C_RESET}"
$script:SYM_SKIP = "${C_GRAY}○${C_RESET}"

# Global state
$script:ScriptStartTime = Get-Date
$script:CurrentTask = ""
$script:Verbose = $false

# Get elapsed time in HH:MM:SS format
function Get-ElapsedTime {
    $elapsed = (Get-Date) - $script:ScriptStartTime
    return "{0:D2}:{1:D2}:{2:D2}" -f $elapsed.Hours, $elapsed.Minutes, $elapsed.Seconds
}

# Print timer in top-right corner
function Write-Timer {
    $cols = $Host.UI.RawUI.WindowSize.Width
    if ($cols -eq 0) { $cols = 80 }
    
    $timer = Get-ElapsedTime
    $timerText = "${C_GRAY}[$timer]${C_RESET}"
    $timerLen = 11  # Length of [HH:MM:SS]
    $pos = $cols - $timerLen
    
    # Save cursor, move to position, print timer, restore cursor
    Write-Host -NoNewline "${ANSI_CURSOR_SAVE}"
    Write-Host -NoNewline ("`e[${pos}G")
    Write-Host -NoNewline $timerText
    Write-Host -NoNewline "${ANSI_CURSOR_RESTORE}"
}

# Update status line in place
function Update-Status {
    param(
        [string]$Symbol,
        [string]$Message
    )
    
    # Clear line and print status with timer
    Write-Host -NoNewline "`r${ANSI_CLEAR_LINE}"
    Write-Host -NoNewline "$Symbol $Message"
    Write-Timer
}

# Finalize status line (move to next line)
function Complete-Status {
    Write-Host ""
}

# Start a task
function Start-Task {
    param([string]$Message)
    
    $script:CurrentTask = $Message
    Update-Status $script:SYM_RUN "${Message}..."
    
    if ($script:Verbose) {
        Complete-Status
    }
}

# Complete task successfully
function Complete-Task {
    param([string]$Message = $script:CurrentTask)
    
    Update-Status $script:SYM_OK $Message
    Complete-Status
}

# Task failed
function Fail-Task {
    param([string]$Message = $script:CurrentTask)
    
    Update-Status $script:SYM_FAIL $Message
    Complete-Status
}

# Task warning
function Warn-Task {
    param([string]$Message = $script:CurrentTask)
    
    Update-Status $script:SYM_WARN $Message
    Complete-Status
}

# Skip task (already done)
function Skip-Task {
    param([string]$Message = $script:CurrentTask)
    
    Update-Status "${script:SYM_SKIP}" "$Message ${C_GRAY}(cached)${C_RESET}"
    Complete-Status
}

# Verbose-only output
function Write-Verbose-Line {
    param([string]$Message)
    
    if ($script:Verbose) {
        Write-Host "  ${C_GRAY}$Message${C_RESET}"
    }
}

# Print compact header
function Write-CompactHeader {
    param([string]$Message)
    
    Write-Host "${C_CYAN}${C_BOLD}$Message${C_RESET}"
}

# Print section
function Write-CompactSection {
    param([string]$Message)
    
    Write-Host "${C_BLUE}▸${C_RESET} ${C_BOLD}$Message${C_RESET}"
}

# Enable verbose mode
function Enable-VerboseMode {
    $script:Verbose = $true
}

# Show cursor on exit
function Show-Cursor {
    Write-Host -NoNewline "${ANSI_SHOW_CURSOR}"
}

# Hide cursor for cleaner updates
Write-Host -NoNewline "${ANSI_HIDE_CURSOR}"

# Register cleanup
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Show-Cursor } | Out-Null

# Export functions
Export-ModuleMember -Function @(
    'Get-ElapsedTime',
    'Start-Task',
    'Complete-Task',
    'Fail-Task',
    'Warn-Task',
    'Skip-Task',
    'Write-Verbose-Line',
    'Write-CompactHeader',
    'Write-CompactSection',
    'Enable-VerboseMode',
    'Show-Cursor'
)

