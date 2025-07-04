import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LogRouteMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    console.log('before2', req.url);
    next();
    console.log('after2');
  }
}
