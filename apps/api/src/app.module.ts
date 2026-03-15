import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EdsModule } from './eds/eds.module';

@Module({
  imports: [EdsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
