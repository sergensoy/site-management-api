import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IPollRepository } from '../../core/repositories/i-poll.repository';
import { IPollQuestionRepository } from '../../core/repositories/i-poll-question.repository';
import { IPollOptionRepository } from '../../core/repositories/i-poll-option.repository';
import { IPollResponseRepository } from '../../core/repositories/i-poll-response.repository';
import { Poll } from '../../core/entities/poll.entity';
import { PollQuestion } from '../../core/entities/poll-question.entity';
import { PollOption } from '../../core/entities/poll-option.entity';
import { PollResponse } from '../../core/entities/poll-response.entity';
import { PollResponseAnswer } from '../../core/entities/poll-response-answer.entity';
import { PollStatus } from '../../core/entities/poll-status.enum';
import { PollQuestionType } from '../../core/entities/poll-question-type.enum';
import { PollResponseEditable } from '../../core/entities/poll-response-editable.enum';
import { PollResultVisibility } from '../../core/entities/poll-result-visibility.enum';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { CreatePollQuestionDto } from './dto/create-poll-question.dto';
import { UpdatePollQuestionDto } from './dto/update-poll-question.dto';
import { SubmitPollResponseDto, PollAnswerDto } from './dto/submit-poll-response.dto';
import { UpdatePollResponseDto } from './dto/update-poll-response.dto';
import { FilterPollDto } from './dto/filter-poll.dto';
import { PollPublishedEvent } from '../../core/events/poll-published.event';
import { PollClosedEvent } from '../../core/events/poll-closed.event';
import { PollStatisticsService } from '../../infrastructure/common/services/poll-statistics.service';
import { PollExportService } from '../../infrastructure/common/services/poll-export.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { FileService } from '../file/file.service';

@Injectable()
export class PollService {
  private readonly logger = new Logger(PollService.name);

  constructor(
    @Inject(IPollRepository) private pollRepository: IPollRepository,
    @Inject(IPollQuestionRepository) private questionRepository: IPollQuestionRepository,
    @Inject(IPollOptionRepository) private optionRepository: IPollOptionRepository,
    @Inject(IPollResponseRepository) private responseRepository: IPollResponseRepository,
    private fileService: FileService,
    private statisticsService: PollStatisticsService,
    private exportService: PollExportService,
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreatePollDto, userId: number): Promise<Poll> {
    // Hedef kitle validasyonu
    if (dto.targetAudience === 'SITE' && !dto.siteId) {
      throw new BadRequestException('Siteye özel anket için siteId gereklidir.');
    }

    const newPoll = new Poll({
      title: dto.title,
      description: dto.description,
      status: PollStatus.DRAFT,
      siteId: dto.siteId,
      createdById: userId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      resultVisibility: dto.resultVisibility || PollResultVisibility.AFTER_CLOSED,
      responseEditable: dto.responseEditable || PollResponseEditable.UNTIL_CLOSED,
      targetAudience: dto.targetAudience,
      targetIds: dto.targetIds,
    });

    const created = await this.pollRepository.create(newPoll);

    // Dosyaları ankete bağla
    if (dto.fileIds && dto.fileIds.length > 0) {
      for (const fileId of dto.fileIds) {
        await this.fileService.attachFileToEntity(
          fileId,
          'Poll',
          created.id,
          'Anket eki',
          userId,
        );
      }
    }

    return created;
  }

  async findAll(filterDto: FilterPollDto, userId?: number) {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const skip = (page - 1) * limit;

    let polls = await this.pollRepository.findAll();

    // Filtreleme
    if (filterDto.status) {
      polls = polls.filter(p => p.status === filterDto.status);
    }
    if (filterDto.siteId) {
      polls = polls.filter(p => p.siteId === filterDto.siteId);
    }
    if (filterDto.search) {
      const searchLower = filterDto.search.toLowerCase();
      polls = polls.filter(
        p =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower),
      );
    }
    if (filterDto.startDateFrom) {
      polls = polls.filter(p => p.startDate && p.startDate >= filterDto.startDateFrom!);
    }
    if (filterDto.startDateTo) {
      polls = polls.filter(p => p.startDate && p.startDate <= filterDto.startDateTo!);
    }
    if (filterDto.endDateFrom) {
      polls = polls.filter(p => p.endDate && p.endDate >= filterDto.endDateFrom!);
    }
    if (filterDto.endDateTo) {
      polls = polls.filter(p => p.endDate && p.endDate <= filterDto.endDateTo!);
    }
    if (filterDto.targetAudience) {
      polls = polls.filter(p => p.targetAudience === filterDto.targetAudience);
    }

