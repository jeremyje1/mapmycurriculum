import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Curriculum Map Tool</h1>
      <p>Early prototype. Validate a state RulePack below.</p>
      <p><Link href="/validate">Validate US-TX Pack</Link></p>
    </main>
  );
}
