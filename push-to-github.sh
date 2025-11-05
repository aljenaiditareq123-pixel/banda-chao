#!/bin/bash

# Push to GitHub using Personal Access Token
# This script uses the token directly in the URL

cd /Users/tarqahmdaljnydy/Desktop/banda-chao

# Token from GitHub
TOKEN="ghp_I7oRchBSmAqIUtHscKhPr9isoooNA83K0Rvn"
USERNAME="aljenaiditareq123-pixel"
REPO="banda-chao"

# Use custom credential helper
export GIT_ASKPASS="/Users/tarqahmdaljnydy/Desktop/banda-chao/git-askpass-helper.sh"
export GIT_TERMINAL_PROMPT=1
git config --global credential.helper ""

# Set remote URL with token
git remote set-url origin https://${TOKEN}@github.com/${USERNAME}/${REPO}.git

# Push
echo "Pushing to GitHub..."
git push origin main

# Reset remote URL (remove token for security)
git remote set-url origin https://github.com/${USERNAME}/${REPO}.git

# Restore credential helper
git config --global credential.helper store

echo "Done!"

