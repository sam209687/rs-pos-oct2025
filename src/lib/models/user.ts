// // src/lib/models/user.ts
// import mongoose, { Schema, Model, Document, Types } from 'mongoose';
// import bcrypt from 'bcryptjs';

// export interface IUser extends Document {
//   _id: Types.ObjectId;
//   personalEmail?: string; // This is the 'email' field from before, now for personal records
//   email: string; // This is the new 'email' field, which was 'username' before, for login
//   password?: string;
//   role: 'admin' | 'cashier';
//   isAdminInitialSetupComplete?: boolean;
//   passwordResetToken?: String,
//   passwordResetExpires?: Date,
//   isPasswordResetRequested?: Boolean,

//   // --- Cashier Specific Fields ---
//   name?: string;
//   aadhaar?: string;
//   phone?: string;
//   storeLocation?: string;
//   status?: 'active' | 'inactive';
// }

// const userSchema: Schema<IUser> = new Schema(
//   {
//     // Old 'email' field, now for personal records (optional for admin, required for cashier)
//     personalEmail: {
//       type: String,
//       required: function(this: IUser) { return this.role === 'cashier'; }, // Personal email is required for cashier
//       unique: false, // Not unique if it's just personal, might be shared
//       lowercase: true,
//       trim: true,
//       sparse: true, // Allows nulls to not violate unique constraint if it were unique
//     },
//     // Old 'username' field, now for login (required for all, unique for all)
//     email: { // This is the login email for both admin and cashier
//       type: String,
//       required: true,
//       unique: true, // Login email MUST be unique
//       lowercase: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: function (this: IUser) {
//         // Password is required if it's an admin AND setup is complete
//         // OR if it's a cashier (assuming cashiers always log in with a password)
//         return (this.role === 'admin' && this.isAdminInitialSetupComplete === true) || this.role === 'cashier';
//       },
//       minlength: [6, 'Password must be at least 6 characters long'],
//     },
//     role: {
//       type: String,
//       enum: ['admin', 'cashier'],
//       required: true,
//     },
//     isAdminInitialSetupComplete: {
//       type: Boolean,
//       default: false,
//     },
//     passwordResetToken: String,
//     passwordResetExpires: Date,
//     isPasswordResetRequested: {
//       type: Boolean,
//       default: false,
//     },
//     // --- Cashier Specific Fields ---
//     name: {
//       type: String,
//       required: function(this: IUser) { return this.role === 'cashier'; }
//     },
//     aadhaar: {
//       type: String,
//       required: function(this: IUser) { return this.role === 'cashier'; },
//       unique: true,
//       length: 12,
//       sparse: true, // Allows nulls to not violate unique constraint for non-cashiers
//     },
//     phone: {
//       type: String,
//       required: function(this: IUser) { return this.role === 'cashier'; },
//       minlength: 10,
//     },
//     storeLocation: {
//       type: String,
//       required: function(this: IUser) { return this.role === 'cashier'; }
//     },
//     status: {
//       type: String,
//       enum: ['active', 'inactive'],
//       default: 'active',
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// userSchema.pre('save', async function (next) {
//   const user = this as IUser;
//   if (!user.isModified('password') || !user.password) {
//     return next();
//   }
//   user.password = await bcrypt.hash(user.password, 10);
//   next();
// });

// userSchema.methods.comparePassword = async function (
//   candidatePassword: string
// ) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// export function getUserModel(): Model<IUser> {
//   return (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);
// }








// // import mongoose, { Schema, Model, Document, Types } from 'mongoose'; // <--- Import Types here
// // import bcrypt from 'bcryptjs';

// // // --- Base User Interface (Common for Admin and Cashier) ---
// // export interface IUser extends Document {
// //   _id: Types.ObjectId; // <--- ADD THIS LINE: Explicitly declare _id
// //   email: string;
// //   password?: string;
// //   role: 'admin' | 'cashier';
// //   isAdminInitialSetupComplete?: boolean;
// //   passwordResetToken?: string;
// //   passwordResetExpires?: Date;
// //   isPasswordResetRequested?: boolean;

// //   // --- Cashier Specific Fields (added) ---
// //   name?: string;
// //   aadhaar?: string;
// //   phone?: string;
// //   username?: string;
// //   storeLocation?: string;
// //   status?: 'active' | 'inactive';
// // }

// // const userSchema: Schema<IUser> = new Schema(
// //   {
// //     email: {
// //       type: String,
// //       required: true,
// //       unique: true,
// //       lowercase: true,
// //       trim: true,
// //     },
// //     password: {
// //       type: String,
// //       required: function (this: IUser) {
// //         return this.role === 'admin' && this.isAdminInitialSetupComplete === true;
// //       },
// //       minlength: [6, 'Password must be at least 6 characters long'],
// //     },
// //     role: {
// //       type: String,
// //       enum: ['admin', 'cashier'],
// //       required: true,
// //     },
// //     isAdminInitialSetupComplete: {
// //       type: Boolean,
// //       default: false,
// //     },
// //     passwordResetToken: String,
// //     passwordResetExpires: Date,
// //     isPasswordResetRequested: {
// //       type: Boolean,
// //       default: false,
// //     },
// //     // --- Cashier Specific Fields ---
// //     name: {
// //       type: String,
// //       required: function(this: IUser) { return this.role === 'cashier'; }
// //     },
// //     aadhaar: {
// //       type: String,
// //       required: function(this: IUser) { return this.role === 'cashier'; },
// //       unique: true,
// //       length: 12,
// //     },
// //     phone: {
// //       type: String,
// //       required: function(this: IUser) { return this.role === 'cashier'; },
// //       minlength: 10,
// //     },
// //     username: {
// //       type: String,
// //       required: function(this: IUser) { return this.role === 'cashier'; },
// //       unique: true,
// //     },
// //     storeLocation: {
// //       type: String,
// //       required: function(this: IUser) { return this.role === 'cashier'; }
// //     },
// //     status: {
// //       type: String,
// //       enum: ['active', 'inactive'],
// //       default: 'active',
// //     },
// //   },
// //   {
// //     timestamps: true,
// //   }
// // );

// // userSchema.pre('save', async function (next) {
// //   const user = this as IUser;
// //   if (!user.isModified('password') || !user.password) {
// //     return next();
// //   }
// //   user.password = await bcrypt.hash(user.password, 10);
// //   next();
// // });

// // userSchema.methods.comparePassword = async function (
// //   candidatePassword: string
// // ) {
// //   return await bcrypt.compare(candidatePassword, this.password);
// // };

// // export function getUserModel(): Model<IUser> {
// //   return (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);
// // }




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
  passwordResetToken?: String,
  passwordResetExpires?: Date,
  isPasswordResetRequested?: Boolean,

  // --- Cashier Specific Fields ---
  name?: string;
  aadhaar?: string;
  phone?: string;
  storeLocation?: string;
  status?: 'active' | 'inactive';
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

  // Only hash if the password field was modified AND it's not already a bcrypt hash.
  // A bcrypt hash typically starts with '$2a$' or '$2b$' and is 60 characters long.
  // This check prevents re-hashing an already hashed password.
  if (
    user.isModified('password') &&
    user.password &&
    !(user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))
  ) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});
// --- END MODIFIED pre('save') HOOK ---

userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export function getUserModel(): Model<IUser> {
  return (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);
}

