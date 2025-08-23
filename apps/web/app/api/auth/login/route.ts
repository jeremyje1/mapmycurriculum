import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: { institution: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email. Please check your email or sign up for a new account.' }, { status: 404 });
    }

    // If user has a password, verify it
    if (user.password) {
      if (!password) {
        return NextResponse.json({ error: 'Password is required for this account' }, { status: 400 });
      }
      
      // Simple password comparison (in production, use proper hashing)
      if (user.password !== password) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }
    // If no password set, allow passwordless login (legacy users)

    // Generate a simple session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    const response = NextResponse.json({ 
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId,
        institution: user.institution.name
      },
      token: sessionToken
    });

    // Set a secure cookie
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
