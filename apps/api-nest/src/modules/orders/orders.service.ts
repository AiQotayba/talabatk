import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(userId: string, orderData: any) {
    return this.prisma.order.create({
      data: {
        client_id: userId,
        ...orderData,
      },
    });
  }

  async getOrder(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: true,
        driver: true,
        address: true,
      },
    });
  }
}
