"use client";

import { useState, useEffect } from 'react';
import { usePrintStore } from '@/store/printStore';
// import { useStoreDetailsStore } from '@/store/storeDetailsStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import QRCode from 'qrcode';
import { useStoreDetailsStore } from '@/store/storeDetails.store';

export function PrintPreview() {
  const { isModalOpen, invoiceData, closeModal } = usePrintStore();
  const { activeStore, fetchActiveStore } = useStoreDetailsStore();
  
  const [paperSize, setPaperSize] = useState<'80mm' | '58mm'>('80mm');
  const [invoiceQrCode, setInvoiceQrCode] = useState<string | null>(null);

  // Fetch active store details when the modal opens
  useEffect(() => {
    if (isModalOpen) {
      fetchActiveStore();
    }
  }, [isModalOpen, fetchActiveStore]);

  // Generate the invoice QR code when invoiceData is available
  useEffect(() => {
    if (invoiceData) {
      const generateInvoiceQR = async () => {
        const qrText = `Invoice: ${invoiceData.invoiceNumber}, Total: ${invoiceData.totalPayable.toFixed(2)}, Date: ${new Date(invoiceData.createdAt).toLocaleDateString()}`;
        const url = await QRCode.toDataURL(qrText);
        setInvoiceQrCode(url);
      };
      generateInvoiceQR();
    }
  }, [invoiceData]);


  if (!invoiceData || !activeStore) return null;

  const handlePrint = () => {
    window.print();
  };

  const isGstEnabled = invoiceData.gstAmount > 0;

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Invoice Print Preview</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Print Controls */}
          <div className="print-hidden w-full md:w-48 flex flex-col gap-4">
            <h3 className="text-lg font-bold">Print Options</h3>
            <div>
              <label className="text-sm font-medium">Paper Size</label>
              <div className="flex gap-2 mt-2">
                <Button onClick={() => setPaperSize('80mm')} className={cn(paperSize === '80mm' ? 'bg-yellow-500 text-black' : 'bg-gray-700')}>80mm</Button>
                <Button onClick={() => setPaperSize('58mm')} className={cn(paperSize === '58mm' ? 'bg-yellow-500 text-black' : 'bg-gray-700')}>58mm</Button>
              </div>
            </div>
            <Separator className="bg-gray-700" />
            <Button onClick={handlePrint} className="bg-green-500 text-black font-bold">Print</Button>
          </div>

          {/* Invoice Preview */}
          <div className="flex-1 bg-white text-black p-2 rounded-md">
            <div id="invoice-content" className={cn("mx-auto font-mono text-[10px] leading-tight", paperSize === '80mm' ? 'w-[76mm]' : 'w-[54mm]')}>
              <div className="text-center">
                {activeStore.logo && (
                  <Image src={activeStore.logo} alt="Store Logo" width={80} height={80} className="mx-auto" />
                )}
                <h2 className="text-lg font-bold">{activeStore.storeName}</h2>
                <p>{activeStore.address}, {activeStore.city}, {activeStore.pincode}</p>
                <p>Phone: {activeStore.contactNumber}</p>
                <p>Email: {activeStore.email}</p>
                {activeStore.gst && <p>GSTIN: {activeStore.gst}</p>}
                <Separator className="my-1 bg-gray-400" />
                <p>Invoice #: {invoiceData.invoiceNumber}</p>
                <p>Date: {new Date(invoiceData.createdAt).toLocaleString()}</p>
              </div>

              <Separator className="my-1 bg-gray-400" />
              
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-left">Item{isGstEnabled && "/HSN"}</th>
                    <th className="text-center">Qty</th>
                    <th className="text-right">MRP</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr key={index} className="border-b border-dashed border-black">
                      <td className="text-left">
                        {item.name}
                        {isGstEnabled && item.hsn && <div className="text-[8px]">({item.hsn})</div>}
                      </td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">{item.mrp ? item.mrp.toFixed(2) : '-'}</td>
                      <td className="text-right">{item.price.toFixed(2)}</td>
                      <td className="text-right">{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Separator className="my-1 bg-gray-400 border-dashed" />

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{invoiceData.subtotal.toFixed(2)}</span>
                </div>
                {invoiceData.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-{invoiceData.discount.toFixed(2)}</span>
                  </div>
                )}
                {isGstEnabled && (
                  <div className="flex justify-between">
                    <span>GST:</span>
                    <span>+{invoiceData.gstAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-1 bg-gray-400" />
                <div className="flex justify-between font-bold text-base">
                  <span>TOTAL:</span>
                  <span>₹{invoiceData.totalPayable.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center mt-2">
                <p>Thank you for your business!</p>
              </div>

              {invoiceQrCode && (
                <div className="flex justify-center mt-2">
                  <Image src={invoiceQrCode} alt="Invoice QR Code" width={100} height={100} />
                </div>
              )}

              <div className="text-center mt-2 text-[8px] space-y-1">
                <p className="font-bold">Terms & Conditions:</p>
                <p>1. Goods once sold will not be taken back.</p>
                <p>2. All disputes subject to local jurisdiction.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}