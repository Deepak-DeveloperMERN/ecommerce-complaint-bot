import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatMessage, ChatMessageDocument } from './schemas/chat-message.schema';
import { SYSTEM_PROMPT } from './prompts/system-prompt';

@Injectable()
export class ChatService {
  private llm: ChatGoogleGenerativeAI;

  constructor(
    @InjectModel(ChatMessage.name)
    private chatMessageModel: Model<ChatMessageDocument>,
  ) {
    this.llm = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0.3,
    });
  }

  async handleMessage(sessionId: string, userMessage: string) {

    await this.chatMessageModel.create({
      sessionId,
      role: 'user',
      content: userMessage,
    });

    
    const history = await this.chatMessageModel
      .find({ sessionId })
      .sort({ createdAt: 1 });

    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const response = await this.llm.invoke(formattedMessages);
    console.log(response);

    const aiReply = response.content as string;

    await this.chatMessageModel.create({
      sessionId,
      role: 'assistant',
      content: aiReply,
    });

    return aiReply;
  }
}