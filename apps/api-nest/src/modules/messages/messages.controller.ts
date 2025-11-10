import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MessagesService } from './messages.service';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Body() messageData: any,
  ) {
    return this.messagesService.sendMessage(userId, messageData);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get order conversation' })
  async getOrderMessages(@Param('orderId') orderId: string) {
    return this.messagesService.getOrderMessages(orderId);
  }
}
