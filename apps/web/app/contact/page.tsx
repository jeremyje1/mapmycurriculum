"use client";
import React, { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    subject: 'general',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    
    try {
      // In production, this would send to your API
      // For now, we'll use mailto as a fallback
      const mailtoLink = `mailto:hello@mapmycurriculum.com?subject=${encodeURIComponent(
        `[${formData.subject}] Message from ${formData.name}`
      )}&body=${encodeURIComponent(
        `From: ${formData.name}\nEmail: ${formData.email}\nInstitution: ${formData.institution}\n\nMessage:\n${formData.message}`
      )}`;
      
      window.location.href = mailtoLink;
      setSent(true);
    } catch (err: any) {
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="container" style={{ paddingTop:'4rem', paddingBottom:'4rem', maxWidth: 600 }}>
      <h1>Contact Us</h1>
      <p>Have questions about Map My Curriculum? We'd love to hear from you.</p>
      
      {sent ? (
        <div style={{ 
          background: '#f0fdf4', 
          border: '1px solid #86efac', 
          borderRadius: 8, 
          padding: '1rem',
          marginTop: '2rem'
        }}>
          <p style={{ margin: 0, color: '#166534' }}>
            ✓ Your message has been sent. We'll get back to you within 24 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            <span>Your Name *</span>
            <input 
              required 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              style={inputStyle} 
            />
          </label>
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            <span>Email Address *</span>
            <input 
              required 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              style={inputStyle} 
            />
          </label>
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            <span>Institution</span>
            <input 
              type="text" 
              value={formData.institution}
              onChange={e => setFormData({ ...formData, institution: e.target.value })}
              placeholder="Your school or organization"
              style={inputStyle} 
            />
          </label>
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            <span>Subject *</span>
            <select 
              required
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
              style={inputStyle}
            >
              <option value="general">General Inquiry</option>
              <option value="demo">Request a Demo</option>
              <option value="pricing">Pricing Question</option>
              <option value="technical">Technical Support</option>
              <option value="enterprise">Enterprise Solutions</option>
            </select>
          </label>
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            <span>Message *</span>
            <textarea 
              required
              rows={6}
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us how we can help..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </label>
          
          {error && (
            <p style={{ color: '#dc2626', fontSize: '.875rem', margin: 0 }}>{error}</p>
          )}
          
          <button 
            type="submit" 
            className="btn primary" 
            disabled={sending}
            style={{ marginTop: '.5rem' }}
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
          
          <p className="tiny muted" style={{ marginTop: '.5rem' }}>
            Or email us directly at <a href="mailto:hello@mapmycurriculum.com">hello@mapmycurriculum.com</a>
          </p>
        </form>
      )}
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #ccd2e5',
  borderRadius: 6,
  padding: '0.65rem 0.75rem',
  fontSize: '.9rem'
};
