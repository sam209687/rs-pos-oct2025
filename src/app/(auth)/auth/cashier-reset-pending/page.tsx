import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CashierResetPendingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold">Password Reset Request Sent</h1>
        <p className="text-gray-600">
          Your password reset request has been sent to the administrator.
          Please wait for your admin to initiate the password reset process and send you an OTP.
        </p>
        <p className="text-gray-500 text-sm">
          You will receive an email with the OTP once the admin approves your request.
        </p>
        <div className="mt-6">
          <Link href="/auth">
            <Button>Back to Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}