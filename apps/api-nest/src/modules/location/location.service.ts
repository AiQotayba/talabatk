import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  async updateLocation(userId: string, locationData: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        metadata: {
          location: locationData,
        },
      },
    });
  }

  async getNearbyDrivers() {
    // Implementation for finding nearby drivers
    return this.prisma.user.findMany({
      where: {
        role: 'driver',
      },
    });
  }
}
