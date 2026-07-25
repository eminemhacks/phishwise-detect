import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetectionService } from './detection.service';
import { DetectionController } from './detection.controller';
import { SafeBrowsingService } from './safe-browsing.service';
import { Scan } from './scan.entity';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Scan]),
    // ProgressModule exports ProgressService, which owns the server-authoritative
    // gamification recompute. We reuse it (applyScan) rather than forking it.
    ProgressModule,
  ],
  controllers: [DetectionController],
  providers: [DetectionService, SafeBrowsingService],
  exports: [DetectionService],
})
export class DetectionModule {}
