// Supabase Edge Function for sending password reset emails
// Uses Resend API (https://resend.com) - free tier available

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'AvtoMarket <noreply@vozilo.si>'
const COMPANY_NAME = 'AvtoMarket'
const COMPANY_EMAIL = 'info@vozilo.si'

interface ResetRequest {
  email: string
  name: string
  code: string
}

Deno.serve(async (req: Request) => {
  try {
    const { email, name, code }: ResetRequest = await req.json()

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email and code are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // If no RESEND_API_KEY, simulate email in console (for development)
    if (!RESEND_API_KEY) {
      console.log('📧 === PASSWORD RESET EMAIL (DEVELOPMENT MODE) ===')
      console.log('To:', email)
      console.log('Name:', name || 'Customer')
      console.log('Subject: Ponastavitev gesla - AvtoMarket')
      console.log('Code:', code)
      console.log('================================================')
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email logged to console (development mode)',
          code: code // Return code so frontend can work
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Real email sending via Resend
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6a00, #ff8c00); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; border: 2px solid #ff6a00; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ff6a00; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 15px; margin-top: 20px; font-size: 14px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔐 Ponastavitev gesla</h1>
          </div>
          <div class="content">
            <p>Pozdravljeni ${name || 'stranka'},</p>
            <p>Prejeli ste zahtevo za ponastavitev gesla za vaš račun na <strong>AvtoMarket</strong>.</p>
            
            <div class="code-box">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Vaša koda za ponastavitev:</p>
              <div class="code">${code}</div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Koda veljavna 15 minut</p>
            </div>
            
            <p>Vnesite to kodo na strani za ponastavitev gesla.</p>
            
            <div class="warning">
              ⚠️ <strong>Pomembno:</strong><br>
              • Koda je veljavna samo 15 minut<br>
              • Če niste zahtevali ponastavitev, ignorirajte to sporočilo<br>
              • Ne delite kode z nikomer
            </div>
          </div>
          <div class="footer">
            <p>${COMPANY_NAME} - Največja platforma za prodajo vozil v Sloveniji</p>
            <p>${COMPANY_EMAIL}</p>
          </div>
        </div>
      </body>
      </html>
    `

    const emailText = `
Pozdravljeni ${name || 'stranka'},

Prejeli ste zahtevo za ponastavitev gesla za vas racun na AvtoMarket.

Vasa koda za ponastavitev: ${code}

Koda je veljavna 15 minut.

Ce niste zahtevali ponastavitev, ignorirajte to sporocilo.

${COMPANY_NAME}
${COMPANY_EMAIL}
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: `Ponastavitev gesla - ${COMPANY_NAME}`,
        html: emailHtml,
        text: emailText,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Resend API error:', result)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: result }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: result.id 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
