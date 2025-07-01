import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { NextFunction, Response, Request } from "express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors(); // 允许所有跨域请求
  app.useStaticAssets("public", { prefix: "/static" });
  app.use(function (req: Request, res: Response, next: NextFunction) {
    console.log("before", req.url); //log middleware
    next();
    console.log("after"); //log middleware
  });

  await app.listen(3000, "0.0.0.0"); // 明确指定监听所有接口
}
bootstrap();
