#!/bin/bash

set -e

# Color codes
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RESET='\033[0m'

echo -e "${CYAN}Manual Deployment Script${RESET}"
echo ""

# Prompt for branch
read -p "Enter branch to deploy from [main]: " BRANCH
BRANCH=${BRANCH:-main}

# Prompt for environment
echo ""
echo "Select environment:"
echo "  1) staging"
echo "  2) prod"
read -p "Enter choice (1-2) [2]: " ENV_CHOICE
ENV_CHOICE=${ENV_CHOICE:-2}

case $ENV_CHOICE in
  1)
    ENV="staging"
    ;;
  2)
    ENV="prod"
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

# Prompt for deployment type
echo ""
echo "Select deployment option:"
echo "  1) Latest Staging Tag"
echo "  2) Specify Tag"
read -p "Enter choice (1-2) [1]: " DEPLOY_TYPE_CHOICE
DEPLOY_TYPE_CHOICE=${DEPLOY_TYPE_CHOICE:-1}

case $DEPLOY_TYPE_CHOICE in
  1)
    DEPLOYMENT_TYPE="Latest Staging Tag"
    RELEASE_VERSION=""
    ;;
  2)
    DEPLOYMENT_TYPE="Specify Tag"
    echo ""
    echo -e "${CYAN}Fetching available tags...${RESET}"
    echo ""
    
    # Show recent tags
    echo "Recent tags (showing last 15):"
    git fetch --tags 2>/dev/null || true
    git tag --sort=-version:refname | grep -E "v[0-9]+\.[0-9]+\.[0-9]+-(prod|staging|hotfix)$" | head -n 15 | while read tag; do
      TAG_COMMIT=$(git rev-parse "$tag" 2>/dev/null || echo "")
      
      # Check if it's currently deployed to prod
      CURRENT_PROD_COMMIT=$(gh api repos/:owner/:repo/git/refs/tags/prod --jq '.object.sha' 2>/dev/null || echo "")
      
      if [ "$TAG_COMMIT" = "$CURRENT_PROD_COMMIT" ]; then
        echo -e "  ${GREEN}→ $tag (currently prod)${RESET}"
      else
        echo "    $tag"
      fi
    done
    
    echo ""
    read -p "Enter tag to deploy (e.g., v1.0.0-staging): " RELEASE_VERSION
    
    if [ -z "$RELEASE_VERSION" ]; then
      echo "Error: Tag is required when 'Specify Tag' is selected"
      exit 1
    fi
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

# Display summary
echo ""
echo -e "${YELLOW}Deployment Summary:${RESET}"
echo "  Branch:          $BRANCH"
echo "  Environment:     $ENV"
echo "  Deployment Type: $DEPLOYMENT_TYPE"
if [ -n "$RELEASE_VERSION" ]; then
  echo "  Release Version: $RELEASE_VERSION"
fi
echo ""
read -p "Proceed with deployment? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled"
  exit 0
fi

# Trigger workflow
echo ""
echo -e "${CYAN}Triggering manual deployment workflow...${RESET}"

if [ "$DEPLOYMENT_TYPE" = "Latest Staging Tag" ]; then
  gh workflow run manually-deploy.yml \
    -f branch="$BRANCH" \
    -f env="$ENV" \
    -f deployment_type="Latest Staging Tag"
else
  gh workflow run manually-deploy.yml \
    -f branch="$BRANCH" \
    -f env="$ENV" \
    -f deployment_type="Specify Tag" \
    -f release_version="$RELEASE_VERSION"
fi

echo ""
echo -e "${GREEN}Workflow triggered successfully${RESET}"
echo ""
echo "View workflow runs:"
echo "  gh run list --workflow=manually-deploy.yml"
echo ""
read -p "Watch the latest run? (y/n):" WATCH
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  gh run watch \$(gh run list --workflow=manually-deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId') 
fi
