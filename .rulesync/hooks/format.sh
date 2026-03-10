#!/bin/bash

# .rulesync/hooks/format.sh
# Formats and lints only the modified file to save time and ensure quality.

FILE_PATH=$1

if [[ -z "$FILE_PATH" ]]; then
  echo "No file path provided to hook."
  exit 0
fi

# Skip hidden directories like .gemini, .serena, .rulesync, etc.
if [[ "$FILE_PATH" == .* ]] || [[ "$FILE_PATH" == */.* ]]; then
  echo "Skipping hidden file/folder: $FILE_PATH"
  exit 0
fi

# 1. Format (oxfmt)
echo "Applying format to $FILE_PATH..."
npx oxfmt format "$FILE_PATH" --no-error-on-unmatched-pattern

# 2. Lint (oxlint)
echo "Linting $FILE_PATH..."
npx oxlint "$FILE_PATH" --fix
