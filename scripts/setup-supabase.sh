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

# Update .env.local with Supabase config
cat > apps/web/.env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY

# Keep existing Prisma config during transition
DATABASE_URL="your_database_url"

# Existing Stripe configuration - replace with your actual values
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
EOF

echo "✅ Environment variables configured!"
echo ""

echo "🗄️  Next: Set up your Supabase database schema..."
echo ""
echo "Copy and run these SQL commands in your Supabase SQL Editor:"
echo "(https://supabase.com/dashboard/project/$SUPABASE_URL/sql)"
echo ""
echo "1️⃣  Enable Row Level Security:"
cat << 'EOF'

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create institutions table
CREATE TABLE institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, state)
);

-- Enable RLS on institutions
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

-- Create policy for institution access
CREATE POLICY "Users can access own institution" ON institutions
  FOR ALL USING (id = (auth.jwt() ->> 'institution_id')::uuid);

EOF

echo ""
echo "2️⃣  Set up authentication trigger:"
cat << 'EOF'

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into institutions if not exists
  INSERT INTO institutions (id, name, state)
  VALUES (
    gen_random_uuid(),
    NEW.raw_user_meta_data->>'institution',
    NEW.raw_user_meta_data->>'state'
  )
  ON CONFLICT (name, state) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

EOF

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
echo "1. Run the SQL commands above in your Supabase dashboard"
echo "2. Test the new auth by visiting: http://localhost:3000/signup"
echo "3. Check the migration guide: docs/SUPABASE_MIGRATION.md"
echo ""
echo "🚀 You're ready to start Phase 1 of the Supabase migration!"
echo ""
echo "Need help? Check the full migration plan in docs/SUPABASE_MIGRATION.md"
