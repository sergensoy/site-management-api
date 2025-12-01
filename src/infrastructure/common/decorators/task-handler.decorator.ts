import { SetMetadata } from '@nestjs/common';

export const TASK_HANDLER_KEY = 'task_handler';

export interface TaskHandlerMetadata {
  name: string;
  description?: string;
  category?: string;
}

export const TaskHandler = (name: string, metadata?: Omit<TaskHandlerMetadata, 'name'>) => {
  return SetMetadata(TASK_HANDLER_KEY, {
    name,
    ...metadata,
  } as TaskHandlerMetadata);
};

