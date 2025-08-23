#!/bin/bash

# Supabase Setup Script for Map My Curriculum
echo "🚀 Setting up Supabase integration for Map My Curriculum"
echo "=================================================="

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the apps/web directory"
    exit 1
fi

# Check if Supabase environment variables are set
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.supabase.template .env.local
    echo "⚠️  Please edit .env.local and add your Supabase credentials:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" 
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - DATABASE_URL"
    echo ""
    echo "You can find these in your Supabase dashboard:"
    echo "https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api"
    echo ""
    read -p "Press Enter after you've updated .env.local with your credentials..."
fi

# Check if required environment variables are set
source .env.local
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ "$NEXT_PUBLIC_SUPABASE_URL" = "your_supabase_project_url_here" ]; then
    echo "❌ Error: Please set your Supabase URL in .env.local"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" = "your_supabase_anon_key_here" ]; then
    echo "❌ Error: Please set your Supabase anon key in .env.local"
    exit 1
fi

echo "✅ Environment variables configured"

# Install Supabase dependencies if not already installed
echo "📦 Installing Supabase dependencies..."
pnpm add @supabase/supabase-js @supabase/ssr

echo "🗄️  Database Setup Instructions:"
echo "================================="
echo "1. Go to your Supabase dashboard: https://supabase.com/dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Create a new query and paste the contents of:"
echo "   ../../supabase/migrations/001_initial_setup.sql"
echo "4. Run the migration to create your tables and policies"
echo ""

echo "🔐 Authentication Setup:"
echo "========================"
echo "1. In Supabase dashboard, go to Authentication > Settings"
echo "2. Add your domain to 'Site URL': https://platform.mapmycurriculum.com"
echo "3. Add redirect URLs for development: http://localhost:3000"
echo ""

echo "🎨 Optional - Auth UI Customization:"
echo "==================================="
echo "1. Go to Authentication > Settings > Email Templates"
echo "2. Customize the signup/login email templates with your branding"
echo ""

echo "🚀 Next Steps:"
echo "=============="
echo "1. Run the database migration in Supabase dashboard"
echo "2. Test the application: pnpm dev"
echo "3. Try creating a new account and logging in"
echo "4. Deploy to Vercel with the new environment variables"
echo ""

echo "✅ Supabase setup script completed!"
echo "📚 For more help, see the Supabase documentation:"
echo "   https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs"
