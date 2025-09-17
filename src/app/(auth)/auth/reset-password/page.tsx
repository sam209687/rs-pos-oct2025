// src/app/(auth)/auth/reset-password/page.tsx
// import { ResetPasswordForm } from "../_components/ResetPasswordForm";
import { Suspense } from "react"; // Required for useSearchParams
import { ResetPasswordForm } from "../_components/ResetPasswordForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-[380px] sm:w-[450px]"> {/* Consistent width with login/forgot forms */}
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Password Reset</CardTitle>
          <CardDescription>
            Enter your OTP and new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
         <Suspense fallback={<div>Loading...</div>}>
           <ResetPasswordForm />
         </Suspense>
      
        </CardContent>
      </Card>
     </div>
  );
}