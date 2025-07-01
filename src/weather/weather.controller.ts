import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('live')
  async getLiveWeather(@Query('city') city: string) {
    if (!city || typeof city !== 'string') {
      throw new BadRequestException('请输入有效的城市名称');
    }
    return this.weatherService.getLiveWeather(city);
  }
}