import { Module } from '@nestjs/common';
import { PollService } from './poll.service';
import { PollController } from './poll.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { IPollRepository } from '../../core/repositories/i-poll.repository';
import { PrismaPollRepository } from '../../infrastructure/repositories/prisma-poll.repository';
import { IPollQuestionRepository } from '../../core/repositories/i-poll-question.repository';
import { PrismaPollQuestionRepository } from '../../infrastructure/repositories/prisma-poll-question.repository';
import { IPollOptionRepository } from '../../core/repositories/i-poll-option.repository';
import { PrismaPollOptionRepository } from '../../infrastructure/repositories/prisma-poll-option.repository';
import { IPollResponseRepository } from '../../core/repositories/i-poll-response.repository';
import { PrismaPollResponseRepository } from '../../infrastructure/repositories/prisma-poll-response.repository';
import { PollStatisticsService } from '../../infrastructure/common/services/poll-statistics.service';
import { PollExportService } from '../../infrastructure/common/services/poll-export.service';
import { UserModule } from '../user/user.module';
import { FileModule } from '../file/file.module';

@Module({
  imports: [UserModule, FileModule],
  controllers: [PollController],
  providers: [
    PollService,
    PrismaService,
    PollStatisticsService,
    PollExportService,
    { provide: IPollRepository, useClass: PrismaPollRepository },
    { provide: IPollQuestionRepository, useClass: PrismaPollQuestionRepository },
    { provide: IPollOptionRepository, useClass: PrismaPollOptionRepository },
    { provide: IPollResponseRepository, useClass: PrismaPollResponseRepository },
  ],
  exports: [
    PollService,
    IPollRepository,
    IPollQuestionRepository,
    IPollOptionRepository,
    IPollResponseRepository,
    PollStatisticsService,
    PollExportService,
  ],
})
export class PollModule {}

