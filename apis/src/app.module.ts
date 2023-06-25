import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import * as Joi from '@hapi/joi';
import { ConfigModule } from '@nestjs/config';
import { StatModule } from './stat/stat.module';
import { PMatchModule } from './p_match/p_match.module';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number(),
      }),
    }),
    DatabaseModule,
    StatModule,
    PMatchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
