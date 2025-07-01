export interface AmapWeatherResponse {
  status: string;
  count: string;
  info: string;
  lives: {
    province: string;
    city: string;
    adcode: string;
    weather: string;
    temperature: string;
    winddirection: string;
    windpower: string;
    humidity: string;
    reporttime: string;
  }[];
}

export interface WeatherInfo {
  city: string;
  weather: string;
  temperature: string;
  windDirection: string;
  windPower: string;
  humidity: string;
  reportTime: string;
}