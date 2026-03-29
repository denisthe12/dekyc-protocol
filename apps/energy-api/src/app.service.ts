import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  public getHealth() {
    return {
      ok: true,
      service: 'energy-api',
      port: 3201,
      timestamp: new Date().toISOString(),
    };
  }
}