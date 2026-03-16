#!/bin/bash

set -e

# Color codes
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RESET='\033[0m'

echo -e "${CYAN}Fetching production tags...${RESET}"
echo ""

CURRENT_PROD_COMMIT=$(gh api repos/:owner/:repo/git/refs/tags/prod --jq '.object.sha' 2>/dev/null || echo "")

PROD_TAGS_JSON=$(gh api repos/:owner/:repo/git/refs/tags --jq '[.[] | select(.ref | endswith("-prod")) | {ref: .ref, sha: .object.sha}]')

echo "Available production tags:"
echo "$PROD_TAGS_JSON" | jq -r '.[] | .ref | sub("refs/tags/"; "")' | sort -V -r | head -n 10 | while read tag; do
  # Get commit hash for this tag
  TAG_COMMIT=$(echo "$PROD_TAGS_JSON" | jq -r --arg tag "refs/tags/$tag" '.[] | select(.ref == $tag) | .sha')
  
  # Mark if it's the current deployed version with green color
  if [ "$TAG_COMMIT" = "$CURRENT_PROD_COMMIT" ]; then
    echo -e "  ${GREEN}→ $tag (currently deployed)${RESET}"
  else
    echo "    $tag"
  fi
done

read -p "Enter production tag: " PROD_TAG
read -p "Enter ticket number: " TICKET

echo ""
echo "Summary:"
echo "  Production Tag: $PROD_TAG"
echo "  ADO Ticket:     $TICKET"
echo ""
read -p "Proceed with hotfix creation? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled"
  exit 0
fi

echo ""
echo "Triggering hotfix workflow..."

gh workflow run hotfix_initiate.yml \
  -f prod-tag="$PROD_TAG" \
  -f ticket-number="$TICKET"

echo "View workflow runs: gh run list --workflow=hotfix_initiate.yml"