// src/lib/models/message.ts

import mongoose, { Schema, Document, Types } from 'mongoose';
import './user'; // Import User model to reference it

export interface IMessage extends Document {
  _id: string;
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    sender: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;

// NO MORE SERVER ACTIONS IN THIS FILE