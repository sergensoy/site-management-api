import { Injectable, Inject } from '@nestjs/common';
import { IPollRepository } from '../../../core/repositories/i-poll.repository';
import { IPollQuestionRepository } from '../../../core/repositories/i-poll-question.repository';
import { IPollResponseRepository } from '../../../core/repositories/i-poll-response.repository';
import { PollStatisticsService } from './poll-statistics.service';
import { PrismaService } from '../../prisma/prisma.service';

export interface ExportOptions {
  format: 'pdf' | 'excel';
  includeRawData?: boolean;
}

@Injectable()
export class PollExportService {
  constructor(
    @Inject(IPollRepository) private pollRepository: IPollRepository,
    @Inject(IPollQuestionRepository) private questionRepository: IPollQuestionRepository,
    @Inject(IPollResponseRepository) private responseRepository: IPollResponseRepository,
    private statisticsService: PollStatisticsService,
    private prisma: PrismaService,
  ) {}

  async exportPoll(pollId: number, options: ExportOptions): Promise<Buffer> {
    const poll = await this.pollRepository.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    const statistics = await this.statisticsService.getPollStatistics(pollId);
    const questions = await this.questionRepository.findByPoll(pollId);
    const responses = await this.responseRepository.findByPoll(pollId);

    if (options.format === 'excel') {
      return this.exportToExcel(poll, questions, responses, statistics, options);
    } else {
      return this.exportToPdf(poll, questions, responses, statistics, options);
    }
  }

  private async exportToExcel(
    poll: any,
    questions: any[],
    responses: any[],
    statistics: any,
    options: ExportOptions,
  ): Promise<Buffer> {
    // Excel export implementation
    // Bu kısım xlsx kütüphanesi ile implement edilebilir
    // Şimdilik basit bir CSV formatı döndürelim
    const csvRows: string[] = [];

    // Header
    csvRows.push(`Anket: ${poll.title}`);
    csvRows.push(`Toplam Katılım: ${statistics.totalResponses}`);
    csvRows.push('');

    // İstatistikler
    csvRows.push('Soru İstatistikleri:');
    statistics.questions.forEach((qStat: any) => {
      csvRows.push(`Soru ID: ${qStat.questionId}`);
      if (qStat.optionStatistics) {
        qStat.optionStatistics.forEach((opt: any) => {
          csvRows.push(`  Seçenek ${opt.optionId}: ${opt.count} (${opt.percentage}%)`);
        });
      }
      csvRows.push('');
    });

    // Ham veri (opsiyonel)
    if (options.includeRawData) {
      csvRows.push('Ham Veriler:');
      csvRows.push('Kullanıcı ID, Soru ID, Yanıt');
      responses.forEach(async (response) => {
        const answers = await this.prisma.pollResponseAnswer.findMany({
          where: { responseId: response.id },
        });
        answers.forEach((answer) => {
          const answerValue = answer.answerText || answer.answerNumber || answer.answerDate || 'N/A';
          csvRows.push(`${response.userId}, ${answer.questionId}, ${answerValue}`);
        });
      });
    }

    return Buffer.from(csvRows.join('\n'), 'utf-8');
  }

  private async exportToPdf(
    poll: any,
    questions: any[],
    responses: any[],
    statistics: any,
    options: ExportOptions,
  ): Promise<Buffer> {
    // PDF export implementation
    // Bu kısım pdfkit veya benzeri bir kütüphane ile implement edilebilir
    // Şimdilik basit bir text formatı döndürelim
    const textLines: string[] = [];

    textLines.push(`ANKET RAPORU: ${poll.title}`);
    textLines.push(`Oluşturulma Tarihi: ${poll.createdAt}`);
    textLines.push(`Toplam Katılım: ${statistics.totalResponses}`);
    textLines.push('');
    textLines.push('SORU İSTATİSTİKLERİ:');
    textLines.push('');

    statistics.questions.forEach((qStat: any) => {
      textLines.push(`Soru ID: ${qStat.questionId}`);
      if (qStat.optionStatistics) {
        qStat.optionStatistics.forEach((opt: any) => {
          textLines.push(`  Seçenek ${opt.optionId}: ${opt.count} oy (${opt.percentage}%)`);
        });
      }
      textLines.push('');
    });

    return Buffer.from(textLines.join('\n'), 'utf-8');
  }
}

