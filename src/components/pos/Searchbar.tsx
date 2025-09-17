// src/app/(admin)/admin/pos/searchbar.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePosStore } from "@/store/posStore";

export function Searchbar() {
  const { products, searchQuery, setSearchQuery, isLoading, addToCart, fetchProducts } = usePosStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key === 's') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) {
        // Even with no search, filter out bad data
        return products.filter(p => p && p.product);
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    
    return products.filter(product => {
      // ✅ FIX 1: Add a guard clause to immediately skip items with null products.
      // This prevents the filter logic itself from crashing.
      if (!product || !product.product) {
        return false;
      }

      // Safely check for optional properties before calling methods
      const brandName = product.product.brand?.name?.toLowerCase() || '';
      const categoryName = product.product.category?.name?.toLowerCase() || '';
      const variantColor = product.variantColor?.toLowerCase() || '';

      return (
        product.product.productCode.toLowerCase().includes(lowercasedQuery) ||
        product.product.productName.toLowerCase().includes(lowercasedQuery) ||
        brandName.includes(lowercasedQuery) ||
        categoryName.includes(lowercasedQuery) ||
        variantColor.includes(lowercasedQuery) ||
        product.price.toString().includes(searchQuery)||
        product.variantVolume.toString().includes(searchQuery) ||
        product.unit.name.toLowerCase().includes(lowercasedQuery)||
        product.variantColor?.toString().includes(lowercasedQuery)
        
      );
    });
  }, [products, searchQuery]);


  return (
    <div className="flex flex-col h-full w-full bg-gray-900 rounded-lg p-4">
      <div className="mb-4">
        <Input
          ref={inputRef}
          placeholder="Search by product, code, brand, price..."
          className="h-10 bg-gray-800 border-none text-white focus:ring-2 focus:ring-yellow-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="text-center text-gray-400">Loading products...</div>
        ) : (
          <table className="w-full text-sm text-gray-300">
            <thead className="sticky top-0 bg-gray-900 z-10">
              <tr className="border-b border-gray-700 text-left">
                <th className="py-2 px-1">Product</th>
                <th className="py-2 px-1 text-right">Price</th>
                <th className="py-2 px-1 text-center">Qty</th>
                <th className="py-2 px-1 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* ✅ FIX 2: Removed the incorrect and unnecessary filter from here.
                  The logic is now correctly handled in `useMemo`. */}
              {filteredProducts.map((product) => (
                <tr key={product._id} className="border-b border-gray-800 hover:bg-gray-800 transition-colors duration-150">
                  <td className="py-2 px-1">
                    {/* This code is now safe because `filteredProducts` won't contain null products */}
                    <div className="font-medium text-gray-100">{product.product.productCode}</div>
                    <div className="text-xs text-gray-400">{product.product.productName}</div>
                    <div className="text-xs text-gray-400 font-semibold">{product.variantVolume} {product.unit.name}</div>

                    <div className="text-xs text-gray-400 font-semibold">{product.variantColor}</div>
                  </td>
                  <td className="py-2 px-1 text-right font-bold text-gray-100">₹ {product.price.toFixed(2)}</td>
                  <td className="py-2 px-1 text-center text-gray-400">{product.product.stockQuantity}</td>
                  <td className="py-2 px-1 text-center">
                    <Button
                      size="sm"
                      className="h-7 px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-xs"
                      onClick={() => addToCart(product)}
                    >
                      Add
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}