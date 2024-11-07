import mongoose from "mongoose";
import { randomUUID } from "crypto";
/*
const chatSchema = new mongoose.Schema({
  id: {
    type: String,
    default: randomUUID(),
  },
  role: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});
*/
/*
const chatSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => randomUUID(), // Use a function to generate a new UUID
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'system', 'assistant'], // Limit roles to specific values
  },
  content: {
    type: String,
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  chats: [chatSchema],
});
*/

const chatSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => randomUUID(), // Use a function to generate a new UUID
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'system', 'assistant'], // Limit roles to specific values
  },
  content: {
    type: String,
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  chats: [chatSchema], // Use the chat schema
});



export default mongoose.model("User", userSchema);
