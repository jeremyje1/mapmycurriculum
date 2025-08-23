#!/bin/bash

echo "🚀 Map My Curriculum - Supabase Setup Script"
echo "============================================="
echo ""

echo "This script will help you set up Supabase for your curriculum mapping platform."
echo ""

echo "📋 Prerequisites Checklist:"
echo "  ✅ You have a Supabase account (https://supabase.com)"
echo "  ✅ You've created a new project named 'mapmycurriculum'"
echo "  ✅ You have your project URL and API keys ready"
echo ""

read -p "Do you have all prerequisites ready? (y/n): " ready
if [[ $ready != "y" && $ready != "Y" ]]; then
    echo ""
    echo "Please complete the prerequisites first:"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Click 'New Project'"
    echo "3. Name it 'mapmycurriculum'"
    echo "4. Choose your preferred region (us-east-1 recommended)"
    echo "5. Generate a strong password"
    echo "6. Wait for project setup to complete (~2 minutes)"
    echo ""
    echo "Then come back and run this script again!"
    exit 1
fi

echo ""
echo "🔑 Let's set up your environment variables..."
echo ""

read -p "Enter your Supabase Project URL: " SUPABASE_URL
read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY
read -p "Enter your Supabase Service Role Key: " SUPABASE_SERVICE_KEY

echo ""
echo "📝 Creating environment configuration..."

# Copy template and update with Supabase config
cp .env.supabase.template .env.supabase

# Update with actual values (you'll need to edit Stripe keys manually)
sed -i "" "s|your_supabase_project_url|$SUPABASE_URL|g" .env.supabase
sed -i "" "s|your_supabase_anon_key|$SUPABASE_ANON_KEY|g" .env.supabase
sed -i "" "s|your_supabase_service_role_key|$SUPABASE_SERVICE_KEY|g" .env.supabase

echo "✅ Environment variables configured!"
echo ""
echo "⚠️  IMPORTANT: You still need to update the Stripe keys in .env.supabase"
echo ""

echo "🗄️  Next: Set up your Supabase database schema..."
echo ""
echo "Run this SQL in your Supabase SQL Editor:"
echo "(Go to: $SUPABASE_URL/sql)"
echo ""
echo "Copy and paste the contents of: supabase/migrations/001_initial_setup.sql"
echo ""

echo "🧪 Testing the setup..."

if command -v curl &> /dev/null; then
    echo "Testing Supabase connection..."
    response=$(curl -s -H "apikey: $SUPABASE_ANON_KEY" "$SUPABASE_URL/rest/v1/")
    if [[ $response == *"swagger"* ]]; then
        echo "✅ Supabase connection successful!"
    else
        echo "❌ Supabase connection failed. Please check your URL and API key."
    fi
else
    echo "⚠️  curl not found, skipping connection test"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.supabase and add your Stripe keys"
echo "2. Run the SQL migration in your Supabase dashboard"
echo "3. Test the new auth by visiting: http://localhost:3000/signup"
echo "4. Check the migration guide: docs/SUPABASE_MIGRATION.md"
echo ""
echo "🚀 You're ready to start Phase 1 of the Supabase migration!"
echo ""
echo "Need help? Check the full migration plan in docs/SUPABASE_MIGRATION.md"
