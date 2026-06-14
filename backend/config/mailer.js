const sendOTPEmail = async (email, name, otp, purpose) => {
  // If credentials are not set, we log the OTP to the console for testing
  if (!process.env.BREVO_USER || !process.env.BREVO_SMTP_KEY) {
    console.log('\n=================================================');
    console.log(`[TESTING MODE] Brevo credentials not set.`);
    console.log(`Email to: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Purpose: ${purpose}`);
    console.log('=================================================\n');
    return true;
  }

  const subject = purpose === 'signup' 
    ? 'Verify your registration - AcadTrack OTP' 
    : purpose === 'resetPassword'
    ? 'Reset your password - AcadTrack OTP'
    : 'Verify your login - AcadTrack OTP';

  const purposeLabel = purpose === 'signup' ? 'account registration'
    : purpose === 'resetPassword' ? 'password reset'
    : 'login';

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #4f46e5; text-align: center; margin-bottom: 24px;">AcadTrack Verification Code</h2>
      <p style="font-size: 16px; color: #334155; line-height: 1.5;">Hello ${name || 'User'},</p>
      <p style="font-size: 16px; color: #334155; line-height: 1.5;">You are requested to verify your action on AcadTrack. Please use the following 6-digit One-Time Password (OTP) to complete your ${purposeLabel}:</p>
      <div style="text-align: center; margin: 32px 0;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; background-color: #f5f3ff; padding: 12px 24px; border-radius: 8px; border: 1px solid #ddd6fe; display: inline-block;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #64748b; line-height: 1.5;">This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">AcadTrack Student Academic Journey Tracker</p>
    </div>
  `;

  try {
    // Switch to Brevo's HTTPS REST API to bypass ISP blocks on SMTP ports
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_SMTP_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || 'AcadTrack',
          email: process.env.BREVO_SENDER_EMAIL || process.env.BREVO_USER,
        },
        to: [
          {
            email: email,
            name: name || 'User',
          },
        ],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Brevo REST API returned an error:', data);
      throw new Error(data.message || 'Error from email provider REST endpoint');
    }

    console.log(`Email sent successfully via Brevo REST API. Message ID: ${data.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email via Brevo REST API:', error);
    throw new Error('Failed to send verification email. Please try again.');
  }
};

export default sendOTPEmail;
