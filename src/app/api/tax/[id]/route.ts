import { NextResponse } from 'next/server';
import Tax from '@/lib/models/tax';
import { connectToDatabase } from '@/lib/db';

// GET a single tax by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const tax = await Tax.findById(params.id);

    if (!tax) {
      return NextResponse.json({ message: 'Tax not found' }, { status: 404 });
    }

    return NextResponse.json(tax);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching tax' }, { status: 500 });
  }
}

// PUT (update) a tax by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const hsn = formData.get('hsn') as string;
    const gst = formData.get('gst') as string;

    const tax = await Tax.findById(params.id);
    if (!tax) {
      return NextResponse.json({ message: 'Tax not found' }, { status: 404 });
    }

    tax.name = name;
    tax.hsn = hsn;
    tax.gst = parseFloat(gst);
    await tax.save();

    return NextResponse.json(tax);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating tax' }, { status: 500 });
  }
}

// DELETE a tax by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const tax = await Tax.findByIdAndDelete(params.id);
    
    if (!tax) {
      return NextResponse.json({ message: 'Tax not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Tax deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting tax' }, { status: 500 });
  }
}