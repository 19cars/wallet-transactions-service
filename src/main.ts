import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { AppConfigService } from '@config/app.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const appConfig = app.get(AppConfigService);
  const config = appConfig.getConfig();

  app.setGlobalPrefix(config.globalPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Wallet Transactions Service')
    .setDescription(
      'A production-grade financial transactions service with ledger-based architecture',
    )
    .setVersion('1.0.0')
    .addTag('transactions', 'Transaction operations (Write Model)')
    .addTag('ledger', 'Ledger operations (Read Model)')
    .addTag('health', 'Health check')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${config.globalPrefix}/docs`, app, document);

  await app.listen(config.port, '0.0.0.0');
  console.log(
    `✅ Application is running on: http://localhost:${config.port}/${config.globalPrefix}`,
  );
  console.log(
    `📚 Swagger documentation available at: http://localhost:${config.port}/${config.globalPrefix}/docs`,
  );
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
