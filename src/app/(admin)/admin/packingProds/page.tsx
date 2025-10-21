// src/app/(admin)/admin/packingProds/page.tsx
import { getPackingMaterials, PackingMaterialWithBalance } from "@/actions/packingMaterial.actions";
import { HydratePackingMaterialStore } from "@/components/adminPanel/hydrate/HydratePackingMaterialStore";
import { PackingItemsTable } from "@/components/tables/packingItemsTable";
// 💡 FIX 8: Corrected import path
// import { HydratePackingMaterialStore } from "@/components/hydrate/HydratePackingMaterialStore"; 

export const metadata = {
  title: "Packing Materials | Admin",
};

export default async function PackingProdsPage() {
  const result = await getPackingMaterials();
  const initialMaterials: PackingMaterialWithBalance[] = result.success ? result.data || [] : [];

  return (
    <>
      <HydratePackingMaterialStore initialMaterials={initialMaterials} />
      <PackingItemsTable initialMaterials={initialMaterials} />
    </>
  );
}