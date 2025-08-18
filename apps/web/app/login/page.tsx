import React from 'react';

export const metadata = {
  title: 'Login | Map My Curriculum',
  description: 'Portal login for Map My Curriculum.'
};

export default function LoginPage() {
  return (
    <main className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <h1>Portal Login</h1>
      <p className="muted" style={{ maxWidth: '60ch' }}>
        Sign in to access your curriculum mapping workspace. (Authentication wiring is pending – this is a placeholder screen.)
      </p>
      <form onSubmit={(e)=>{e.preventDefault(); alert('Auth not yet enabled.');}} style={{ maxWidth: 420, display:'flex', flexDirection:'column', gap:'0.9rem', marginTop:'1.5rem' }}>
        <label style={{ display:'flex', flexDirection:'column', gap:'.35rem' }}>
          <span>Email</span>
          <input name="email" type="email" required placeholder="you@college.edu" style={inputStyle} />
        </label>
        <label style={{ display:'flex', flexDirection:'column', gap:'.35rem' }}>
          <span>Password</span>
          <input name="password" type="password" required placeholder="••••••••" style={inputStyle} />
        </label>
        <button className="btn primary" type="submit">Login</button>
        <p className="tiny">Need an account? <a href="/signup">Get Started</a></p>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  border:'1px solid #ccd2e5',
  borderRadius:6,
  padding:'0.65rem 0.75rem',
  fontSize:'.9rem'
};
