import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpLoggerInterceptor } from './common/interceptors/http-logger.interceptor';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  app.use((req, res, next) => {
    if (req.url === '/sw.js') {
      return res.status(204).end();
    }
    next();
  });
  //activation des corps
  app.enableCors({
    origin: ['http://localhost:3000', 'https://site-wingi.vercel.app'], // URLs frontend autorisées
    credentials: true,
  });
  // Global prefix
  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);
  // CORS
  app.enableCors();
  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true, // Supprime les champs non définis dans le DTO
      forbidNonWhitelisted: false, // ⚠️ IMPORTANT: Mettre à FALSE pour multipart/form-data
    }),
  );
  // Global filters and interceptors
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalInterceptors(new HttpLoggerInterceptor());
  // On demande à Nest d'utiliser Winston globalement
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('API pour application ActuFoody')
    .setDescription('Actualité sur les restaurants')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  logger.log(
    `🚀 Application running on: http://localhost:${port}/${apiPrefix}`,
  );
  logger.log(
    `📖 Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`,
  );
}
bootstrap();
