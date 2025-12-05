import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { PollService } from './poll.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { CreatePollQuestionDto } from './dto/create-poll-question.dto';
import { UpdatePollQuestionDto } from './dto/update-poll-question.dto';
import { SubmitPollResponseDto } from './dto/submit-poll-response.dto';
import { FilterPollDto } from './dto/filter-poll.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/common/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/common/decorators/require-permission.decorator';
import { DefineResource } from '../../infrastructure/common/decorators/define-resource.decorator';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FileService } from '../file/file.service';

@ApiTags('Polls')
@Controller('polls')
@DefineResource('poll', 'Anket')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@ApiBearerAuth()
export class PollController {
  constructor(
    private readonly pollService: PollService,
    private readonly fileService: FileService,
  ) {}

  @Post()
  @RequirePermissions('poll.create')
  @ApiOperation({ summary: 'Yeni anket oluştur' })
  @ApiResponse({ status: 201, description: 'Anket başarıyla oluşturuldu.' })
  @ApiResponse({ status: 400, description: 'Geçersiz istek.' })
  create(@Body() createPollDto: CreatePollDto, @Request() req: any) {
    return this.pollService.create(createPollDto, req.user.id);
  }

  @Get()
  @RequirePermissions('poll.view')
  @ApiOperation({ summary: 'Anket listesi (filtreleme destekli)' })
  @ApiResponse({ status: 200, description: 'Anketler başarıyla listelendi.' })
  findAll(@Query() filterDto: FilterPollDto, @Request() req: any) {
    return this.pollService.findAll(filterDto, req.user.id);
  }

  @Get('my')
  @RequirePermissions('poll.view')
  @ApiOperation({ summary: 'Kullanıcının görebileceği anketler' })
  @ApiQuery({ name: 'siteId', required: false, type: Number })
  @ApiQuery({ name: 'unitIds', required: false, type: String })
  findMy(
    @Request() req: any,
    @Query('siteId', new ParseIntPipe({ optional: true })) siteId?: number,
    @Query('unitIds') unitIds?: string,
  ) {
    const parsedUnitIds = unitIds ? unitIds.split(',').map(id => parseInt(id, 10)) : undefined;
    return this.pollService.findForUser(req.user.id, siteId, parsedUnitIds);
  }

