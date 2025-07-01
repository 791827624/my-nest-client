import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IntegrationController, IntegrationTestController } from './integration.controller';
import { DataProcessingService } from './data-processing.service';
import { HttpClientService } from '../../http/http-client.service';

@Module({
  imports: [HttpModule],
  controllers: [IntegrationController, IntegrationTestController],
  providers: [DataProcessingService, HttpClientService],
})
export class IntegrationModule { }
