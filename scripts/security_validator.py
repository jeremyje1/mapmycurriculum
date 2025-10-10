#!/usr/bin/env python3
"""
Security Validator for Map My Curriculum
Validates environment variables and secrets at startup
"""

import os
import sys
import re
from typing import List, Tuple, Dict
from datetime import datetime

class SecurityValidator:
    def __init__(self):
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.checks_passed = 0
        self.checks_failed = 0
        
    def log(self, level: str, message: str):
        """Log a message with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] [{level}] {message}")
    
    def validate_env_var(self, var_name: str, required: bool = True, 
                         min_length: int = 0, pattern: str = None) -> bool:
        """Validate a single environment variable"""
        value = os.getenv(var_name)
        
        if not value:
            if required:
                self.errors.append(f"Missing required env var: {var_name}")
                self.checks_failed += 1
                return False
            else:
                self.warnings.append(f"Optional env var not set: {var_name}")
                return True
        
        # Check minimum length
        if min_length > 0 and len(value) < min_length:
            self.errors.append(
                f"{var_name} is too short (min: {min_length}, got: {len(value)})"
            )
            self.checks_failed += 1
            return False
        
        # Check pattern if provided
        if pattern and not re.match(pattern, value):
            self.errors.append(f"{var_name} doesn't match expected pattern")
            self.checks_failed += 1
            return False
        
        self.checks_passed += 1
        return True
    
    def check_secret_exposure(self) -> bool:
        """Check if secrets might be exposed in code"""
        dangerous_patterns = [
            (r'password\s*=\s*["\'][^"\']+["\']', 'Hardcoded password detected'),
            (r'api[_-]?key\s*=\s*["\'][^"\']+["\']', 'Hardcoded API key detected'),
            (r'secret\s*=\s*["\'][^"\']+["\']', 'Hardcoded secret detected'),
            (r'whsec_[a-zA-Z0-9]{32,}', 'Stripe webhook secret in code'),
            (r'sk_live_[a-zA-Z0-9]{24,}', 'Stripe live key in code'),
        ]
        
        # Check environment for leaked patterns
        for key, value in os.environ.items():
            if key.startswith('npm_') or key.startswith('VERCEL_GIT'):
                continue
                
            for pattern, message in dangerous_patterns:
                if re.search(pattern, str(value), re.IGNORECASE):
                    self.warnings.append(f"{message} in env var: {key}")
        
        return True
    
    def validate_stripe_keys(self) -> bool:
        """Validate Stripe API keys"""
        self.log("INFO", "Validating Stripe configuration...")
        
        # Check webhook secret
        webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        if webhook_secret:
            if not webhook_secret.startswith('whsec_'):
                self.errors.append("STRIPE_WEBHOOK_SECRET has invalid format")
                self.checks_failed += 1
                return False
            
            if len(webhook_secret) < 40:
                self.errors.append("STRIPE_WEBHOOK_SECRET is too short")
                self.checks_failed += 1
                return False
        
        # Check API key
        api_key = os.getenv('STRIPE_SECRET_KEY')
        if api_key:
            if api_key.startswith('sk_live_'):
                self.log("INFO", "Using Stripe LIVE mode")
            elif api_key.startswith('sk_test_'):
                self.log("INFO", "Using Stripe TEST mode")
            else:
                self.errors.append("STRIPE_SECRET_KEY has invalid format")
                self.checks_failed += 1
                return False
        
        self.checks_passed += 1
        return True
    
    def validate_supabase_keys(self) -> bool:
        """Validate Supabase configuration"""
        self.log("INFO", "Validating Supabase configuration...")
        
        # Check URL
        url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        if url and not url.startswith('https://'):
            self.errors.append("NEXT_PUBLIC_SUPABASE_URL must use HTTPS")
            self.checks_failed += 1
            return False
        
        # Check service role key length (should be JWT, ~185+ chars)
        service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        if service_key:
            if len(service_key) < 100:
                self.errors.append(
                    f"SUPABASE_SERVICE_ROLE_KEY seems invalid (length: {len(service_key)})"
                )
                self.checks_failed += 1
                return False
            
            if not (service_key.startswith('eyJ') or 
                    re.match(r'^[a-f0-9]{8}-[a-f0-9]{4}', service_key)):
                self.warnings.append(
                    "SUPABASE_SERVICE_ROLE_KEY format looks unusual"
                )
        
        self.checks_passed += 1
        return True
    
    def validate_cron_secret(self) -> bool:
        """Validate CRON_SECRET"""
        self.log("INFO", "Validating CRON configuration...")
        
        cron_secret = os.getenv('CRON_SECRET')
        if not cron_secret:
            self.errors.append("CRON_SECRET is required for scheduled jobs")
            self.checks_failed += 1
            return False
        
        if len(cron_secret) < 32:
            self.errors.append("CRON_SECRET is too weak (min 32 chars)")
            self.checks_failed += 1
            return False
        
        # Check if it's a strong random string
        if not re.match(r'^[a-f0-9]{64}$', cron_secret):
            self.warnings.append(
                "CRON_SECRET should be 64 hex characters (32 bytes)"
            )
        
        self.checks_passed += 1
        return True
    
    def run_all_checks(self) -> bool:
        """Run all security validations"""
        self.log("INFO", "=" * 60)
        self.log("INFO", "Starting Security Validation")
        self.log("INFO", "=" * 60)
        
        # Required environment variables
        required_vars = {
            'NEXT_PUBLIC_SUPABASE_URL': (True, 20, r'^https://'),
            'NEXT_PUBLIC_SUPABASE_ANON_KEY': (True, 100, None),
            'SUPABASE_SERVICE_ROLE_KEY': (True, 100, None),
            'DATABASE_URL': (True, 20, r'^postgres'),
            'CRON_SECRET': (True, 32, None),
        }
        
        self.log("INFO", "Checking required environment variables...")
        for var_name, (required, min_len, pattern) in required_vars.items():
            self.validate_env_var(var_name, required, min_len, pattern)
        
        # Stripe validation
        self.validate_stripe_keys()
        
        # Supabase validation
        self.validate_supabase_keys()
        
        # CRON validation
        self.validate_cron_secret()
        
        # Check for secret exposure
        self.check_secret_exposure()
        
        # Print results
        self.log("INFO", "=" * 60)
        self.log("INFO", f"Validation Results:")
        self.log("INFO", f"  ✅ Checks Passed: {self.checks_passed}")
        self.log("INFO", f"  ❌ Checks Failed: {self.checks_failed}")
        self.log("INFO", f"  ⚠️  Warnings: {len(self.warnings)}")
        self.log("INFO", "=" * 60)
        
        # Print errors
        if self.errors:
            self.log("ERROR", "CRITICAL ERRORS:")
            for error in self.errors:
                self.log("ERROR", f"  ❌ {error}")
        
        # Print warnings
        if self.warnings:
            self.log("WARN", "WARNINGS:")
            for warning in self.warnings:
                self.log("WARN", f"  ⚠️  {warning}")
        
        if self.errors:
            self.log("ERROR", "=" * 60)
            self.log("ERROR", "SECURITY VALIDATION FAILED")
            self.log("ERROR", "Application startup blocked for security reasons")
            self.log("ERROR", "=" * 60)
            return False
        
        self.log("INFO", "=" * 60)
        self.log("INFO", "✅ SECURITY VALIDATION PASSED")
        self.log("INFO", "=" * 60)
        return True


def main():
    """Main entry point"""
    validator = SecurityValidator()
    
    if not validator.run_all_checks():
        sys.exit(1)
    
    sys.exit(0)


if __name__ == '__main__':
    main()
