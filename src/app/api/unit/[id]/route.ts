import { NextResponse } from 'next/server';
import Unit from '@/lib/models/unit';
import { connectToDatabase } from '@/lib/db';

// GET a single unit by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const unit = await Unit.findById(params.id);

    if (!unit) {
      return NextResponse.json({ message: 'Unit not found' }, { status: 404 });
    }

    return NextResponse.json(unit);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching unit' }, { status: 500 });
  }
}

// PUT (update) a unit by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const formData = await request.formData();
    const name = formData.get('name') as string;

    const unit = await Unit.findById(params.id);
    if (!unit) {
      return NextResponse.json({ message: 'Unit not found' }, { status: 404 });
    }

    unit.name = name;
    await unit.save();

    return NextResponse.json(unit);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating unit' }, { status: 500 });
  }
}

// DELETE a unit by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const unit = await Unit.findByIdAndDelete(params.id);
    
    if (!unit) {
      return NextResponse.json({ message: 'Unit not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting unit' }, { status: 500 });
  }
}