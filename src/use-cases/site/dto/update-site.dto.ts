import { PartialType } from '@nestjs/swagger'; // npm i @nestjs/swagger kurulu olmalı
import { CreateSiteDto } from './create-site.dto';
export class UpdateSiteDto extends PartialType(CreateSiteDto) {}