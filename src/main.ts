import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { openApiDocument } from './common/swagger/openapi.document';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/api/docs-json', (_req: Request, res: Response) => {
    res.json(openApiDocument);
  });
  httpAdapter.get('/api/docs', (_req: Request, res: Response) => {
    res.type('html').send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>FoodDelivery API — Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({ url: '/api/docs-json', dom_id: '#swagger-ui' });
    };
  </script>
</body>
</html>`);
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
void bootstrap();
