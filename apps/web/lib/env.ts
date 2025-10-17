/**
 * Environment variable validation
 * Validates required environment variables at startup and provides helpful error messages
 */

interface EnvVar {
  key: string
  required: boolean
  description: string
}

const envVars: EnvVar[] = [
  // Supabase
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key',
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Supabase service role key (server-side only)',
  },
  
  // Database
  {
    key: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL database connection string',
  },
  
  // App config
  {
    key: 'NEXT_PUBLIC_APP_URL',
    required: true,
    description: 'Public URL of the application',
  },
  
  // Stripe (required for payment processing)
  {
    key: 'STRIPE_SECRET_KEY',
    required: true,
    description: 'Stripe secret key',
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    required: false, // Optional in dev
    description: 'Stripe webhook secret for validating webhooks',
  },
  {
    key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: true,
    description: 'Stripe publishable key',
  },
  
  // Cron
  {
    key: 'CRON_SECRET',
    required: process.env.NODE_ENV === 'production',
    description: 'Secret for authenticating cron job requests',
  },
  
  // Price IDs (required for checkout)
  {
    key: 'NEXT_PUBLIC_PRICE_SCHOOL_STARTER',
    required: false,
    description: 'Stripe price ID for School Starter plan',
  },
  {
    key: 'NEXT_PUBLIC_PRICE_SCHOOL_PRO',
    required: false,
    description: 'Stripe price ID for School Pro plan',
  },
  {
    key: 'NEXT_PUBLIC_PRICE_DISTRICT_PRO',
    required: false,
    description: 'Stripe price ID for District Pro plan',
  },
  {
    key: 'NEXT_PUBLIC_PRICE_DISTRICT_ENTERPRISE',
    required: false,
    description: 'Stripe price ID for District Enterprise plan',
  },
]

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate all required environment variables
 */
export function validateEnv(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  for (const envVar of envVars) {
    const value = process.env[envVar.key]

    if (envVar.required && !value) {
      errors.push(
        `❌ Missing required environment variable: ${envVar.key}\n   Description: ${envVar.description}`
      )
    } else if (!envVar.required && !value) {
      warnings.push(
        `⚠️  Optional environment variable not set: ${envVar.key}\n   Description: ${envVar.description}`
      )
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate environment and throw if invalid
 * Call this at application startup
 */
export function requireValidEnv(): void {
  const result = validateEnv()

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Environment Warnings:')
    result.warnings.forEach((warning) => console.warn(warning))
    console.warn('')
  }

  if (!result.valid) {
    console.error('\n❌ Environment Validation Failed!\n')
    result.errors.forEach((error) => console.error(error))
    console.error(
      '\n📝 Please check your .env file and ensure all required variables are set.'
    )
    console.error('   See .env.example for reference.\n')
    throw new Error('Missing required environment variables')
  }

  console.log('✅ Environment validation passed')
}

/**
 * Get a required environment variable or throw
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key]
  
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please add it to your .env file. See .env.example for reference.`
    )
  }
  
  return value
}

/**
 * Get an optional environment variable with a default value
 */
export function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Get Supabase configuration
 */
export function getSupabaseConfig() {
  return {
    url: getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
  }
}

/**
 * Get Stripe configuration
 */
export function getStripeConfig() {
  return {
    secretKey: getRequiredEnv('STRIPE_SECRET_KEY'),
    publishableKey: getRequiredEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  }
}

/**
 * Get application configuration
 */
export function getAppConfig() {
  return {
    url: getRequiredEnv('NEXT_PUBLIC_APP_URL'),
    env: getEnv('NEXT_PUBLIC_APP_ENV', 'development'),
    cronSecret: process.env.CRON_SECRET,
  }
}
