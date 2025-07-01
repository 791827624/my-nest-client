import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { createHash } from 'crypto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HttpClientService {
  constructor(private readonly httpService: HttpService) {}

  private readonly config = {
    appId: 'wwd37230afabe5b68e_ZdL3ZO',
    appKey: 'eCKl09MDNkh0vEheRvtlJF8dBu2Fs2gR',
  };

  /**
   * 生成13位时间戳（毫秒）
   */
  generateTimestamp(): string {
    return Date.now().toString();
  }

  /**
   * 计算SHA256签名
   * @param requestBody 请求体数据
   * @param timestamp 时间戳
   */
  calculateSignature(
    requestBody: any,
    timestamp?: string,
  ): { signature: string; timestamp: string } {
    const ts = timestamp || this.generateTimestamp();

    // 序列化请求体（无空格无换行）
    const requestBodyString = JSON.stringify(requestBody);

    // 拼接待签名字符串
    const stringToSign =
      this.config.appId + ts + requestBodyString + this.config.appKey;

    return {
      signature: createHash('sha256').update(stringToSign).digest('hex'),
      timestamp: ts,
    };
  }

  /**
   * 发送API请求
   * @param url 接口URL
   * @param requestBody 请求体
   * @param customHeaders
   */
  async sendSignedRequest(
    url: string,
    requestBody: any,
    customHeaders?: Record<string, string>,
  ): Promise<any> {
    try {
      // 计算签名
      const { signature, timestamp } = this.calculateSignature(requestBody);
      const baseUrl = 'https://account.tanmarket.cn';
      // 设置请求头
      const headers = {
        'Content-Type': 'application/json',
        appId: this.config.appId,
        timestamp,
        sign: signature,
        ...customHeaders,
      };

      const response = await firstValueFrom(
        this.httpService.post(`${baseUrl}${url}`, requestBody, { headers }),
      );

      return response.data;
    } catch (error) {
      this.handleRequestError(error);
    }
  }

  /**
   * 统一错误处理
   * @param error 错误对象
   */
  private handleRequestError(error: any): never {
    let errorMessage = '请求失败: ';

    if (error.response) {
      // 服务端返回的错误响应
      errorMessage += `状态码 ${error.response.status} - ${
        error.response.data?.message || '未知错误'
      }`;
    } else if (error.request) {
      // 无响应错误
      errorMessage += '服务器未响应，请检查网络连接';
    } else {
      // 配置错误
      errorMessage += `请求配置错误: ${error.message}`;
    }

    throw new Error(errorMessage);
  }
}
