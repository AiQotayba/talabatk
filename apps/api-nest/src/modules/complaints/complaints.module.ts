import { Module } from '@nestjs/common';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  controllers: [ComplaintsController],
  providers: [ComplaintsService, PrismaService],
})
export class ComplaintsModule {}
