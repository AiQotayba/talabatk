import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class ComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  async createComplaint(userId: string, complaintData: any) {
    return this.prisma.complaint.create({
      data: {
        client_id: userId,
        ...complaintData,
      },
    });
  }
}
