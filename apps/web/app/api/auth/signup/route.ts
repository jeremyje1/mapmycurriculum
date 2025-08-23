import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, institution: institutionName, state } = await req.json();

    if (!email || !institutionName) {
      return NextResponse.json({ error: 'Email and institution are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Create or find institution
    let institution = await prisma.institution.findFirst({
      where: { name: institutionName },
    });

    institution = institution ?? await prisma.institution.create({
      data: {
        name: institutionName,
        state: state ?? 'US-TX',
      },
    });

    // Create user without password (passwordless provisional account)
    const user = await prisma.user.create({
      data: {
        email,
        institutionId: institution.id,
        role: 'admin',
      },
    });

    // Generate a simple session token (in production, use JWT)
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
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

    // Set a secure cookie
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
