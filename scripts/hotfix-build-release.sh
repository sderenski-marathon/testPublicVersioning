#!/bin/bash

set -e

# Color codes
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RESET='\033[0m'

echo -e "${CYAN}Hotfix Build and Release Script${RESET}"
echo ""

# Fetch branches to help user
echo -e "${CYAN}Fetching available hotfix branches...${RESET}"
git fetch --all --quiet 2>/dev/null || true
echo ""
echo "Available hotfix branches:"
git branch -a | grep -E "hotfix/" | sed 's/remotes\/origin\///' | sort -u | head -n 10 | while read branch; do
  echo "    ${branch}"
done
echo ""

read -p "Enter hotfix branch name: " HOTFIX_BRANCH

if [ -z "$HOTFIX_BRANCH" ]; then
  echo "Error: Hotfix branch is required"
  exit 1
fi

# Prompt for force update
echo ""
echo "Force update existing hotfix tag and release?"
echo "  1) No (default - skip if tag already exists)"
echo "  2) Yes (delete and recreate tag/release)"
read -p "Enter choice (1-2) [1]: " FORCE_CHOICE
FORCE_CHOICE=${FORCE_CHOICE:-1}

case $FORCE_CHOICE in
  1)
    FORCE_UPDATE="false"
    FORCE_DISPLAY="No"
    ;;
  2)
    FORCE_UPDATE="true"
    FORCE_DISPLAY="Yes"
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

# Display summary
echo ""
echo -e "${YELLOW}Build and Release Summary:${RESET}"
echo "  Hotfix Branch:  $HOTFIX_BRANCH"
echo "  Force Update:   $FORCE_DISPLAY"
echo ""
read -p "Proceed with hotfix build and release? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled"
  exit 0
fi

# Trigger workflow
echo ""
echo -e "${CYAN}Triggering hotfix build and release workflow...${RESET}"

gh workflow run hotfix_build_release.yml \
  -f hotfix_branch="$HOTFIX_BRANCH" \
  -f force_update="$FORCE_UPDATE"

echo ""
echo -e "${GREEN}Workflow triggered successfully${RESET}"
echo ""
read -p "Watch the latest run? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  gh run watch $(gh run list --workflow=hotfix_build_release.yml --limit 1 --json databaseId --jq '.[0].databaseId')
  exit 0
fi
