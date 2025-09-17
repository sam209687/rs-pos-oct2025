import { NextResponse } from 'next/server';
import Category from '@/lib/models/category';
import { connectToDatabase } from '@/lib/db';

// GET a single category by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const category = await Category.findById(params.id);

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching category' }, { status: 500 });
  }
}

// PUT (update) a category by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const formData = await request.formData();
    const name = formData.get('name') as string;

    const category = await Category.findById(params.id);
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    category.name = name;
    await category.save();

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating category' }, { status: 500 });
  }
}

// DELETE a category by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const category = await Category.findByIdAndDelete(params.id);
    
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting category' }, { status: 500 });
  }
}