#!/bin/bash

# Deploy to Vercel and Railway with all environment variables
# This script helps you deploy by setting up env vars in both platforms

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_PROD="$ROOT_DIR/.env.production"
ENV_RAILWAY="$ROOT_DIR/.env.railway"

echo -e "${BLUE}🚀 Map My Curriculum - Deployment Helper${NC}"
echo "==========================================="
echo ""

# Check if env files exist
if [ ! -f "$ENV_PROD" ] || [ ! -f "$ENV_RAILWAY" ]; then
    echo -e "${YELLOW}⚠️  Environment files not found. Run ./scripts/setup-env.sh first${NC}"
    exit 1
fi

echo "Select deployment target:"
echo "  1) Vercel (Frontend)"
echo "  2) Railway (Backend)"
echo "  3) Both"
echo ""
read -p "Enter choice [1-3]: " choice

deploy_vercel() {
    echo ""
    echo -e "${BLUE}📦 Deploying to Vercel...${NC}"
    echo ""
    
    # Check if logged in
    if ! vercel whoami &> /dev/null; then
        echo "Not logged in to Vercel. Logging in..."
        vercel login
    fi
    
    echo ""
    echo -e "${YELLOW}📋 Setting Vercel environment variables...${NC}"
    echo "You'll need to paste the value for each variable when prompted."
    echo "Get values from: $ENV_PROD"
    echo ""
    read -p "Press Enter to continue..."
    
    # Read env file and prompt for each variable
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z $key ]] && continue
        
        # Remove quotes and whitespace
        value=$(echo "$value" | tr -d '"' | xargs)
        
        if [ -n "$value" ] && [ "$value" != "" ]; then
            echo ""
            echo -e "${BLUE}Setting: $key${NC}"
            echo "Value from file: ${value:0:20}..."
            read -p "Use this value? [Y/n]: " confirm
            confirm=${confirm:-Y}
            
            if [[ $confirm =~ ^[Yy]$ ]]; then
                echo "$value" | vercel env add "$key" production --force
            else
                vercel env add "$key" production
            fi
        fi
    done < "$ENV_PROD"
    
    echo ""
    echo -e "${GREEN}✅ Environment variables set in Vercel${NC}"
    echo ""
    read -p "Deploy to production now? [Y/n]: " deploy_now
    deploy_now=${deploy_now:-Y}
    
    if [[ $deploy_now =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${BLUE}🚀 Deploying to Vercel production...${NC}"
        vercel --prod
        echo ""
        echo -e "${GREEN}✅ Vercel deployment complete!${NC}"
    fi
}

deploy_railway() {
    echo ""
    echo -e "${BLUE}🚂 Deploying to Railway...${NC}"
    echo ""
    
    # Check if logged in
    if ! railway whoami &> /dev/null; then
        echo "Not logged in to Railway. Logging in..."
        railway login
    fi
    
    echo ""
    echo -e "${YELLOW}📋 Setting Railway environment variables...${NC}"
    echo "You'll need to paste the value for each variable when prompted."
    echo "Get values from: $ENV_RAILWAY"
    echo ""
    read -p "Press Enter to continue..."
    
    # Read env file and set variables
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z $key ]] && continue
        
        # Remove quotes and whitespace
        value=$(echo "$value" | tr -d '"' | xargs)
        
        if [ -n "$value" ] && [ "$value" != "" ]; then
            echo ""
            echo -e "${BLUE}Setting: $key${NC}"
            echo "Value: ${value:0:20}..."
            echo "$value" | railway variables set "$key"
        fi
    done < "$ENV_RAILWAY"
    
    echo ""
    echo -e "${GREEN}✅ Environment variables set in Railway${NC}"
    echo ""
    read -p "Deploy now? [Y/n]: " deploy_now
    deploy_now=${deploy_now:-Y}
    
    if [[ $deploy_now =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${BLUE}🚀 Deploying to Railway...${NC}"
        railway up
        echo ""
        echo -e "${GREEN}✅ Railway deployment complete!${NC}"
    fi
}

case $choice in
    1)
        deploy_vercel
        ;;
    2)
        deploy_railway
        ;;
    3)
        deploy_vercel
        deploy_railway
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment process complete!${NC}"
echo ""
echo "Next steps:"
echo "  • Test your deployments"
echo "  • Configure custom domains"
echo "  • Set up Stripe webhooks"
echo "  • Review Supabase auth redirects"
