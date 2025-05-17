import { Controller, Get, Head } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  
  @Head('health')
  health(): void {
    // This endpoint is used by the frontend to check connectivity
    // Returns a 200 OK status with no body
    return;
  }
  
  @Get('health')
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}