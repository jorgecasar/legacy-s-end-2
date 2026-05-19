#!/bin/bash

# Base paths
SOURCE_DIR="node_modules/@awesome.me/webawesome/dist/skills"
TARGET_DIR=".rulesync/skills"

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Warning: Web Awesome skills directory not found at $SOURCE_DIR"
    exit 0
fi

# Ensure target directory exists
mkdir -p "$TARGET_DIR"

# Loop through skills in source
for skill_path in "$SOURCE_DIR"/*; do
    if [ -d "$skill_path" ]; then
        skill_name=$(basename "$skill_path")
        target_path="$TARGET_DIR/$skill_name"
        
        # Always update the copy to ensure it matches node_modules
        rm -rf "$target_path"
        cp -r "$skill_path" "$target_path"
        echo "Synced skill: $skill_name"
    fi
done
