// src/lib/models/user.ts
import mongoose, { Schema, Model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  personalEmail?: string;
  email: string;
  password?: string;
  role: 'admin' | 'cashier';
  isAdminInitialSetupComplete?: boolean;
  passwordResetToken?: String;
  passwordResetExpires?: Date;
  isPasswordResetRequested?: Boolean;

  // --- Cashier Specific Fields ---
  name?: string;
  aadhaar?: string;
  phone?: string;
  storeLocation?: string;
  status?: 'active' | 'inactive';
  
  // ✅ FIX: Add timestamps to the interface
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    personalEmail: {
      type: String,
      required: function(this: IUser) { return this.role === 'cashier'; },
      unique: false,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return (this.role === 'admin' && this.isAdminInitialSetupComplete === true) || this.role === 'cashier';
      },
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['admin', 'cashier'],
      required: true,
    },
    isAdminInitialSetupComplete: {
      type: Boolean,
      default: false,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    isPasswordResetRequested: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: function(this: IUser) { return this.role === 'cashier'; }
    },
    aadhaar: {
      type: String,
      required: function(this: IUser) { return this.role === 'cashier'; },
      unique: true,
      length: 12,
      sparse: true,
    },
    phone: {
      type: String,
      required: function(this: IUser) { return this.role === 'cashier'; },
      minlength: 10,
    },
    storeLocation: {
      type: String,
      required: function(this: IUser) { return this.role === 'cashier'; }
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// --- MODIFIED pre('save') HOOK ---
userSchema.pre('save', async function (next) {
  const user = this as IUser;

  // Only hash if the password field was modified and is a string
  if (user.isModified('password') && typeof user.password === 'string') {
    try {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      return next(); // Use return next() for asynchronous hooks
    } catch (error: any) {
      return next(error);
    }
  }

  next();
});
// --- END MODIFIED pre('save') HOOK ---

userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export function getUserModel(): Model<IUser> {
  return (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);
}