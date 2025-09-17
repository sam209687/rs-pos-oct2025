import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Store from '@/lib/models/store';
// import { storeSchema } from '@/lib/schemas';
import { rm } from 'fs/promises';
import { join } from 'path';
import { uploadFile } from '@/lib/uploadHelper';
import QRCode from 'qrcode';
import { StoreSchema } from '@/lib/schemas';

const generateAndSaveQRCode = async (url: string, prefix: string): Promise<string | undefined> => {
    if (!url) return undefined;
    const filename = `${Date.now()}-${prefix}-qrcode.png`;
    const uploadsDir = join(process.cwd(), 'public/uploads');
    const path = join(uploadsDir, filename);

    const fs = require('fs');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    await QRCode.toFile(path, url);
    return `/uploads/${filename}`;
};

export async function GET(req: Request, { params }: { params: { id: string } }) {
    // This function is correct and remains unchanged
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const formData = await req.formData();
    
    const storeData = {
      storeName: formData.get('storeName'),
      address: formData.get('address'),
      city: formData.get('city'),
      pincode: formData.get('pincode'),
      state: formData.get('state'),
      contactNumber: formData.get('contactNumber'),
      email: formData.get('email'),
      fssai: formData.get('fssai'),
      pan: formData.get('pan'),
      gst: formData.get('gst'),
      mediaUrl: formData.get('mediaUrl'),
      status: formData.get('status'),
    };

    const logoFile = formData.get('logo') as File | null;
    const oldLogoPath = formData.get('oldLogoPath') as string | undefined;
    const qrCodeFile = formData.get('qrCode') as File | null;
    const oldQrCodePath = formData.get('oldQrCodePath') as string | undefined;
    const oldMediaQRCodePath = formData.get('oldMediaQRCodePath') as string | undefined;

    const validation = StoreSchema.safeParse(storeData);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: 'Invalid form data.'}, { status: 400 });
    }

    let logoPath = oldLogoPath;
    if (logoFile) {
        if (oldLogoPath) await rm(join(process.cwd(), 'public', oldLogoPath), { force: true }).catch(err => console.error(err));
        logoPath = await uploadFile(logoFile, 'logo');
    }
    
    let qrCodePath = oldQrCodePath;
    if (qrCodeFile) {
        if (oldQrCodePath) await rm(join(process.cwd(), 'public', oldQrCodePath), { force: true }).catch(err => console.error(err));
        qrCodePath = await uploadFile(qrCodeFile, 'qr');
    }

    let mediaQRCodePath = oldMediaQRCodePath;
    const newMediaUrl = validation.data.mediaUrl;
    
    if (newMediaUrl) {
      if (oldMediaQRCodePath) await rm(join(process.cwd(), 'public', oldMediaQRCodePath), { force: true }).catch(err => console.error(err));
      mediaQRCodePath = await generateAndSaveQRCode(newMediaUrl, 'media');
    } 
    else if (oldMediaQRCodePath) {
      await rm(join(process.cwd(), 'public', oldMediaQRCodePath), { force: true }).catch(err => console.error(err));
      mediaQRCodePath = undefined;
    }
    
    const updatedStore = await Store.findByIdAndUpdate(
      params.id,
      { ...validation.data, logo: logoPath, qrCode: qrCodePath, mediaQRCode: mediaQRCodePath },
      { new: true }
    );

    if (!updatedStore) {
      return NextResponse.json({ success: false, message: 'Store not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Store updated successfully!', data: updatedStore });
  } catch (error) {
    console.error("Failed to update store:", error);
    return NextResponse.json({ success: false, message: 'Failed to update store.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    const deletedStore = await Store.findByIdAndDelete(params.id);

    if (!deletedStore) {
      return NextResponse.json({ success: false, message: 'Store not found.' }, { status: 404 });
    }

    // Delete all associated files
    const filesToDelete = [deletedStore.logo, deletedStore.qrCode, deletedStore.mediaQRCode];
    for (const filePath of filesToDelete) {
        if (filePath) {
            await rm(join(process.cwd(), 'public', filePath), { force: true }).catch(err => console.error(`Failed to delete file: ${filePath}`, err));
        }
    }

    return NextResponse.json({ success: true, message: 'Store deleted successfully!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete store.' }, { status: 500 });
  }
}