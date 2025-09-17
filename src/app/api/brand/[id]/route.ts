import { NextResponse } from "next/server";
import Brand from "@/lib/models/brand";
import { deleteImage, uploadImage } from "@/lib/imageUpload";
import { connectToDatabase } from "@/lib/db";

// GET a single brand by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    // Use findById since you're passing an ID
    const brand = await Brand.findById(params.id);

    if (!brand) {
      return NextResponse.json({ message: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching brand" },
      { status: 500 }
    );
  }
}

// PUT (update) a brand by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const file = formData.get("image") as File | null;

    // Use findById
    const brand = await Brand.findById(params.id);
    if (!brand) {
      return NextResponse.json({ message: "Brand not found" }, { status: 404 });
    }

    // Handle image update
    let imageUrl = brand.imageUrl;
    if (file && file.size > 0) {
      await deleteImage(brand.imageUrl);
      imageUrl = await uploadImage(file, "brand");
    }

    brand.name = name;
    brand.imageUrl = imageUrl;
    await brand.save();

    return NextResponse.json(brand);
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating brand" },
      { status: 500 }
    );
  }
}

// DELETE a brand by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    // Use findByIdAndDelete
    const brand = await Brand.findByIdAndDelete(params.id);

    if (!brand) {
      return NextResponse.json({ message: "Brand not found" }, { status: 404 });
    }

    await deleteImage(brand.imageUrl);

    return NextResponse.json({ message: "Brand deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting brand" },
      { status: 500 }
    );
  }
}
