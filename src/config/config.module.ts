import { Module } from '@nestjs/common';
import { AppConfigService } from './app.config';
import { TypeOrmConfigService } from './typeorm.config';

@Module({
  providers: [AppConfigService, TypeOrmConfigService],
  exports: [AppConfigService, TypeOrmConfigService],
})
export class AppConfigModule {}