    const total = polls.length;
    const paginatedPolls = polls.slice(skip, skip + limit);

    return {
      data: paginatedPolls,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, userId?: number): Promise<Poll> {
    const poll = await this.pollRepository.findById(id);
    if (!poll) {
      throw new NotFoundException('Anket bulunamadı.');
    }

    // Hedef kitle kontrolü (kullanıcı varsa)
    if (userId && !poll.canBeViewedBy(userId)) {
      throw new BadRequestException('Bu anketi görüntüleme yetkiniz yok.');
    }

    return poll;
  }

  async update(id: number, dto: UpdatePollDto, userId: number): Promise<Poll> {
    const existingPoll = await this.findOne(id);
    if (existingPoll.status === PollStatus.PUBLISHED) {
      throw new BadRequestException('Yayınlanmış anketler doğrudan güncellenemez, önce taslağa çekin.');
    }

    // Hedef kitle validasyonu
    if (dto.targetAudience === 'SITE' && !dto.siteId) {
      throw new BadRequestException('Siteye özel anket için siteId gereklidir.');
    }

    const updatedPoll = await this.pollRepository.update(id, {
      ...dto,
      updatedById: userId,
    });

    // Dosya ilişkilerini güncelle
    if (dto.fileIds !== undefined) {
      // Mevcut attachment'ları bul ve sil
      const existingFiles = await this.fileService.findByEntity('Poll', id);
      for (const file of existingFiles) {
        // Detach işlemi için file attachment ID'si gerekli, bu kısım FileService'de implement edilmeli
      }
      // Yeni dosyaları bağla
      if (dto.fileIds.length > 0) {
        for (const fileId of dto.fileIds) {
          await this.fileService.attachFileToEntity(
            fileId,
            'Poll',
            id,
            'Anket eki',
            userId,
          );
        }
      }
    }

    return updatedPoll;
  }

  async remove(id: number, userId: number): Promise<void> {
    const poll = await this.findOne(id);
    if (poll.status === PollStatus.PUBLISHED) {
      throw new BadRequestException('Yayınlanmış anketler doğrudan silinemez, önce kapatın.');
    }
    await this.pollRepository.delete(id, userId);
    this.logger.log(`Poll soft-deleted: ${id} by user ${userId}`);
  }

  async publish(id: number, userId: number): Promise<Poll> {
    const poll = await this.findOne(id);
    if (poll.status === PollStatus.PUBLISHED) {
      throw new ConflictException('Anket zaten yayınlanmış durumda.');
    }
    if (poll.status === PollStatus.CLOSED || poll.status === PollStatus.ARCHIVED) {
      throw new BadRequestException('Kapatılmış veya arşivlenmiş anketler yayınlanamaz.');
    }

    // En az bir soru olmalı
    const questions = await this.questionRepository.findByPoll(id);
    if (questions.length === 0) {
      throw new BadRequestException('Yayınlamak için en az bir soru eklenmelidir.');
    }

    const publishedPoll = await this.pollRepository.update(id, {
      status: PollStatus.PUBLISHED,
      updatedById: userId,
    });

    // Event emit et
    this.eventEmitter.emit(
      'poll.published',
      new PollPublishedEvent(
        publishedPoll.id,
        publishedPoll.title,
        publishedPoll.description || null,
        publishedPoll.createdById || 0,
        publishedPoll.targetAudience,
        publishedPoll.siteId,
        publishedPoll.targetIds,
      ),
    );

    this.logger.log(`Poll published: ${id} by user ${userId}`);
    return publishedPoll;
  }

  async close(id: number, userId: number): Promise<Poll> {
    const poll = await this.findOne(id);
    if (poll.status === PollStatus.CLOSED) {
      throw new ConflictException('Anket zaten kapatılmış durumda.');
    }

    const closedPoll = await this.pollRepository.update(id, {
      status: PollStatus.CLOSED,
      updatedById: userId,
    });

    // Event emit et
    this.eventEmitter.emit(
      'poll.closed',
      new PollClosedEvent(closedPoll.id, closedPoll.title, new Date()),
    );

    this.logger.log(`Poll closed: ${id} by user ${userId}`);
    return closedPoll;
  }

