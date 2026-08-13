import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }),
);

app.useGlobalInterceptors(
  new BigIntInterceptor(),
  // new TransformInterceptor(),
);

// app.useGlobalFilters(
//   new HttpExceptionFilter(),
// );




  const config = new DocumentBuilder()
    .setTitle('SabiMarket API')
    .setDescription(
      'Backend API for the SabiMarket AI voice-first market assistant.',
    )
    .setVersion('1.0')
    .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  },
  'access-token',)
    .build();

  app.setGlobalPrefix('api');


  const document = SwaggerModule.createDocument(app, config);

  
// writeFileSync(
//   './swagger.json',
//   JSON.stringify(document, null, 2),
// );

const swaggerPath = join(process.cwd(), 'swagger.json');

writeFileSync(
  swaggerPath,
  JSON.stringify(document, null, 2),
);

console.log(`📄 Swagger JSON generated at: ${swaggerPath}`);


  SwaggerModule.setup('/', app, document);

  await app.listen(process.env.PORT ?? 3001);

  console.log(`🚀 Backend running on http://localhost:3001`);
  console.log(`📚 Swagger docs: http://localhost:3001/api`);
}
bootstrap();
