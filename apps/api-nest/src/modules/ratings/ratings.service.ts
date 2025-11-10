import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createRating(userId: string, ratingData: any) {
    return this.prisma.rating.create({
      data: {
        client_id: userId,
        ...ratingData,
      },
    });
  }
}
