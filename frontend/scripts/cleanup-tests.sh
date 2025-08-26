#!/bin/bash
# Test Process Cleanup Script
# Kills hanging vitest/node test processes and clears temporary files

set -euo pipefail

echo "🧹 Cleaning up test processes and temporary files..."

# Kill any hanging vitest processes
if pgrep -f "vitest" > /dev/null 2>&1; then
    echo "🔴 Killing hanging vitest processes..."
    pkill -f "vitest" || true
    sleep 2
fi

# Kill any hanging node test processes
if pgrep -f "node.*test" > /dev/null 2>&1; then
    echo "🔴 Killing hanging node test processes..."
    pkill -f "node.*test" || true
    sleep 2
fi

# Clear vitest cache
if [ -d "node_modules/.vitest" ]; then
    echo "🗑️  Clearing vitest cache..."
    rm -rf node_modules/.vitest
fi

# Clear coverage reports
if [ -d "coverage" ]; then
    echo "🗑️  Clearing coverage reports..."
    rm -rf coverage
fi

# Clear temporary test files
find . -name "*.test.tmp" -delete 2>/dev/null || true
find . -name ".vitest-*" -delete 2>/dev/null || true

# Check remaining processes
remaining_processes=$(pgrep -f "vitest\|node.*test" || true)
if [ -n "$remaining_processes" ]; then
    echo "⚠️  Warning: Some processes may still be running:"
    ps aux | grep -E "vitest|node.*test" | grep -v grep || true
else
    echo "✅ All test processes cleaned up successfully"
fi

echo "🎯 Memory usage after cleanup:"
vm_stat | grep -E "Pages free|Swapins|Swapouts" | head -3 || true