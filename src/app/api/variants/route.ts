// src/app/api/variants/route.ts
import { NextResponse } from 'next/server';
import { getVariants, createVariant } from '@/actions/variant.actions';

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
    // ✅ CORRECTED: Manually extract fields from FormData to match VariantData
    const data = {
      product: formData.get('product') as string,
      variantVolume: Number(formData.get('variantVolume')),
      unit: formData.get('unit') as string,
      variantColor: formData.get('variantColor') as string,
      price: Number(formData.get('price')),
      mrp: Number(formData.get('mrp')),
      image: formData.get('image') as string,
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