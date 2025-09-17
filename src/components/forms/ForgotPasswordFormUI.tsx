// src/components/forms/ForgotPasswordFormUI.tsx


interface ForgotPasswordFormUIProps {
  email: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  emailError?: string;
}

export const ForgotPasswordFormUI: React.FC<ForgotPasswordFormUIProps> = ({
  email,
  onEmailChange,
  onSubmit,
  isLoading,
  emailError,
}) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="space-y-3">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={onEmailChange}
          disabled={isLoading}
          aria-invalid={emailError ? "true" : "false"}
        />
        {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Reset Link / OTP"}
      </Button>
    </form>
  );
};

// src/components/forms/ResetPasswordFormUI.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ResetPasswordFormUIProps {
  otp: string;
  newPasswordTitle: string; // "Create Password" or "Reset Password"
  newPassword: string;
  confirmPassword: string;
  onOtpChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  otpError?: string;
  newPasswordError?: string;
  confirmPasswordError?: string;
}

export const ResetPasswordFormUI: React.FC<ResetPasswordFormUIProps> = ({
  otp,
  newPasswordTitle,
  newPassword,
  confirmPassword,
  onOtpChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  isLoading,
  otpError,
  newPasswordError,
  confirmPasswordError,
}) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="otp">OTP</Label>
        <Input
          id="otp"
          type="text"
          value={otp}
          onChange={onOtpChange}
          disabled={isLoading}
          aria-invalid={otpError ? "true" : "false"}
        />
        {otpError && <p className="text-red-500 text-sm mt-1">{otpError}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">{newPasswordTitle}</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={onNewPasswordChange}
          disabled={isLoading}
          aria-invalid={newPasswordError ? "true" : "false"}
        />
        {newPasswordError && <p className="text-red-500 text-sm mt-1">{newPasswordError}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          disabled={isLoading}
          aria-invalid={confirmPasswordError ? "true" : "false"}
        />
        {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Processing..." : "Reset Password"}
      </Button>
    </form>
  );
};