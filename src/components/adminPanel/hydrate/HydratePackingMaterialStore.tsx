// src/components/adminPanel/hydrate/HydratePackingMaterialStore.tsx
"use client";

// ✅ FIX 1: Import the explicit state interface
import { 
    usePackingMaterialStore, 
    PackingMaterialWithBalance,
    PackingMaterialState 
} from "@/store/packingMaterial.store"; 
import { useEffect, useRef } from "react";

interface HydratePackingMaterialStoreProps {
  initialMaterials: PackingMaterialWithBalance[];
}

export function HydratePackingMaterialStore({ initialMaterials }: HydratePackingMaterialStoreProps) {
  const initialized = useRef(false);
  
  // ✅ FIX 2: Use the imported state interface to correctly type the selector argument.
  const setMaterials = usePackingMaterialStore((state: PackingMaterialState) => state.setMaterials);

  useEffect(() => {
    if (!initialized.current) {
      setMaterials(initialMaterials);
      initialized.current = true;
    }
  }, [initialMaterials, setMaterials]);

  return null;
}