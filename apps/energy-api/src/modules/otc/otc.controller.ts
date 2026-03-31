import { Body, Controller, Get, Post } from '@nestjs/common';
import { OtcService } from './otc.service';
import { CreateDemoListingDto } from './dto/create-demo-listing.dto';
import { FillDemoListingDto } from './dto/fill-demo-listing.dto';

@Controller('otc')
export class OtcController {
  public constructor(private readonly otcService: OtcService) {}

  @Post('create-demo-listing')
  public async createDemoListing(@Body() dto: CreateDemoListingDto) {
    return this.otcService.createDemoListing(dto);
  }

  @Post('fill-demo-listing')
  public async fillDemoListing(@Body() dto: FillDemoListingDto) {
    return this.otcService.fillDemoListing(dto);
  }

  @Get('listings')
  public async listOpenListings() {
    return this.otcService.listOpenListings();
  }
}