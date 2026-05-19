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
        
        # Check if it's already a symlink or directory
        if [ -L "$target_path" ]; then
            # If it's a symlink, check if it points to the right place
            current_link=$(readlink "$target_path")
            if [ "$current_link" != "$skill_path" ]; then
                rm "$target_path"
                ln -s "$skill_path" "$target_path"
                echo "Updated symlink for skill: $skill_name"
            fi
        elif [ -e "$target_path" ]; then
            # If it's a real file/dir but not a symlink, don't overwrite it unless it's empty
            echo "Skipping $skill_name: existing file/directory at $target_path"
        else
            # Create symlink
            ln -s "$skill_path" "$target_path"
            echo "Created symlink for skill: $skill_name"
        fi
    fi
done
