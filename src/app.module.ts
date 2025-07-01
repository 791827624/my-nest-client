import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { GlobalExceptionFilter } from "./core/exceptions/global-exception.filter";
import { IntegrationModule } from "./modules/integration/integration.module";
import { WeatherModule } from "./weather/weather.module";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局模块
      envFilePath: ".env", // 指定.env文件路径
    }),
    WeatherModule,
  ],
})
export class AppModule {}
