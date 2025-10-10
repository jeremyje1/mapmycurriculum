#!/bin/bash

# Update environment files with Stripe Price IDs

set -e

# Stripe Price IDs from setup
PRICE_SCHOOL_STARTER="price_1SGlJJCzPgWh4DF8wXfrNR7q"
PRICE_SCHOOL_PRO="price_1SGlJKCzPgWh4DF8PMEWNfRI"
PRICE_DISTRICT_PRO="price_1SGlJLCzPgWh4DF8jpoXe3LG"
PRICE_DISTRICT_ENTERPRISE="price_1SGlJMCzPgWh4DF8LfF3bCv8"
PRICE_DEPARTMENT="price_1SGlJNCzPgWh4DF8wCuuvCL5"
PRICE_COLLEGE="price_1SGlJPCzPgWh4DF8xqFtQ0Fu"
PRICE_INSTITUTION="price_1SGlJQCzPgWh4DF8wkkKdpVC"

# File paths
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
ENV_PROD="$ROOT_DIR/.env.production"
ENV_RAILWAY="$ROOT_DIR/.env.railway"
ENV_LOCAL="$ROOT_DIR/apps/web/.env.local"

echo "🎯 Updating Stripe Price IDs in environment files..."
echo ""

# Function to update price IDs
update_prices() {
    local file=$1
    echo "📝 Updating $file..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|NEXT_PUBLIC_PRICE_SCHOOL_STARTER=.*|NEXT_PUBLIC_PRICE_SCHOOL_STARTER=$PRICE_SCHOOL_STARTER|g" "$file"
        sed -i '' "s|NEXT_PUBLIC_PRICE_SCHOOL_PRO=.*|NEXT_PUBLIC_PRICE_SCHOOL_PRO=$PRICE_SCHOOL_PRO|g" "$file"
        sed -i '' "s|NEXT_PUBLIC_PRICE_DISTRICT_PRO=.*|NEXT_PUBLIC_PRICE_DISTRICT_PRO=$PRICE_DISTRICT_PRO|g" "$file"
        sed -i '' "s|NEXT_PUBLIC_PRICE_DISTRICT_ENTERPRISE=.*|NEXT_PUBLIC_PRICE_DISTRICT_ENTERPRISE=$PRICE_DISTRICT_ENTERPRISE|g" "$file"
        sed -i '' "s|NEXT_PUBLIC_PRICE_DEPARTMENT=.*|NEXT_PUBLIC_PRICE_DEPARTMENT=$PRICE_DEPARTMENT|g" "$file"
        sed -i '' "s|NEXT_PUBLIC_PRICE_COLLEGE=.*|NEXT_PUBLIC_PRICE_COLLEGE=$PRICE_COLLEGE|g" "$file"
        sed -i '' "s|NEXT_PUBLIC_PRICE_INSTITUTION=.*|NEXT_PUBLIC_PRICE_INSTITUTION=$PRICE_INSTITUTION|g" "$file"
    else
        # Linux
        sed -i "s|NEXT_PUBLIC_PRICE_SCHOOL_STARTER=.*|NEXT_PUBLIC_PRICE_SCHOOL_STARTER=$PRICE_SCHOOL_STARTER|g" "$file"
        sed -i "s|NEXT_PUBLIC_PRICE_SCHOOL_PRO=.*|NEXT_PUBLIC_PRICE_SCHOOL_PRO=$PRICE_SCHOOL_PRO|g" "$file"
        sed -i "s|NEXT_PUBLIC_PRICE_DISTRICT_PRO=.*|NEXT_PUBLIC_PRICE_DISTRICT_PRO=$PRICE_DISTRICT_PRO|g" "$file"
        sed -i "s|NEXT_PUBLIC_PRICE_DISTRICT_ENTERPRISE=.*|NEXT_PUBLIC_PRICE_DISTRICT_ENTERPRISE=$PRICE_DISTRICT_ENTERPRISE|g" "$file"
        sed -i "s|NEXT_PUBLIC_PRICE_DEPARTMENT=.*|NEXT_PUBLIC_PRICE_DEPARTMENT=$PRICE_DEPARTMENT|g" "$file"
        sed -i "s|NEXT_PUBLIC_PRICE_COLLEGE=.*|NEXT_PUBLIC_PRICE_COLLEGE=$PRICE_COLLEGE|g" "$file"
        sed -i "s|NEXT_PUBLIC_PRICE_INSTITUTION=.*|NEXT_PUBLIC_PRICE_INSTITUTION=$PRICE_INSTITUTION|g" "$file"
    fi
}

# Update all files
update_prices "$ENV_FILE"
update_prices "$ENV_LOCAL"
update_prices "$ENV_PROD"
update_prices "$ENV_RAILWAY"

echo ""
echo "✅ All environment files updated with Stripe Price IDs!"
echo ""
echo "📋 Price IDs configured:"
echo "  • SCHOOL_STARTER: $PRICE_SCHOOL_STARTER"
echo "  • SCHOOL_PRO: $PRICE_SCHOOL_PRO"
echo "  • DISTRICT_PRO: $PRICE_DISTRICT_PRO"
echo "  • DISTRICT_ENTERPRISE: $PRICE_DISTRICT_ENTERPRISE"
echo "  • DEPARTMENT: $PRICE_DEPARTMENT"
echo "  • COLLEGE: $PRICE_COLLEGE"
echo "  • INSTITUTION: $PRICE_INSTITUTION"
