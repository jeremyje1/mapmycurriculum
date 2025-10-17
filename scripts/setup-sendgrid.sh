#!/bin/bash

# SendGrid Setup Script for Map My Curriculum
# This script helps you set up the contact form email integration

set -e

echo "🚀 Map My Curriculum - SendGrid Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f "apps/web/.env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example apps/web/.env
    echo -e "${GREEN}✓ Created apps/web/.env${NC}"
fi

# Check if @sendgrid/mail is installed
echo ""
echo "📦 Checking dependencies..."
if ! grep -q "@sendgrid/mail" apps/web/package.json; then
    echo -e "${YELLOW}Installing @sendgrid/mail...${NC}"
    cd apps/web
    pnpm add @sendgrid/mail
    cd ../..
    echo -e "${GREEN}✓ @sendgrid/mail installed${NC}"
else
    echo -e "${GREEN}✓ @sendgrid/mail already installed${NC}"
fi

# Check if SendGrid API key is set
echo ""
echo "🔑 Checking SendGrid configuration..."

if grep -q "SENDGRID_API_KEY=your-sendgrid-api-key" apps/web/.env 2>/dev/null || ! grep -q "SENDGRID_API_KEY" apps/web/.env 2>/dev/null; then
    echo -e "${YELLOW}⚠️  SendGrid API key not configured${NC}"
    echo ""
    echo "To complete setup:"
    echo "1. Sign up at https://signup.sendgrid.com/"
    echo "2. Create an API key with Mail Send permissions"
    echo "3. Verify sender email: info@northpathstrategies.org"
    echo "4. Add to apps/web/.env:"
    echo ""
    echo "   SENDGRID_API_KEY=SG.your-actual-key"
    echo "   FROM_EMAIL=info@northpathstrategies.org"
    echo ""
    read -p "Do you want to add it now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        read -p "Enter your SendGrid API key: " api_key
        
        # Update .env file
        if grep -q "SENDGRID_API_KEY" apps/web/.env; then
            sed -i.bak "s/SENDGRID_API_KEY=.*/SENDGRID_API_KEY=$api_key/" apps/web/.env
        else
            echo "SENDGRID_API_KEY=$api_key" >> apps/web/.env
        fi
        
        if grep -q "FROM_EMAIL" apps/web/.env; then
            sed -i.bak "s/FROM_EMAIL=.*/FROM_EMAIL=info@northpathstrategies.org/" apps/web/.env
        else
            echo "FROM_EMAIL=info@northpathstrategies.org" >> apps/web/.env
        fi
        
        rm -f apps/web/.env.bak
        echo -e "${GREEN}✓ SendGrid API key saved${NC}"
    fi
else
    echo -e "${GREEN}✓ SendGrid API key configured${NC}"
fi

# Check FROM_EMAIL
if ! grep -q "FROM_EMAIL" apps/web/.env 2>/dev/null; then
    echo "FROM_EMAIL=info@northpathstrategies.org" >> apps/web/.env
    echo -e "${GREEN}✓ FROM_EMAIL added${NC}"
fi

echo ""
echo "🧪 Testing Configuration..."
echo ""

# Test API endpoint
cd apps/web
if pnpm dev > /dev/null 2>&1 & 
then
    DEV_PID=$!
    sleep 5
    
    # Test health check
    response=$(curl -s http://localhost:3000/api/contact)
    
    if echo "$response" | grep -q "ready"; then
        echo -e "${GREEN}✓ Contact form API is ready${NC}"
    elif echo "$response" | grep -q "not_configured"; then
        echo -e "${YELLOW}⚠️  API running but SendGrid not fully configured${NC}"
    else
        echo -e "${RED}✗ Could not connect to API${NC}"
    fi
    
    # Kill dev server
    kill $DEV_PID 2>/dev/null || true
fi
cd ../..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Verify your sender email in SendGrid dashboard"
echo "2. Test the contact form at /marketing/coming-soon.html"
echo "3. Check email delivery to info@northpathstrategies.org"
echo ""
echo "📚 Documentation:"
echo "- Full setup guide: SENDGRID_SETUP.md"
echo "- Marketing pages: marketing/README.md"
echo ""
echo "🚀 To start development:"
echo "   cd apps/web && pnpm dev"
echo ""
echo "🌐 Access the marketing page at:"
echo "   http://localhost:3000/marketing/coming-soon.html"
echo ""
