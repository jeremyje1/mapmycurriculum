import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started | Map My Curriculum',
  description: 'Subscription signup to launch curriculum mapping workspace.'
};

export default function SignupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
