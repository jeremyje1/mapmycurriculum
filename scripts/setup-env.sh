#!/bin/bash

# Interactive Environment Setup Script
# This script will prompt for all required secrets and configure them across all environment files

set -e

echo "🔧 Map My Curriculum - Environment Setup"
echo "========================================"
echo ""
echo "This script will prompt you for all required secrets and configure them automatically."
echo "Press Ctrl+C at any time to cancel."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# File paths
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
ENV_PROD="$ROOT_DIR/.env.production"
ENV_RAILWAY="$ROOT_DIR/.env.railway"
ENV_LOCAL="$ROOT_DIR/apps/web/.env.local"

echo -e "${BLUE}📍 Working directory: $ROOT_DIR${NC}"
echo ""

# ============================
# 1. Database Password
# ============================
echo -e "${YELLOW}📊 STEP 1: Supabase Database Password${NC}"
echo "Get this from: https://supabase.com/dashboard/project/dsxiiakytpufxsqlimkf/settings/database"
echo "Look for 'Connection string' under 'Connection pooling'"
echo ""
read -sp "Enter your Supabase database password: " DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ Database password cannot be empty${NC}"
    exit 1
fi

DATABASE_URL="postgresql://postgres.dsxiiakytpufxsqlimkf:${DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:6543/postgres"
echo -e "${GREEN}✅ Database URL configured${NC}"
echo ""

# ============================
# 2. Stripe Keys
# ============================
echo -e "${YELLOW}💳 STEP 2: Stripe API Keys${NC}"
echo "Get these from: https://dashboard.stripe.com/test/apikeys"
echo ""

read -p "Enter STRIPE_SECRET_KEY (starts with sk_test_ or sk_live_): " STRIPE_SECRET_KEY
if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo -e "${RED}❌ Stripe secret key cannot be empty${NC}"
    exit 1
fi

read -p "Enter NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (starts with pk_test_ or pk_live_): " STRIPE_PUBLISHABLE_KEY
if [ -z "$STRIPE_PUBLISHABLE_KEY" ]; then
    echo -e "${RED}❌ Stripe publishable key cannot be empty${NC}"
    exit 1
fi

read -p "Enter STRIPE_WEBHOOK_SECRET (starts with whsec_): " STRIPE_WEBHOOK_SECRET
if [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
    echo -e "${RED}❌ Stripe webhook secret cannot be empty${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Stripe keys configured${NC}"
echo ""

# ============================
# 3. App URLs
# ============================
echo -e "${YELLOW}🌐 STEP 3: Application URLs${NC}"
echo ""

read -p "Enter production app URL [default: https://mapmycurriculum-f95argh4j-jeremys-projects-73929cad.vercel.app]: " PROD_APP_URL
PROD_APP_URL=${PROD_APP_URL:-"https://mapmycurriculum-f95argh4j-jeremys-projects-73929cad.vercel.app"}

LOCAL_APP_URL="http://localhost:3000"

echo -e "${GREEN}✅ App URLs configured${NC}"
echo ""

# ============================
# Update all .env files
# ============================
echo -e "${YELLOW}📝 STEP 4: Writing configuration files${NC}"
echo ""

# Function to update env file
update_env_file() {
    local file=$1
    local is_production=$2
    
    echo -e "${BLUE}Updating $file...${NC}"
    
    # Update DATABASE_URL
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|g" "$file"
    else
        # Linux
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|g" "$file"
    fi
    
    # Update Stripe keys
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY|g" "$file"
        sed -i '' "s|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY|g" "$file"
        sed -i '' "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET|g" "$file"
    else
        sed -i "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY|g" "$file"
        sed -i "s|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY|g" "$file"
        sed -i "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET|g" "$file"
    fi
    
    # Update APP_URL based on environment
    if [ "$is_production" = true ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=$PROD_APP_URL|g" "$file"
        else
            sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=$PROD_APP_URL|g" "$file"
        fi
    else
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=$LOCAL_APP_URL|g" "$file"
        else
            sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=$LOCAL_APP_URL|g" "$file"
        fi
    fi
}

# Update all files
update_env_file "$ENV_FILE" false
update_env_file "$ENV_LOCAL" false
update_env_file "$ENV_PROD" true
update_env_file "$ENV_RAILWAY" true

echo -e "${GREEN}✅ All configuration files updated${NC}"
echo ""

# ============================
# Summary
# ============================
echo -e "${GREEN}🎉 Configuration Complete!${NC}"
echo ""
echo "Files updated:"
echo "  ✅ $ENV_FILE"
echo "  ✅ $ENV_LOCAL"
echo "  ✅ $ENV_PROD"
echo "  ✅ $ENV_RAILWAY"
echo ""

# ============================
# Next Steps
# ============================
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1️⃣  Generate Stripe Products & Price IDs:"
echo "   ${BLUE}pnpm stripe:setup${NC}"
echo "   ${BLUE}pnpm stripe:verify${NC}"
echo ""
echo "2️⃣  Check if database has important data:"
echo "   ${BLUE}psql \"$DATABASE_URL\" -c \"SELECT COUNT(*) FROM institutions;\"${NC}"
echo ""
echo "3️⃣  Run database migrations (if safe to reset):"
echo "   ${BLUE}supabase db reset --linked${NC}"
echo "   Or manually fix schema conflicts if data must be preserved"
echo ""
echo "4️⃣  Test locally:"
echo "   ${BLUE}cd apps/web && npm run dev${NC}"
echo ""
echo "5️⃣  Configure Vercel environment variables:"
echo "   ${BLUE}vercel login${NC}"
echo "   ${BLUE}vercel link${NC}"
echo "   Then add variables via dashboard or CLI (see ENV_SETUP_CHECKLIST.md)"
echo ""
echo "6️⃣  Configure Railway environment variables:"
echo "   ${BLUE}railway login${NC}"
echo "   ${BLUE}railway link enormous-language/mapmycurriculum${NC}"
echo "   Then add variables via dashboard or CLI (see ENV_SETUP_CHECKLIST.md)"
echo ""
echo -e "${GREEN}Setup script completed successfully! 🚀${NC}"
