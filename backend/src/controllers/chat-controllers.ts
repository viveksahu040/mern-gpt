
import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { configureOpenAI } from "../config/openai-config.js";
import OpenAI from "openai";
import mongoose from "mongoose";
import { randomUUID } from "crypto";


 type ChatMessage = {
  id: string; // Added ID field
  role: 'user' | 'system' | 'assistant'; // Role should be restricted to these values
  content: string;
};

// Define the user type
 interface User extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  chats: ChatMessage[]; }

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;

  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunctioned" });
    }

    // Map user chats ensuring they conform to the ChatMessage type
    const chats: ChatMessage[] = user.chats.map(chat => ({
      id: chat.id, // Include the ID field
      role: chat.role as ChatMessage['role'], // Type assertion
      content: chat.content,
    }));

    // Add the new user message
    const newUserChat: ChatMessage = {
      id: randomUUID(), // Generate a new ID for the new message
      content: message,
      role: "user",
    };
    
    chats.push(newUserChat); // Add user chat to the array
    user.chats.push(newUserChat); // Push user message to user's chats

    // Instantiate the OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is properly configured
    });

    // Make the API call for chat completion
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chats,
    });

    // Check if the response is valid and contains choices
    if (chatResponse.choices && chatResponse.choices.length > 0) {
      const assistantMessage = chatResponse.choices[0].message;
      const newAssistantChat: ChatMessage = {
        id: randomUUID(), // Generate a new ID for the assistant's message
        role: "assistant", // Set role to assistant
        content: assistantMessage.content,
      };
      user.chats.push(newAssistantChat); // Push assistant message to user's chats
      await user.save();
    } else {
      return res.status(500).json({ message: "No response from OpenAI" });
    }

    return res.status(200).json({ chats: user.chats });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if the user exists
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};

export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if the user exists
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    // Clear user chats
    // user.chats = [];
    await user.save();
    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};