import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder } from '@nestjs/swagger/dist/document-builder';
import { SwaggerModule } from '@nestjs/swagger/dist/swagger-module';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { join } from 'path';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggingInterceptor } from './Helpers/Interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 10000;

  app.enableCors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3000/",
    ],
    methods: "*",
    credentials: false, 
  });

 app.use((req: any, res: any, next: () => void) => {
    next();
  });

  const staticPath = join(__dirname, "API", "Directory");
  app.use("/static", express.static(staticPath));

  app.use(bodyParser.json({ limit: '2gb' })); 
  app.use(bodyParser.urlencoded({ limit: '2gb', extended: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const config = new DocumentBuilder()
    .setTitle('Cinema API')
    .setDescription('')
    .setVersion('1.0')
    .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, documentFactory, {
    swaggerOptions: {
      tagsSorter: "alpha"
    }
  });

  await app.listen(port);

  console.log(`Seja Bem Vindo: Acesse http://localhost:${port}/swagger`)

  }

bootstrap();
