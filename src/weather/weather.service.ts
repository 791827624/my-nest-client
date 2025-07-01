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
    const apiKey = "f4ff4c20d62abb61760f3d1979905d9f";
    const response = await firstValueFrom(
      this.httpService.get("", {
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