  async addQuestion(pollId: number, dto: CreatePollQuestionDto, userId: number): Promise<PollQuestion> {
    const poll = await this.findOne(pollId);
    if (poll.status === PollStatus.PUBLISHED) {
      throw new BadRequestException('Yayınlanmış anketlere soru eklenemez.');
    }

    // Çoktan seçmeli sorular için seçenek kontrolü
    if (
      (dto.questionType === PollQuestionType.SINGLE_CHOICE ||
        dto.questionType === PollQuestionType.MULTIPLE_CHOICE) &&
      (!dto.options || dto.options.length === 0)
    ) {
      throw new BadRequestException('Çoktan seçmeli sorular için en az bir seçenek gereklidir.');
    }

    const newQuestion = new PollQuestion({
      pollId,
      questionText: dto.questionText,
      questionType: dto.questionType,
      order: dto.order || 0,
      isRequired: dto.isRequired || false,
    });

    const createdQuestion = await this.questionRepository.create(newQuestion);

    // Seçenekleri ekle
    if (dto.options && dto.options.length > 0) {
      for (const optionDto of dto.options) {
        const newOption = new PollOption({
          questionId: createdQuestion.id,
          optionText: optionDto.optionText,
          order: optionDto.order || 0,
        });
        await this.optionRepository.create(newOption);
      }
    }

    return createdQuestion;
  }

  async updateQuestion(
    pollId: number,
    questionId: number,
    dto: UpdatePollQuestionDto,
    userId: number,
  ): Promise<PollQuestion> {
    const poll = await this.findOne(pollId);
    if (poll.status === PollStatus.PUBLISHED) {
      throw new BadRequestException('Yayınlanmış anketlerdeki sorular güncellenemez.');
    }

    const question = await this.questionRepository.findById(questionId);
    if (!question || question.pollId !== pollId) {
      throw new NotFoundException('Soru bulunamadı.');
    }

    return this.questionRepository.update(questionId, dto);
  }

  async removeQuestion(pollId: number, questionId: number, userId: number): Promise<void> {
    const poll = await this.findOne(pollId);
    if (poll.status === PollStatus.PUBLISHED) {
      throw new BadRequestException('Yayınlanmış anketlerden soru silinemez.');
    }

    const question = await this.questionRepository.findById(questionId);
    if (!question || question.pollId !== pollId) {
      throw new NotFoundException('Soru bulunamadı.');
    }

    await this.questionRepository.delete(questionId);
  }

  async submitResponse(pollId: number, dto: SubmitPollResponseDto, userId: number): Promise<PollResponse> {
    const poll = await this.findOne(pollId);

    // Anket aktif mi kontrolü
    if (!poll.isActive()) {
      throw new BadRequestException('Bu anket şu anda aktif değil.');
    }

    // Kullanıcı daha önce yanıt vermiş mi?
    const existingResponse = await this.responseRepository.findByPollAndUser(pollId, userId);
    if (existingResponse) {
      // Düzenlenebilir mi kontrol et
      if (poll.responseEditable === PollResponseEditable.NEVER) {
        throw new ConflictException('Bu anket için yanıt değiştirilemez.');
      }
      if (poll.responseEditable === PollResponseEditable.UNTIL_CLOSED && poll.status === PollStatus.CLOSED) {
        throw new BadRequestException('Anket kapandığı için yanıt değiştirilemez.');
      }

      // Mevcut yanıtı güncelle
      return this.updateResponse(pollId, dto, userId);
    }

    // Soruları kontrol et
    const questions = await this.questionRepository.findByPoll(pollId);
    this.validateAnswers(questions, dto.answers);

    // Transaction içinde yanıt ve cevapları kaydet
    const response = await this.prisma.$transaction(async (tx) => {
      // PollResponse oluştur
      const newResponse = new PollResponse({
        pollId,
        userId,
      });
      const createdResponse = await this.responseRepository.create(newResponse);

      // Her soru için yanıt kaydet
      for (const answerDto of dto.answers) {
        await tx.pollResponseAnswer.create({
          data: {
            responseId: createdResponse.id,
            questionId: answerDto.questionId,
            answerText: answerDto.answerText,
            answerNumber: answerDto.answerNumber,
            answerDate: answerDto.answerDate,
            selectedOptionIds: answerDto.selectedOptionIds ? answerDto.selectedOptionIds : undefined,
          },
        });
      }

      return createdResponse;
    });

    return response;
  }

