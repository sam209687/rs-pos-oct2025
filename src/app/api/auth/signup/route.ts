// src/app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";

import { getUserModel } from "@/lib/models/user";

import { z } from "zod";

import bcrypt from "bcryptjs";

import { sendOTP } from "@/lib/email";

import { generateNumericOTP } from "@/lib/otp";



const SignupFormSchema = z.object({

name: z.string().min(2, { message: "Name is required." }),

email: z.string().email({ message: "Invalid email address." }),

});



export async function POST(req: NextRequest) {

try {

await connectToDatabase();

const User = getUserModel();

const body = await req.json();



const validatedData = SignupFormSchema.safeParse(body);



if (!validatedData.success) {

return NextResponse.json(

{ message: "Invalid form data.", errors: validatedData.error.flatten().fieldErrors },

{ status: 400 }

);

}



const { name, email } = validatedData.data;



// ✅ FIX: Check if an admin account already exists

const existingAdmin = await User.findOne({ role: 'admin' });

if (existingAdmin) {

return NextResponse.json(

{ message: "An admin account already exists. Please contact the existing admin to proceed." },

{ status: 409 }

);

}



// Check if user with this email already exists

const existingUser = await User.findOne({ email });

if (existingUser) {

return NextResponse.json(

{ message: "An account with this email already exists." },

{ status: 409 }

);

}


const newUser = new User({

name,

email,

role: 'admin',

isAdminInitialSetupComplete: false,

status: 'active'

});


// ✅ NEW LOGIC: Generate OTP and expiration

const otp = generateNumericOTP();

const otpExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes



newUser.passwordResetToken = otp;

newUser.passwordResetExpires = otpExpires;

newUser.isPasswordResetRequested = true;



await newUser.save();


console.log(`New admin account created: ${newUser.email}. Sending OTP for verification.`);



await sendOTP(email, otp, "Admin Account Verification");



return NextResponse.json(

{

message: "OTP sent to your email. Please verify your account.",

email: email,

},

{ status: 201 }

);

} catch (error: any) {

console.error("Signup API error:", error);

return NextResponse.json(

{ message: error.message || "Internal server error." },

{ status: 500 }

);

}

}