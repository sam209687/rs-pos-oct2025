import { CashierCreationForm } from "../_components/CashierCreationForm";

export default function CreateCashierPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Cashier Account</h1>
      <div className="max-w-md">
        <CashierCreationForm />
      </div>
    </div>
  );
}