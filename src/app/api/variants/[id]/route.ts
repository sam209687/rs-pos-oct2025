// src/app/api/variants/[id]/route.ts
import { NextResponse } from 'next/server';
import { getVariantById, updateVariant, deleteVariant, VariantData } from '@/actions/variant.actions'; // Ensure VariantData is imported

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