  async updateResponse(pollId: number, dto: SubmitPollResponseDto, userId: number): Promise<PollResponse> {
    const poll = await this.findOne(pollId);

    // Düzenlenebilir mi kontrol et
    if (poll.responseEditable === PollResponseEditable.NEVER) {
      throw new BadRequestException('Bu anket için yanıt değiştirilemez.');
    }
    if (poll.responseEditable === PollResponseEditable.UNTIL_CLOSED && poll.status === PollStatus.CLOSED) {
      throw new BadRequestException('Anket kapandığı için yanıt değiştirilemez.');
    }

    const existingResponse = await this.responseRepository.findByPollAndUser(pollId, userId);
    if (!existingResponse) {
      throw new NotFoundException('Yanıt bulunamadı.');
    }

    // Soruları kontrol et
    const questions = await this.questionRepository.findByPoll(pollId);
    this.validateAnswers(questions, dto.answers);

    // Transaction içinde yanıtları güncelle
    await this.prisma.$transaction(async (tx) => {
      // Mevcut yanıtları sil
      await tx.pollResponseAnswer.deleteMany({
        where: { responseId: existingResponse.id },
      });

      // Yeni yanıtları ekle
      for (const answerDto of dto.answers) {
        await tx.pollResponseAnswer.create({
          data: {
            responseId: existingResponse.id,
            questionId: answerDto.questionId,
            answerText: answerDto.answerText,
            answerNumber: answerDto.answerNumber,
            answerDate: answerDto.answerDate,
            selectedOptionIds: answerDto.selectedOptionIds ? answerDto.selectedOptionIds : undefined,
          },
        });
      }
    });

    return existingResponse;
  }

  private validateAnswers(questions: PollQuestion[], answers: PollAnswerDto[]): void {
    // Tüm zorunlu sorular yanıtlanmış mı?
    const requiredQuestions = questions.filter(q => q.isRequired);
    const answeredQuestionIds = new Set(answers.map(a => a.questionId));

    for (const requiredQuestion of requiredQuestions) {
      if (!answeredQuestionIds.has(requiredQuestion.id)) {
        throw new BadRequestException(`Zorunlu soru (ID: ${requiredQuestion.id}) yanıtlanmadı.`);
      }
    }

    // Her yanıt için soru tipine uygun mu kontrol et
    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) {
        throw new BadRequestException(`Soru bulunamadı: ${answer.questionId}`);
      }

      // Soru tipine göre yanıt kontrolü
      if (question.questionType === PollQuestionType.SINGLE_CHOICE) {
        if (!answer.selectedOptionIds || answer.selectedOptionIds.length !== 1) {
          throw new BadRequestException(`Soru ${question.id} için tek seçim yapılmalıdır.`);
        }
      } else if (question.questionType === PollQuestionType.MULTIPLE_CHOICE) {
        if (!answer.selectedOptionIds || answer.selectedOptionIds.length === 0) {
          throw new BadRequestException(`Soru ${question.id} için en az bir seçim yapılmalıdır.`);
        }
      } else if (question.questionType === PollQuestionType.SHORT_TEXT || question.questionType === PollQuestionType.LONG_TEXT) {
        if (!answer.answerText || answer.answerText.trim().length === 0) {
          throw new BadRequestException(`Soru ${question.id} için metin yanıtı gereklidir.`);
        }
      } else if (question.questionType === PollQuestionType.NUMBER) {
        if (answer.answerNumber === undefined || answer.answerNumber === null) {
          throw new BadRequestException(`Soru ${question.id} için sayısal yanıt gereklidir.`);
        }
      } else if (question.questionType === PollQuestionType.DATE) {
        if (!answer.answerDate) {
          throw new BadRequestException(`Soru ${question.id} için tarih yanıtı gereklidir.`);
        }
      }
    }
  }

  async getStatistics(pollId: number): Promise<any> {
    await this.findOne(pollId);
    return this.statisticsService.getPollStatistics(pollId);
  }

  async exportPoll(pollId: number, format: 'pdf' | 'excel', includeRawData: boolean = false): Promise<Buffer> {
    await this.findOne(pollId);
    return this.exportService.exportPoll(pollId, { format, includeRawData });
  }

  async findForUser(userId: number, siteId?: number, unitIds?: number[]): Promise<Poll[]> {
    const allPolls = await this.pollRepository.findAll();
    return allPolls.filter(poll => poll.canBeViewedBy(userId, siteId, unitIds) && poll.isActive());
  }
}

