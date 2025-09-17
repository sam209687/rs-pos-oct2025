// src/app/api/variants/[id]/route.ts
import { NextResponse } from 'next/server';
import { getVariantById, updateVariant, deleteVariant } from '@/actions/variant.actions';

// Define params type
interface Params {
  params: {
    id: string;
  };
}

// GET a single variant by ID
export async function GET(request: Request, { params }: Params) {
  const { id } = params;
  const result = await getVariantById(id);
  if (result.success) {
    return NextResponse.json(result.data, { status: 200 });
  } else {
    return NextResponse.json({ message: result.message }, { status: 404 });
  }
}

// PUT (update) a variant by ID
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = params;
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
    
    const result = await updateVariant(id, data);
    if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 200 });
    } else {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'An unknown error occurred.' }, { status: 500 });
  }
}

// DELETE a variant by ID
export async function DELETE(request: Request, { params }: Params) {
  const { id } = params;
  const result = await deleteVariant(id);
  if (result.success) {
    return NextResponse.json({ message: result.message }, { status: 200 });
  } else {
    return NextResponse.json({ message: result.message }, { status: 404 });
  }
}