import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContentModule } from './lessons/content.module';
import { ProgressModule } from './progress/progress.module';
import { AdminModule } from './admin/admin.module';
import { DetectionModule } from './detection/detection.module';
import { HealthController } from './health.controller';

import { User } from './users/user.entity';
import { Progress } from './progress/progress.entity';
import { AuthToken } from './auth/auth-token.entity';
import { Category, Lesson, Quiz } from './lessons/content.entities';
import { QuizAttempt } from './quizzes/quiz-attempt.entity';
import { Scan } from './detection/scan.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('db.url');
        const ssl = config.get<boolean>('db.ssl')
          ? { rejectUnauthorized: false }
          : false;
        // A single DATABASE_URL (e.g. from Neon) takes precedence; otherwise
        // fall back to the discrete DB_* variables used for local development.
        return {
          type: 'postgres' as const,
          ...(url
            ? { url }
            : {
                host: config.get<string>('db.host'),
                port: config.get<number>('db.port'),
                username: config.get<string>('db.username'),
                password: config.get<string>('db.password'),
                database: config.get<string>('db.name'),
              }),
          ssl,
          entities: [User, Progress, AuthToken, Category, Lesson, Quiz, QuizAttempt, Scan],
          synchronize: false,
          autoLoadEntities: true,
        };
      },
    }),
    MailModule,
    AuthModule,
    UsersModule,
    ContentModule,
    ProgressModule,
    AdminModule,
    DetectionModule,
  ],
  controllers: [HealthController],
  providers: [
    // JWT guard is global; routes opt out with @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
