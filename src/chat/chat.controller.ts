import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(
    @Body('sessionId') sessionId: string,
    @Body('message') message: string,
  ) {
    if (!sessionId || !message) {
      return { error: 'sessionId and message are required' };
    }

    const reply = await this.chatService.handleMessage(sessionId, message);

    return { reply };
  }
}