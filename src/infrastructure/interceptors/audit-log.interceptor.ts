import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IAuditLogRepository } from '../../core/repositories/i-audit-log.repository';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    @Inject(IAuditLogRepository) private auditLogRepository: IAuditLogRepository,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, body, params, user } = request;
    const handler = context.getHandler();
    const controller = context.getClass();

    // Sadece CREATE, UPDATE, DELETE işlemlerini logla
    const actionMap: { [key: string]: string } = {
      POST: 'CREATE',
      PATCH: 'UPDATE',
      PUT: 'UPDATE',
      DELETE: 'DELETE',
    };

    const action = actionMap[method];
    if (!action) {
      // GET işlemlerini loglamayalım
      return next.handle();
    }

    // Resource adını controller'dan al
    const resourceName = controller.name.replace('Controller', '');

    // Old value ve new value'yu hazırla
    let oldValue = null;
    const newValue = body || params;

    // Async olarak logla (request'i bloklamasın)
    return next.handle().pipe(
      tap(async (response) => {
        try {
          // Async olarak log yaz (await kullanmıyoruz, hata olsa bile request devam etsin)
          this.auditLogRepository.log(
            action,
            resourceName,
            oldValue,
            response || newValue,
            user?.id,
          ).catch((err) => {
            // Log yazma hatası olsa bile request'i etkilemesin
            console.error('Audit log error:', err);
          });
        } catch (error) {
          // Hata olsa bile request'i etkilemesin
          console.error('Audit log error:', error);
        }
      }),
    );
  }
}

