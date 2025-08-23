import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
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

    // For users who came through Stripe (no password), generate a session token and log them in
    // In production, you might want to send a magic link via email instead
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
