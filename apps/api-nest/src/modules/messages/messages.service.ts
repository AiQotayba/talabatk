import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(userId: string, messageData: any) {
    return this.prisma.message.create({
      data: {
        from_user: userId,
        ...messageData,
      },
    });
  }

  async getOrderMessages(orderId: string) {
    return this.prisma.message.findMany({
      where: { order_id: orderId },
      orderBy: { created_at: 'asc' },
    });
  }
}
