import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import * as fs from 'fs'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  // SwaggerModule.setup('api', app, document)
  // export OpenAPI json
  fs.writeFileSync('openapi.json', JSON.stringify(document))

  await app.listen(3000)
}
bootstrap()
