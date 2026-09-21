import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Root')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Backend Root Status' })
  getRoot() {
    return {
      name: 'UKK Coworking Space & Workstation Reservation REST API (NestJS)',
      version: '1.0.0',
      status: 'active',
      author: 'SMK Telkom Malang RPL',
      docs: '/docs',
      endpoints: {
        auth: '/api/auth',
        spaces: '/api/spaces',
        diskon: '/api/diskon',
        reservasi: '/api/reservasi',
        admin: '/api/admin',
        maker: '/api/maker',
        upload: '/api/upload',
      },
    };
  }
  @Get('health')
  @ApiOperation({ summary: 'Publik: Health Check Server' })
  getHealth() {
    return {
      status: true,
      statusCode: 200,
      message: 'Server Coworking Space API berjalan normal (Healthy).',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
