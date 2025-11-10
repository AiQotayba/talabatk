import { Controller, Put, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LocationService } from './location.service';

@ApiTags('Location')
@Controller('location')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Put('update')
  @ApiOperation({ summary: 'Update driver location' })
  async updateLocation(
    @CurrentUser('id') userId: string,
    @Body() locationData: any,
  ) {
    return this.locationService.updateLocation(userId, locationData);
  }

  @Get('nearby-drivers')
  @ApiOperation({ summary: 'Get nearby drivers' })
  async getNearbyDrivers() {
    return this.locationService.getNearbyDrivers();
  }
}
