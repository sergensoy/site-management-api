export interface ITaskHandler {
  name: string;                    // Unique handler identifier
  description: string;              // Handler açıklaması
  version?: string;                 // Handler versiyonu
  
  execute(
    payload: any, 
    context: TaskContext
  ): Promise<TaskResult>;
  
  validate?(payload: any): boolean; // Opsiyonel payload validation
  onError?(error: Error, context: TaskContext): Promise<void>; // Error handling
}

export interface TaskContext {
  taskId: number;
  executionId: number;
  userId?: number;
  startedAt: Date;
  retryCount: number;
}

export interface TaskResult {
  success: boolean;
  data?: any;
  message?: string;
  metadata?: Record<string, any>;
}

