import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { RegisterServiceDto } from './dto/register-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post('register')
  register(@Body() body: RegisterServiceDto) {
    return this.servicesService.registerService(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getAll() {
    return this.servicesService.getAllServices();
  }

  @UseGuards(JwtAuthGuard)
  @Get('catalog')
  getCatalog() {
    return this.servicesService.getUserFacingCatalog();
  }
}