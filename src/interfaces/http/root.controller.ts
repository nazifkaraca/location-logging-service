import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class RootController {
  @Get()
  @Redirect('/docs', 302)
  toDocs(): { url: string } {
    return { url: '/docs' };
  }
}
