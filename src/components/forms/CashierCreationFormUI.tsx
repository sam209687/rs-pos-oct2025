// src/components/forms/CashierCreationFormUI.tsx

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CashierCreationFormUIProps {
  cashierName: string; // This is the 'name' field
  personalEmail: string; // Renamed from email
  phone: string;
  aadhaar: string;
  storeLocation: string;
  onCashierNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPersonalEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Renamed
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAadhaarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStoreLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  errors: {
    cashierName?: string; // This is the 'name' field error
    personalEmail?: string; // Renamed from email
    phone?: string;
    aadhaar?: string;
    storeLocation?: string;
  };
}

export const CashierCreationFormUI: React.FC<CashierCreationFormUIProps> = ({
  cashierName,
  personalEmail, // Renamed
  phone,
  aadhaar,
  storeLocation,
  onCashierNameChange,
  onPersonalEmailChange, // Renamed
  onPhoneChange,
  onAadhaarChange,
  onStoreLocationChange,
  onSubmit,
  isLoading,
  errors,
}) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div>
        <Label htmlFor="cashierName">Cashier Name</Label>
        <Input id="cashierName" value={cashierName} onChange={onCashierNameChange} disabled={isLoading} />
        {errors.cashierName && <p className="text-red-500 text-sm mt-1">{errors.cashierName}</p>}
      </div>
      <div>
        <Label htmlFor="personalEmail">Personal Email</Label> {/* Label changed */}
        <Input id="personalEmail" type="email" value={personalEmail} onChange={onPersonalEmailChange} disabled={isLoading} />
        {errors.personalEmail && <p className="text-red-500 text-sm mt-1">{errors.personalEmail}</p>}
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" type="tel" value={phone} onChange={onPhoneChange} disabled={isLoading} />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>
      <div>
        <Label htmlFor="aadhaar">Aadhaar (12 digits)</Label>
        <Input id="aadhaar" type="text" value={aadhaar} onChange={onAadhaarChange} disabled={isLoading} />
        {errors.aadhaar && <p className="text-red-500 text-sm mt-1">{errors.aadhaar}</p>}
      </div>
      <div>
        <Label htmlFor="storeLocation">Store Location</Label>
        <Input id="storeLocation" value={storeLocation} onChange={onStoreLocationChange} disabled={isLoading} />
        {errors.storeLocation && <p className="text-red-500 text-sm mt-1">{errors.storeLocation}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Cashier"}
      </Button>
    </form>
  );
};