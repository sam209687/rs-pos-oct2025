// src/components/pos/LiveCart.tsx
"use client";

import { usePosStore } from "@/store/posStore";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function LiveCart() {
  // ✅ UPDATED: Get isGstEnabled from the store
  const { cart, updateCartQuantity, removeFromCart, isGstEnabled } = usePosStore();

  return (
    <div className="flex flex-col h-[330px] w-full bg-gray-900 rounded-lg p-4 overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
        <table className="w-full text-sm text-gray-300">
          <thead className="sticky top-0 bg-gray-900 z-10">
            <tr className="border-b border-gray-700 py-3">
              <th className="py-2 px-1 w-[15%] text-center">Product</th>
              <th className="py-2 px-1 w-[12%] text-center">Price</th>
              <th className="py-2 px-1 w-[12%] text-center">MRP</th>
              <th className="py-2 px-1 w-[10%] text-center">Disc. %</th>
              {/* ✅ NEW: Conditionally render GST header */}
              {isGstEnabled && <th className="py-2 px-1 w-[10%] text-center">GST</th>}
              <th className="py-2 px-1 w-[15%] text-center">Quantity</th>
              <th className="py-2 px-1 w-[12%] text-center">Total</th>
              <th className="py-2 px-1 w-[10%] text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.length > 0 ? (
              cart.map(item => {
                let discountPercentage = 0;
                if (item.mrp && item.price && item.mrp > item.price) {
                  discountPercentage = ((item.mrp - item.price) / item.mrp) * 100;
                }
                
                // ✅ NEW: Calculate GST for the line item
                const itemGst = isGstEnabled ? ((item.price * item.quantity) * (item.product.tax?.gst ?? 0)) / 100 : 0;

                return (
                  <motion.tr
                    key={item._id}
                    className="border-b border-gray-800"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.15 }}
                  >
                    <td className="py-2 px-1 text-center">
                      <div className="font-medium text-gray-100">{item.product.productName}</div>
                      {item.type === 'variant' && (
                          <div className="text-xs text-gray-400">{item.product.productCode}</div>
                      )}
                    </td>
                    <td className="py-2 px-0 text-right font-bold text-gray-100">₹ {item.price.toFixed(2)}</td>
                    <td className="py-2 px-1 text-right text-gray-400">
                      {item.mrp ? `₹ ${item.mrp.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="py-2 px-1 text-center text-green-400">
                      {discountPercentage > 0 ? `${discountPercentage.toFixed(1)}%` : '0%'}
                    </td>
                    
                    {/* ✅ NEW: Conditionally render GST data cell */}
                    {isGstEnabled && (
                        <td className="py-2 px-1 text-right text-green-400">
                            {itemGst > 0 ? `₹ ${itemGst.toFixed(2)}` : 'N/A'}
                        </td>
                    )}

                    <td className="py-2 px-1 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 w-6 text-white" 
                          onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                          disabled={item.type === 'oec'}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 w-6 text-white" 
                          onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                          disabled={item.type === 'oec'}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-2 px-1 text-right font-bold text-gray-100">₹ {(item.price * item.quantity).toFixed(2)}</td>
                    <td className="py-2 px-1 text-center">
                      <Button size="sm" variant="destructive" className="h-6 px-2 text-xs" onClick={() => removeFromCart(item._id)}>
                        Remove
                      </Button>
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                {/* ✅ UPDATED: Adjust colSpan for the new conditional column */}
                <td colSpan={isGstEnabled ? 8 : 7} className="py-8 text-center text-gray-400">Your cart is empty. Add products to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}