import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SubjectIdService } from './subject-id.service';
import { SubjectsService } from './subjects.service';

@Module({
  imports: [PrismaModule],
  providers: [SubjectIdService, SubjectsService],
  exports: [SubjectIdService, SubjectsService],
})
export class SubjectsModule {}