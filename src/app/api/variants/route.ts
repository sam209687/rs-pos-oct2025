// src/app/api/variants/route.ts
import { NextResponse } from 'next/server';
import { getVariants, createVariant, VariantData } from '@/actions/variant.actions'; // Ensure VariantData is imported

// GET all variants
export async function GET() {
  const result = await getVariants();
  if (result.success) {
    return NextResponse.json(result.data, { status: 200 });
  } else {
    return NextResponse.json({ message: result.message }, { status: 500 });
  }
}

// POST a new variant
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // ✅ FIX: Extract ALL fields required by VariantData interface
    const data: VariantData = {
      product: formData.get('product') as string,
      variantVolume: Number(formData.get('variantVolume')),
      unit: formData.get('unit') as string,
      unitConsumed: Number(formData.get('unitConsumed')), // ADDED
      unitConsumedUnit: formData.get('unitConsumedUnit') as string, // ADDED
      variantColor: formData.get('variantColor') as string,
      price: Number(formData.get('price')),
      mrp: Number(formData.get('mrp')),
      discount: Number(formData.get('discount')), // ADDED
      stockQuantity: Number(formData.get('stockQuantity')), // ADDED
      stockAlertQuantity: Number(formData.get('stockAlertQuantity')), // ADDED
      image: formData.get('image') as string,
      qrCode: formData.get('qrCode') as string, // ADDED
      packingCharges: Number(formData.get('packingCharges')), // ADDED
      laborCharges: Number(formData.get('laborCharges')), // ADDED
      electricityCharges: Number(formData.get('electricityCharges')), // ADDED
      others1: Number(formData.get('others1')), // ADDED
      others2: Number(formData.get('others2')), // ADDED
    };
    
    const result = await createVariant(data);
    if (result.success) {
      return NextResponse.json(result.data, { status: 201 });
    } else {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'An unknown error occurred.' }, { status: 500 });
  }
}