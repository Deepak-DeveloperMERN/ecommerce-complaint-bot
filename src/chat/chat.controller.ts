import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { randomUUID } from 'crypto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(
    @Body('sessionId') sessionId: string,
    @Body('message') message: string,
  ) {
    // 🔹 Validate message
    if (!message || message.trim().length === 0) {
      throw new BadRequestException('Message is required');
    }

    if (message.length > 1000) {
      throw new BadRequestException('Message too long');
    }

    // 🔹 Generate sessionId if not provided
    if (!sessionId) {
      sessionId = randomUUID();
    }

    const reply = await this.chatService.handleMessage(
      sessionId,
      message.trim(),
    );

    return {
      sessionId,
      reply,
    };
  }
}