  @Get(':id')
  @RequirePermissions('poll.view')
  @ApiOperation({ summary: 'Anket detayını getir' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Anket detayı başarıyla getirildi.' })
  @ApiResponse({ status: 404, description: 'Anket bulunamadı.' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.pollService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @RequirePermissions('poll.update')
  @ApiOperation({ summary: 'Anketi güncelle' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Anket başarıyla güncellendi.' })
  @ApiResponse({ status: 404, description: 'Anket bulunamadı.' })
  @ApiResponse({ status: 400, description: 'Yayınlanmış anketler güncellenemez.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePollDto: UpdatePollDto,
    @Request() req: any,
  ) {
    return this.pollService.update(id, updatePollDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('poll.delete')
  @ApiOperation({ summary: 'Anketi sil (soft delete)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 204, description: 'Anket başarıyla silindi.' })
  @ApiResponse({ status: 404, description: 'Anket bulunamadı.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.pollService.remove(id, req.user.id);
  }

  @Patch(':id/publish')
  @RequirePermissions('poll.update')
  @ApiOperation({ summary: 'Anketi yayınla' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Anket başarıyla yayınlandı.' })
  @ApiResponse({ status: 400, description: 'Anket zaten yayınlanmış veya geçersiz durumda.' })
  publish(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.pollService.publish(id, req.user.id);
  }

  @Patch(':id/close')
  @RequirePermissions('poll.update')
  @ApiOperation({ summary: 'Anketi kapat' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Anket başarıyla kapatıldı.' })
  @ApiResponse({ status: 400, description: 'Anket zaten kapatılmış durumda.' })
  close(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.pollService.close(id, req.user.id);
  }

  @Post(':id/questions')
  @RequirePermissions('poll.update')
  @ApiOperation({ summary: 'Ankete soru ekle' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 201, description: 'Soru başarıyla eklendi.' })
  @ApiResponse({ status: 400, description: 'Yayınlanmış anketlere soru eklenemez.' })
  addQuestion(
    @Param('id', ParseIntPipe) pollId: number,
    @Body() createQuestionDto: CreatePollQuestionDto,
    @Request() req: any,
  ) {
    return this.pollService.addQuestion(pollId, createQuestionDto, req.user.id);
  }

  @Patch(':id/questions/:questionId')
  @RequirePermissions('poll.update')
  @ApiOperation({ summary: 'Anket sorusunu güncelle' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiParam({ name: 'questionId', type: 'number' })
  @ApiResponse({ status: 200, description: 'Soru başarıyla güncellendi.' })
  @ApiResponse({ status: 400, description: 'Yayınlanmış anketlerdeki sorular güncellenemez.' })
  updateQuestion(
    @Param('id', ParseIntPipe) pollId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() updateQuestionDto: UpdatePollQuestionDto,
    @Request() req: any,
  ) {
    return this.pollService.updateQuestion(pollId, questionId, updateQuestionDto, req.user.id);
  }

  @Delete(':id/questions/:questionId')
  @RequirePermissions('poll.update')
  @ApiOperation({ summary: 'Anket sorusunu sil' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiParam({ name: 'questionId', type: 'number' })
  @ApiResponse({ status: 204, description: 'Soru başarıyla silindi.' })
  @ApiResponse({ status: 400, description: 'Yayınlanmış anketlerden soru silinemez.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeQuestion(
    @Param('id', ParseIntPipe) pollId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Request() req: any,
  ) {
    return this.pollService.removeQuestion(pollId, questionId, req.user.id);
  }

  @Post(':id/respond')
  @RequirePermissions('poll.view')
  @ApiOperation({ summary: 'Anket yanıtla' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 201, description: 'Yanıt başarıyla kaydedildi.' })
  @ApiResponse({ status: 400, description: 'Anket aktif değil veya geçersiz yanıt.' })
  @ApiResponse({ status: 409, description: 'Yanıt zaten verilmiş ve değiştirilemez.' })
  respond(
    @Param('id', ParseIntPipe) pollId: number,
    @Body() submitResponseDto: SubmitPollResponseDto,
    @Request() req: any,
  ) {
    return this.pollService.submitResponse(pollId, submitResponseDto, req.user.id);
  }

  @Patch(':id/response')
  @RequirePermissions('poll.view')
  @ApiOperation({ summary: 'Anket yanıtını güncelle' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Yanıt başarıyla güncellendi.' })
  @ApiResponse({ status: 400, description: 'Yanıt değiştirilemez.' })
  updateResponse(
    @Param('id', ParseIntPipe) pollId: number,
    @Body() submitResponseDto: SubmitPollResponseDto,
    @Request() req: any,
  ) {
    return this.pollService.updateResponse(pollId, submitResponseDto, req.user.id);
  }

  @Get(':id/statistics')
  @RequirePermissions('poll.view')
  @ApiOperation({ summary: 'Anket istatistikleri' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'İstatistikler başarıyla getirildi.' })
  getStatistics(@Param('id', ParseIntPipe) id: number) {
    return this.pollService.getStatistics(id);
  }

  @Get(':id/export')
  @RequirePermissions('poll.view')
  @ApiOperation({ summary: 'Anket sonuçlarını export et (PDF/Excel)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiQuery({ name: 'format', enum: ['pdf', 'excel'], required: false, description: 'Export formatı' })
  @ApiQuery({ name: 'includeRawData', type: Boolean, required: false, description: 'Ham veri dahil edilsin mi?' })
  @ApiResponse({ status: 200, description: 'Export başarıyla oluşturuldu.' })
  async exportPoll(
    @Param('id', ParseIntPipe) id: number,
    @Query('format') format: 'pdf' | 'excel' = 'pdf',
    @Query('includeRawData') includeRawData: string = 'false',
    @Res() res: Response,
  ) {
    const buffer = await this.pollService.exportPoll(id, format, includeRawData === 'true');
    const contentType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="poll-${id}-export.${extension}"`);
    res.send(buffer);
  }

  @Get(':id/files')
  @RequirePermissions('poll.view')
  @ApiOperation({ summary: 'Ankete bağlı dosyaları getir' })
  @ApiParam({ name: 'id', type: 'number' })
  getFiles(@Param('id', ParseIntPipe) id: number) {
    return this.fileService.findByEntity('Poll', id);
  }
}

