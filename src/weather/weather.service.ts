import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { AmapWeatherResponse, WeatherInfo } from "./weather.interface";
import { CITYS } from "src/data/city";

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  async getLiveWeather(city: string) {
    const location = CITYS[city.toUpperCase()] || city;

    const apiKey = this.configService.get<string>("AMAP_API_KEY"); // 从环境变量读取
    const AMAP_WEATHER_URL = this.configService.get<string>("AMAP_WEATHER_URL"); // 从环境变量读取

    if (!apiKey) throw new Error("AMAP_API_KEY 未配置");

    const response = await firstValueFrom(
      this.httpService.get(AMAP_WEATHER_URL, {
        params: { key: apiKey, city: location },
      })
    );

    if (response.data.status !== "1") {
      throw new Error(`高德API错误: ${response.data.info}`);
    }
    return response.data;
  }

  private transformWeatherData(data: AmapWeatherResponse): WeatherInfo {
    const live = data.lives[0];
    return {
      city: live.city,
      weather: live.weather,
      temperature: live.temperature,
      windDirection: live.winddirection,
      windPower: live.windpower,
      humidity: live.humidity,
      reportTime: live.reporttime,
    };
  }
}
