// src/app/(auth)/auth/forgot-password/page.tsx
import { ForgotPasswordForm } from "../_components/ForgotPasswordForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-[380px] sm:w-[450px]"> {/* Consistent width with login form */}
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset OTP.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Render the ForgotPasswordForm component here */}
          <ForgotPasswordForm />
        </CardContent>
      </Card>
     </div>
  );
}
