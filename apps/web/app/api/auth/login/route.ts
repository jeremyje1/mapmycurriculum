import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // In a real app, you would:
    // 1. Hash the password with bcrypt or similar
    // 2. Verify against stored hash
    // 3. Generate a proper JWT token
    // For demo purposes, we'll create a simple session token
    
    // Check if user exists (simplified - in production use proper password hashing)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate a simple session token (in production, use JWT)
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // Store session in database (you'd need to add a Session model)
    // For now, we'll just return the token
    
    const response = NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId,
      },
      token: sessionToken
    });

    // Set a secure cookie (in production, use httpOnly, secure, sameSite)
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
