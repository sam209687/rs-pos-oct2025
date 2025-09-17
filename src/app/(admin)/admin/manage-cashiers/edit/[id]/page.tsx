// // src/app/(admin)/admin/manage-cashiers/edit/[id]/page.tsx
// import React from 'react';
// import {EditCashierForm }from '@/components/admin/EditCashierForm';
// import PageHeader from '@/components/admin/PageHeader';

// interface EditCashierPageProps {
//   params: {
//     id: string;
//   };
// }

// export async function EditCashierPage({ params }: EditCashierPageProps) {
//   // Correct way to access dynamic params in a Server Component
//   const { id } = await params; // Destructure it directly

//   // You can then use 'id' as 'cashierId'
//   const cashierId = id;

//   return (
//     <>
//       <PageHeader title="Edit Cashier" />
//       <EditCashierForm cashierId={cashierId} />
//     </>
//   );
// }

// src/app/(admin)/admin/manage-cashiers/edit/[id]/page.tsx
import React from 'react';
// import EditCashierForm from '@/components/admin/EditCashierForm'; // <--- UNCOMMENT THIS
import PageHeader from '@/components/admin/PageHeader';
import { EditCashierForm } from '@/components/admin/EditCashierForm';

interface EditCashierPageProps {
  params: {
    id: string;
  };
}

export default function EditCashierPage({ params }: EditCashierPageProps) {
  const { id } = params;

  return (
    <> {/* You can revert to Fragment <> if you prefer */}
      <PageHeader title="Edit Cashier" />
      {/* Remove the temporary H1 if the PageHeader renders correctly */}
      {/* <h1>Temporary Page - Editing Cashier ID: {id}</h1> */}
      <EditCashierForm cashierId={id} /> {/* <--- ADD THIS BACK */}
    </>
  );
}