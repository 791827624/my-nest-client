import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { JdyPayloadDto } from './dto/jdy-payload.dto';
import { DataProcessingService } from './data-processing.service';

@Controller('integrations')
export class IntegrationController {
  constructor(private readonly processingService: DataProcessingService) { }

  @Get()
  handleTest(): string {
    return 'test'
  }


  @Post('jdy-webhook')
  async handleJdyPush(
    @Body() payload: JdyPayloadDto,

    // @Headers('x-api-key') apiKey: string,
  ) {
    // 验证API密钥
    // if (apiKey !== process.env.JDY_API_KEY) {
    //   throw new UnauthorizedException('Invalid API key');
    // }
    // console.log('jdy-webhook', payload);

    // 异步处理数据
    this.processingService.processData(payload);
    return { status: 'processing_started' };
  }
}

@Controller('test3')
export class IntegrationTestController {
  constructor(private readonly processingService: DataProcessingService) { }

  @Get()
  handleTest2(): string {
    return 'test8899'
  }
}

