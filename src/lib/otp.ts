export function generateNumericOTP(length: number = 6): string {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString(); // Append a random digit (0-9)
  }
  return otp;
}