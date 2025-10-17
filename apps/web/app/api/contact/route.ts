import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const TO_EMAIL = 'info@northpathstrategies.org'
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@mapmycurriculum.com'

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  institution: string
  role: string
  institutionType: string
  interest: string
  message: string
  timestamp: string
}

/**
 * POST /api/contact
 * Handles contact form submissions from the marketing landing page
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const data: ContactFormData = await request.json()

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'institution', 'role', 'institutionType', 'interest', 'message']
    const missingFields = requiredFields.filter(field => !data[field as keyof ContactFormData])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Check if SendGrid is configured
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured')
      
      // Log the submission for manual follow-up
      console.log('Contact form submission (SendGrid not configured):', {
        ...data,
        source: 'marketing-landing-page'
      })
      
      return NextResponse.json(
        { error: 'Email service not configured. Please contact info@northpathstrategies.org directly.' },
        { status: 503, headers: corsHeaders }
      )
    }

    // Prepare email content
    const emailSubject = `New Contact Form Submission - ${data.interest}`
    const emailText = `
New Contact Form Submission
============================

Contact Information:
-------------------
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}

Institution Details:
-------------------
Institution: ${data.institution}
Role: ${data.role}
Type: ${data.institutionType}

Inquiry:
--------
Interest: ${data.interest}

Message:
--------
${data.message}

---
Submitted: ${new Date(data.timestamp).toLocaleString()}
Source: Marketing Landing Page (coming-soon.html)
    `.trim()

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
    .section { margin-bottom: 20px; }
    .section h3 { color: #667eea; margin-bottom: 10px; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
    .field { margin-bottom: 10px; }
    .field strong { display: inline-block; width: 150px; color: #555; }
    .message-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin-top: 10px; }
    .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
    .cta { background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🎯 New Contact Form Submission</h2>
      <p style="margin: 0; opacity: 0.9;">Map My Curriculum Marketing Site</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h3>👤 Contact Information</h3>
        <div class="field"><strong>Name:</strong> ${data.firstName} ${data.lastName}</div>
        <div class="field"><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></div>
        <div class="field"><strong>Phone:</strong> ${data.phone || 'Not provided'}</div>
      </div>
      
      <div class="section">
        <h3>🏫 Institution Details</h3>
        <div class="field"><strong>Institution:</strong> ${data.institution}</div>
        <div class="field"><strong>Role:</strong> ${data.role}</div>
        <div class="field"><strong>Type:</strong> ${data.institutionType}</div>
      </div>
      
      <div class="section">
        <h3>💡 Inquiry</h3>
        <div class="field"><strong>Interest:</strong> ${data.interest}</div>
      </div>
      
      <div class="section">
        <h3>💬 Message</h3>
        <div class="message-box">
          ${data.message.replace(/\n/g, '<br>')}
        </div>
      </div>
      
      <div class="section" style="text-align: center;">
        <a href="mailto:${data.email}?subject=Re: Map My Curriculum Inquiry" class="cta">Reply to ${data.firstName}</a>
      </div>
    </div>
    
    <div class="footer">
      <p>Submitted on ${new Date(data.timestamp).toLocaleString()}</p>
      <p>Source: Marketing Landing Page</p>
    </div>
  </div>
</body>
</html>
    `.trim()

    // Send email via SendGrid
    const msg = {
      to: TO_EMAIL,
      from: FROM_EMAIL,
      replyTo: data.email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    }

    await sgMail.send(msg)

    // Also send confirmation email to submitter
    const confirmationMsg = {
      to: data.email,
      from: FROM_EMAIL,
      subject: 'Thank you for contacting Map My Curriculum',
      text: `
Hi ${data.firstName},

Thank you for reaching out about Map My Curriculum!

I've received your inquiry regarding "${data.interest}" and will get back to you within 24 hours.

In the meantime, feel free to learn more about our solutions at https://mapmycurriculum.com or visit North Path Strategies at https://northpathstrategies.org.

Best regards,
Jeremy Estrella
North Path Strategies
info@northpathstrategies.org
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
    .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
    .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Map My Curriculum</div>
      <p style="margin: 0;">Thank you for reaching out!</p>
    </div>
    
    <div class="content">
      <p>Hi ${data.firstName},</p>
      
      <p>Thank you for your interest in Map My Curriculum!</p>
      
      <p>I've received your inquiry regarding <strong>"${data.interest}"</strong> and will get back to you within 24 hours.</p>
      
      <p>In the meantime, feel free to learn more about our solutions at <a href="https://mapmycurriculum.com">mapmycurriculum.com</a> or visit <a href="https://northpathstrategies.org">North Path Strategies</a>.</p>
      
      <p>Best regards,<br>
      <strong>Jeremy Estrella</strong><br>
      North Path Strategies<br>
      <a href="mailto:info@northpathstrategies.org">info@northpathstrategies.org</a></p>
    </div>
    
    <div class="footer">
      <p>&copy; 2025 Map My Curriculum. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    }

    await sgMail.send(confirmationMsg)

    // Log success
    console.log('Contact form submission processed:', {
      email: data.email,
      institution: data.institution,
      interest: data.interest,
      timestamp: data.timestamp,
    })

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message. We\'ll be in touch soon!',
    }, { headers: corsHeaders })

  } catch (error: any) {
    console.error('Error processing contact form:', error)

    // Check if it's a SendGrid error
    if (error.response) {
      console.error('SendGrid error:', error.response.body)
    }

    return NextResponse.json(
      {
        error: 'Failed to send message. Please try again or email info@northpathstrategies.org directly.',
        details: error.message,
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

/**
 * OPTIONS /api/contact
 * Handle preflight CORS requests
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

/**
 * GET /api/contact
 * Health check endpoint
 */
export async function GET() {
  const configured = !!SENDGRID_API_KEY
  
  return NextResponse.json({
    status: configured ? 'ready' : 'not_configured',
    service: 'contact-form',
    sendgrid: configured ? 'configured' : 'missing_api_key',
  }, { headers: corsHeaders })
}
