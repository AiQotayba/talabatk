import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        client: true,
        driver: true,
        address: true,
      },
    });
  }

  async getAllDrivers() {
    return this.prisma.user.findMany({
      where: { role: 'driver' },
    });
  }
}
