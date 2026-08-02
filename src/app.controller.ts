import { Controller, Get, Redirect, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get()
  // @Redirect('/api')
  // getHello(): string {
  //   return this.appService.getHello();
  // }

  //    @Get()
  // redirectToSwagger(@Res() res: Response) {
  //   return res.redirect('/api');
  // }
}
