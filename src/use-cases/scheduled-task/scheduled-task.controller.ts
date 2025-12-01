import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ScheduledTaskService } from './scheduled-task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/common/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/common/decorators/require-permission.decorator';
import { DefineResource } from '../../infrastructure/common/decorators/define-resource.decorator';

@Controller('tasks')
@DefineResource('task', 'Zamanlanmış Görev')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ScheduledTaskController {
  constructor(private readonly taskService: ScheduledTaskService) {}

  @Post()
  @RequirePermissions('task.create')
  create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    return this.taskService.create(createTaskDto, req.user.id);
  }

  @Get()
  @RequirePermissions('task.view')
  findAll(@Query() filterDto: FilterTaskDto) {
    return this.taskService.findAll(filterDto);
  }

  @Get('handlers')
  @RequirePermissions('task.view')
  getAvailableHandlers() {
    return this.taskService.getAvailableHandlers();
  }

  @Get(':id')
  @RequirePermissions('task.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('task.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ) {
    return this.taskService.update(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('task.delete')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.taskService.remove(id, req.user.id);
  }

  @Post(':id/execute')
  @RequirePermissions('task.execute')
  execute(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.execute(id);
  }

  @Patch(':id/pause')
  @RequirePermissions('task.manage')
  pause(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.taskService.pause(id, req.user.id);
  }

  @Patch(':id/resume')
  @RequirePermissions('task.manage')
  resume(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.taskService.resume(id, req.user.id);
  }

  @Get(':id/executions')
  @RequirePermissions('task.view')
  getExecutions(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.taskService.getExecutions(id, page || 1, limit || 10);
  }
}

