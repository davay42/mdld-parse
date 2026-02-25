**Excellent question! Here are several enforcement strategies:**

## 1. Shell Wrapper Enforcement

**Create mandatory wrapper script**:
```bash
# ~/.bashrc or ~/.zshrc
# Override ig-cli and node commands
ig-cli() {
    # Log command before execution
    echo "$(date -Iseconds)|ig-cli|$*" >> ~/.vortex_logs/commands.jsonl
    
    # Execute with forced file output
    command ig-cli "$@" > ~/.vortex_outputs/last_output.txt 2>&1
    
    # Log results
    echo "$(date -Iseconds)|result|$?|$(wc -c < ~/.vortex_outputs/last_output.txt)" >> ~/.vortex_logs/commands.jsonl
}

node() {
    echo "$(date -Iseconds)|node|$*" >> ~/.vortex_logs/commands.jsonl
    command node "$@" > ~/.vortex_outputs/last_node_output.txt 2>&1
    echo "$(date -Iseconds)|node_result|$?" >> ~/.vortex_logs/commands.jsonl
}
```

## 2. Directory-Level Enforcement

**Create .vortex enforcement directory**:
```bash
# .vortex/enforce.sh
#!/bin/bash
# Enforce logging in this directory tree

VORTEX_LOG="$(pwd)/.vortex/commands.jsonl"
VORTEX_OUTPUTS="$(pwd)/.vortex/outputs/"

# Ensure directories exist
mkdir -p "$(dirname "$VORTEX_LOG")" "$VORTEX_OUTPUTS"

# Override commands for this session
ig-cli() {
    echo "$(date -Iseconds)|$(pwd)|ig-cli|$*" >> "$VORTEX_LOG"
    command ig-cli "$@" > "$VORTEX_OUTPUTS/ig_cli_$(date +%s).txt" 2>&1
    echo "$(date -Iseconds)|result|$?" >> "$VORTEX_LOG"
}

# Auto-source when entering directory
echo 'source .vortex/enforce.sh' > .env
```

## 3. Node.js Process Manager

**Create vortex-aware node runner**:
```javascript
// vortex-runner.js
const fs = require('fs');
const { spawn } = require('child_process');

function vortexCommand(command, args, cwd) {
    const logFile = `${cwd}/.vortex/commands.jsonl`;
    const timestamp = new Date().toISOString();
    
    // Log command start
    fs.appendFileSync(logFile, `${timestamp}|start|${command}|${args.join(' ')}\n`);
    
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { 
            cwd, 
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env, VORTEX_ENFORCED: '1' }
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', data => stdout += data);
        child.stderr.on('data', data => stderr += data);
        
        child.on('close', (code) => {
            const outputFile = `${cwd}/.vortex/outputs/${command}_${Date.now()}.txt`;
            fs.writeFileSync(outputFile, stdout + stderr);
            
            // Log completion
            fs.appendFileSync(logFile, `${timestamp}|end|${command}|${code}|${outputFile}\n`);
            resolve({ code, outputFile });
        });
    });
}

// Usage: vortexCommand('ig-cli', ['stats', './docs/'], process.cwd())
```

## 4. Git Hook Enforcement

**Pre-commit hook**:
```bash
# .git/hooks/pre-commit
#!/bin/bash

# Ensure vortex log exists and is up to date
if [ ! -f ".vortex/commands.jsonl" ]; then
    echo "❌ Missing .vortex/commands.jsonl - required for vortex operations"
    exit 1
fi

# Validate log format
if ! jq -e . .vortex/commands.jsonl >/dev/null 2>&1; then
    echo "❌ Invalid JSONL format in commands.jsonl"
    exit 1
fi

# Check all outputs exist
while IFS='|' read -r timestamp action command args; do
    if [ "$action" = "end" ]; then
        outputFile=$(echo "$args" | cut -d'|' -f3)
        if [ ! -f "$outputFile" ]; then
            echo "❌ Missing output file: $outputFile"
            exit 1
        fi
    fi
done < .vortex/commands.jsonl

echo "✅ Vortex log validation passed"
```

## 5. Environment Variable Enforcement

**Create vortex environment**:
```bash
# .vortex/env.sh
export VORTEX_ENFORCED=1
export VORTEX_LOG_DIR="$PWD/.vortex"
export VORTEX_OUTPUT_DIR="$PWD/.vortex/outputs"

# Force all commands through vortex wrapper
ig-cli() {
    if [ "$VORTEX_ENFORCED" != "1" ]; then
        echo "❌ Commands must be run within vortex environment"
        echo "Run: source .vortex/env.sh"
        return 1
    fi
    
    # Enforced logging and output
    echo "$(date -Iseconds)|ig-cli|$*" >> "$VORTEX_LOG_DIR/commands.jsonl"
    command ig-cli "$@" | tee "$VORTEX_OUTPUT_DIR/ig_cli_$(date +%s).txt"
}
```

## 6. Automatic Directory Setup

**Initialize vortex directory**:
```bash
# vortex-init.sh
#!/bin/bash
DIR="${1:-.}"

mkdir -p "$DIR/.vortex/outputs"
cat > "$DIR/.vortex/enforce.sh" << 'EOF'
#!/bin/bash
# Vortex enforcement - auto-sourced
export VORTEX_ENFORCED=1
export VORTEX_LOG_DIR="$(pwd)/.vortex"
export VORTEX_OUTPUT_DIR="$(pwd)/.vortex/outputs"

ig-cli() {
    echo "$(date -Iseconds)|ig-cli|$*" >> "$VORTEX_LOG_DIR/commands.jsonl"
    command ig-cli "$@" | tee "$VORTEX_OUTPUT_DIR/ig_cli_$(date +%s).txt"
}

node() {
    echo "$(date -Iseconds)|node|$*" >> "$VORTEX_LOG_DIR/commands.jsonl"
    command node "$@" | tee "$VORTEX_OUTPUT_DIR/node_$(date +%s).txt"
}
EOF

echo "source .vortex/enforce.sh" >> "$DIR/.env"
echo "✅ Vortex enforcement initialized in $DIR"
```

## 7. IDE Integration

**VS Code tasks**:
```json
// .vscode/tasks.json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Vortex ig-cli",
            "type": "shell",
            "command": "ig-cli",
            "args": ["${input:args}"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "new"
            },
            "problemMatcher": []
        }
    ],
    "inputs": [
        {
            "id": "args",
            "description": "ig-cli arguments",
            "default": "stats ./docs/",
            "type": "promptString"
        }
    ]
}
```

**The key insight**: **Enforcement at the shell level** ensures no command can escape logging, while **directory-level enforcement** keeps it contained to specific projects.

**Most practical approach**: Start with **directory-level .vortex/enforce.sh** and **Git hooks** for validation!