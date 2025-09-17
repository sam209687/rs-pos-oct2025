// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTP(toEmail: string, otp: string, subject: string = "Your OTP") {
  try {
    // Log the API key to confirm it's loaded (for debugging only, remove in production)
    console.log('Using RESEND_API_KEY:', process.env.RESEND_API_KEY ? '******' + process.env.RESEND_API_KEY.slice(-4) : 'NOT SET');
    console.log('Attempting to send OTP email to:', toEmail, 'with OTP:', otp);

    const { data, error } = await resend.emails.send({
      from: 'POS System <onboarding@resend.dev>', // REMINDER: Replace with your VERIFIED Resend domain email
      to: toEmail,
      subject: subject,
      html: `
        <p>Your One-Time Password (OTP) is: <strong>${otp}</strong></p><p>This OTP is valid for 30 minutes (or as specified).</p>
      `,
    });

    if (error) {
      console.error("Error sending OTP email:", error);
      
      console.error("Resend specific error details:");
      console.error("Name:", error.name);
      console.error("Message:", error.message);

      // Cast to 'any' for direct property access, only for debugging.
      // In production, rely on documented properties or specific error types.
      const resendErrorAny = error as any; 
      if (resendErrorAny.statusCode) {
        console.error("Status Code:", resendErrorAny.statusCode);
      } else {
        console.warn("statusCode property not found on Resend error object directly.");
        // Log the entire error object for deeper inspection if statusCode is crucial
        // console.error("Full error object:", error);
      }
      
      // Re-throw the error message for consistent error handling in calling functions
      throw new Error(error.message || "Failed to send OTP email.");
    }
    console.log("OTP email sent successfully:", data);
    return data;
  } catch (error: any) { // Keep `any` for the catch block if you're not strictly typing all possible errors
    console.error("Unhandled error in sendOTP:", error.message || error);
    throw error;
  }
};