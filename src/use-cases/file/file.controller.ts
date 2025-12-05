import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { FileService } from './file.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FilterFileDto } from './dto/filter-file.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/common/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/common/decorators/require-permission.decorator';
import { DefineResource } from '../../infrastructure/common/decorators/define-resource.decorator';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
@DefineResource('file', 'Dosya')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @RequirePermissions('file.create')
  @ApiOperation({ summary: 'Tek dosya yükle' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        category: {
          type: 'string',
          enum: ['EXPENSE', 'ANNOUNCEMENT', 'CONTRACT', 'GENERAL', 'REPORT', 'INVOICE'],
        },
        description: {
          type: 'string',
        },
        entityType: {
          type: 'string',
        },
        entityId: {
          type: 'number',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Dosya yüklenmedi');
    }
    return this.fileService.uploadFile(file, dto, req.user.id);
  }

  @Post('upload/multiple')
  @RequirePermissions('file.create')
  @ApiOperation({ summary: 'Çoklu dosya yükle' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        category: {
          type: 'string',
          enum: ['EXPENSE', 'ANNOUNCEMENT', 'CONTRACT', 'GENERAL', 'REPORT', 'INVOICE'],
        },
        description: {
          type: 'string',
        },
        entityType: {
          type: 'string',
        },
        entityId: {
          type: 'number',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10)) // Maksimum 10 dosya
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadFileDto,
    @Request() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Dosya yüklenmedi');
    }
    return this.fileService.uploadFiles(files, dto, req.user.id);
  }

  @Get()
  @RequirePermissions('file.view')
  @ApiOperation({ summary: 'Dosya listesi' })
  findAll(@Query() filterDto: FilterFileDto) {
    return this.fileService.findAll(filterDto);
  }

  @Get(':id')
  @RequirePermissions('file.view')
  @ApiOperation({ summary: 'Dosya detayı' })
  @ApiParam({ name: 'id', type: 'number' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fileService.findById(id);
  }

  @Get(':id/download')
  @RequirePermissions('file.view')
  @ApiOperation({ summary: 'Dosya indir' })
  @ApiParam({ name: 'id', type: 'number' })
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { stream, file } = await this.fileService.downloadFile(id);
    
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.originalName)}"`,
    );
    
    stream.pipe(res);
  }

  @Get('entity/:entityType/:entityId')
  @RequirePermissions('file.view')
  @ApiOperation({ summary: 'Entity\'ye bağlı dosyaları getir' })
  @ApiParam({ name: 'entityType', type: 'string' })
  @ApiParam({ name: 'entityId', type: 'number' })
  findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number,
  ) {
    return this.fileService.findByEntity(entityType, entityId);
  }

  @Post(':id/attach')
  @RequirePermissions('file.update')
  @ApiOperation({ summary: 'Dosyayı entity\'ye bağla' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiQuery({ name: 'entityType', type: 'string' })
  @ApiQuery({ name: 'entityId', type: 'number' })
  attachFile(
    @Param('id', ParseIntPipe) fileId: number,
    @Request() req: any,
    @Query('entityType') entityType: string,
    @Query('entityId', ParseIntPipe) entityId: number,
    @Query('description') description?: string,
  ) {
    return this.fileService.attachFileToEntity(
      fileId,
      entityType,
      entityId,
      description,
      req.user.id,
    );
  }

  @Delete(':id')
  @RequirePermissions('file.delete')
  @ApiOperation({ summary: 'Dosyayı sil (soft delete)' })
  @ApiParam({ name: 'id', type: 'number' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.fileService.delete(id, req.user.id);
  }

  @Delete(':id/permanent')
  @RequirePermissions('file.delete')
  @ApiOperation({ summary: 'Dosyayı kalıcı olarak sil' })
  @ApiParam({ name: 'id', type: 'number' })
  deletePermanently(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.fileService.deletePermanently(id, req.user.id);
  }

  @Delete('attachment/:attachmentId')
  @RequirePermissions('file.update')
  @ApiOperation({ summary: 'Attachment\'ı sil' })
  @ApiParam({ name: 'attachmentId', type: 'number' })
  detachFile(@Param('attachmentId', ParseIntPipe) attachmentId: number) {
    return this.fileService.detachFile(attachmentId);
  }
}

