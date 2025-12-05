# Site Management API

Site ve apartman yönetimi için geliştirilmiş, Clean Architecture prensiplerine uygun NestJS tabanlı RESTful API.

## Özellikler

### Temel Modüller
- **Authentication & Authorization**: JWT tabanlı kimlik doğrulama ve Role-Based Access Control (RBAC)
- **User Management**: Kullanıcı yönetimi, rol atama, şifre değiştirme
- **Role & Permission Management**: Dinamik rol ve yetki yönetimi sistemi
- **Site Management**: Site, blok ve daire yönetimi
- **Residency Management**: İkamet kayıtları ve taşınma işlemleri
- **Finance Management**: 
  - Gider yönetimi (Expense)
  - Borç yönetimi (Debt)
  - Ödeme yönetimi (Payment) - Transaction destekli
- **Scheduled Tasks**: Dinamik görev zamanlama ve robot sistemi
- **Notification System**: Email ve SMS bildirim sistemi (event-driven)
- **File Management**: Dosya yükleme, indirme ve yönetim sistemi
- **Announcement System**: Gelişmiş duyuru yönetim sistemi (kategoriler, öncelikler, hedef kitle, okunma takibi)

### Teknik Özellikler
- **Clean Architecture**: Core, Infrastructure, Use-Cases katmanları
- **Prisma ORM**: Type-safe veritabanı erişimi
- **MySQL**: İlişkisel veritabanı
- **Swagger/OpenAPI**: Otomatik API dokümantasyonu
- **Audit Logging**: Tüm CRUD işlemlerinin otomatik loglanması
- **Soft Delete**: Veri silme işlemlerinde soft delete mekanizması
- **Validation**: DTO tabanlı veri doğrulama (class-validator)
- **Scheduled Task System**: Handler-based plugin mimarisi ile dinamik görev yönetimi
- **Event-Driven Architecture**: Event emitter ile asenkron bildirim sistemi
- **File Storage**: Local storage (cloud storage desteği için hazır)

## Mimari Yapı

```
src/
├── core/                    # Domain Layer
│   ├── entities/            # Domain entities
│   ├── repositories/       # Repository interfaces
│   ├── constants/          # Domain constants
│   ├── interfaces/         # Domain interfaces
│   └── events/            # Domain events
├── infrastructure/         # Infrastructure Layer
│   ├── prisma/             # Prisma service & module
│   ├── repositories/      # Repository implementations
│   ├── mappers/            # Domain-Persistence mappers
│   └── common/             # Guards, Decorators, Services, Listeners
└── use-cases/              # Application Layer
    ├── auth/               # Authentication
    ├── user/               # User management
    ├── role/               # Role management
    ├── site/               # Site management
    ├── block/              # Block management
    ├── unit/               # Unit management
    ├── residency/          # Residency management
    ├── expense/            # Expense management
    ├── debt/               # Debt management
    ├── payment/            # Payment management
    ├── scheduled-task/     # Scheduled task management
    ├── notification/       # Notification management
    ├── notification-template/ # Notification template management
    ├── notification-preference/ # User notification preferences
    ├── file/                # File management
    └── announcement/        # Announcement management
```

## Kurulum

### Gereksinimler
- Node.js (v18 veya üzeri)
- MySQL (v8.0 veya üzeri)
- npm veya yarn

### Adımlar

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Veritabanı bağlantısını yapılandırın:**
`.env` dosyası oluşturun:
```env
DATABASE_URL="mysql://user:password@localhost:3306/site_management"
JWT_SECRET="your-secret-key"

# SMTP Configuration (Email için - opsiyonel)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your-email@gmail.com"

# File Upload Configuration (opsiyonel)
UPLOADS_DIR="./uploads"
```

3. **Veritabanı migration'larını çalıştırın:**
```bash
npx prisma migrate dev
```

4. **Veritabanını seed edin (opsiyonel):**
```bash
npx prisma db seed
```

5. **Uygulamayı başlatın:**
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## API Dokümantasyonu

Uygulama başlatıldıktan sonra Swagger dokümantasyonuna erişebilirsiniz:
- **URL**: `http://localhost:3000/api`

## API Endpoints

### Authentication
- `POST /auth/login` - Kullanıcı girişi

### User Management
- `POST /users` - Kullanıcı oluştur
- `GET /users` - Kullanıcı listesi (filtreleme destekli)
- `GET /users/:id` - Kullanıcı detayı
- `PATCH /users/:id` - Kullanıcı güncelle
- `DELETE /users/:id` - Kullanıcı sil
- `PATCH /users/:id/password` - Şifre değiştir
- `PATCH /users/:id/role` - Rol ata
- `PATCH /users/:id/activate` - Kullanıcıyı aktif et
- `PATCH /users/:id/deactivate` - Kullanıcıyı pasif et

### Role Management
- `POST /roles` - Rol oluştur
- `GET /roles` - Rol listesi
- `PUT /roles/:id/permissions` - Rol yetkilerini güncelle

### Site Management
- `POST /sites` - Site oluştur
- `GET /sites` - Site listesi
- `GET /sites/:id` - Site detayı
- `PATCH /sites/:id` - Site güncelle
- `DELETE /sites/:id` - Site sil

### Block Management
- `POST /blocks` - Blok oluştur
- `GET /blocks/site/:siteId` - Site'e ait blokları getir
- `GET /blocks/:id` - Blok detayı
- `PATCH /blocks/:id` - Blok güncelle
- `DELETE /blocks/:id` - Blok sil

### Unit Management
- `POST /units` - Daire oluştur
- `GET /units/block/:blockId` - Bloğa ait daireleri getir
- `GET /units/:id` - Daire detayı
- `PATCH /units/:id` - Daire güncelle
- `DELETE /units/:id` - Daire sil

### Residency Management
- `POST /residencies` - İkamet kaydı oluştur
- `GET /residencies` - İkamet kayıtları listesi
- `GET /residencies/:id` - İkamet kaydı detayı
- `PATCH /residencies/:id` - İkamet kaydı güncelle
- `POST /residencies/:id/move-out` - Taşınma işlemi

### Expense Management
- `POST /expenses` - Gider oluştur
- `GET /expenses` - Gider listesi (filtreleme destekli)
- `GET /expenses/:id` - Gider detayı
- `PATCH /expenses/:id` - Gider güncelle
- `DELETE /expenses/:id` - Gider sil
- `GET /expenses/:id/files` - Gidere bağlı dosyaları getir

### Debt Management
- `POST /debts` - Borç oluştur
- `GET /debts` - Borç listesi (filtreleme destekli)
- `GET /debts/:id` - Borç detayı
- `PATCH /debts/:id` - Borç güncelle
- `DELETE /debts/:id` - Borç sil

### Payment Management
- `POST /payments` - Ödeme oluştur (Transaction destekli)
- `GET /payments` - Ödeme listesi (filtreleme destekli)
- `GET /payments/:id` - Ödeme detayı
- `GET /payments/debt/:debtId` - Borca ait ödemeleri getir
- `GET /payments/debt/:debtId/remaining` - Kalan borç tutarını getir
- `PATCH /payments/:id/cancel` - Ödemeyi iptal et

### Scheduled Task Management
- `POST /tasks` - Görev oluştur
- `GET /tasks` - Görev listesi (filtreleme destekli)
- `GET /tasks/handlers` - Mevcut handler'ları listele
- `GET /tasks/:id` - Görev detayı
- `PATCH /tasks/:id` - Görev güncelle
- `DELETE /tasks/:id` - Görev sil
- `POST /tasks/:id/execute` - Görevi manuel çalıştır
- `PATCH /tasks/:id/pause` - Görevi duraklat
- `PATCH /tasks/:id/resume` - Görevi devam ettir
- `GET /tasks/:id/executions` - Görev çalıştırma geçmişi

### Notification Management
- `GET /notifications` - Bildirim listesi (filtreleme destekli)
- `GET /notifications/:id` - Bildirim detayı
- `PATCH /notifications/:id/read` - Bildirimi okundu olarak işaretle

### Notification Template Management
- `POST /notification-templates` - Template oluştur
- `GET /notification-templates` - Template listesi (filtreleme destekli)
- `GET /notification-templates/:id` - Template detayı
- `PATCH /notification-templates/:id` - Template güncelle
- `DELETE /notification-templates/:id` - Template sil

### Notification Preference Management
- `POST /notification-preferences` - Bildirim tercihi oluştur
- `GET /notification-preferences` - Kullanıcının bildirim tercihleri
- `PATCH /notification-preferences/:id` - Bildirim tercihini güncelle
- `DELETE /notification-preferences/:id` - Bildirim tercihini sil

### File Management
- `POST /files/upload` - Tek dosya yükle
- `POST /files/upload/multiple` - Çoklu dosya yükle
- `GET /files` - Dosya listesi (filtreleme destekli)
- `GET /files/:id` - Dosya detayı
- `GET /files/:id/download` - Dosya indir
- `GET /files/entity/:entityType/:entityId` - Entity'ye bağlı dosyaları getir
- `POST /files/:id/attach` - Dosyayı entity'ye bağla
- `DELETE /files/:id` - Dosyayı sil (soft delete)
- `DELETE /files/:id/permanent` - Dosyayı kalıcı olarak sil
- `DELETE /files/attachment/:attachmentId` - Attachment'ı sil

### Announcement Management
- `POST /announcements` - Duyuru oluştur
- `GET /announcements` - Duyuru listesi (filtreleme destekli)
- `GET /announcements/my` - Kullanıcının görebileceği duyurular
- `GET /announcements/unread` - Okunmamış duyurular
- `GET /announcements/:id` - Duyuru detayı
- `PATCH /announcements/:id` - Duyuru güncelle
- `DELETE /announcements/:id` - Duyuru sil
- `PATCH /announcements/:id/publish` - Duyuruyu yayınla
- `PATCH /announcements/:id/archive` - Duyuruyu arşivle
- `PATCH /announcements/:id/pin` - Duyuruyu sabitle/kaldır
- `GET /announcements/:id/readers` - Duyuruyu okuyan kullanıcılar
- `GET /announcements/:id/statistics` - Duyuru istatistikleri
- `POST /announcements/:id/read` - Duyuruyu okundu olarak işaretle
- `POST /announcements/read-all` - Tüm duyuruları okundu olarak işaretle (query: announcementIds)
- `GET /announcements/:id/files` - Duyuruya bağlı dosyalar

## Scheduled Task System

Sistem, handler-based plugin mimarisi ile çalışan dinamik bir görev zamanlama sistemi içerir.

### Handler Oluşturma

Yeni bir task handler oluşturmak için:

1. `src/task-handlers/` dizininde yeni bir handler dosyası oluşturun:
```typescript
import { Injectable } from '@nestjs/common';
import { ITaskHandler, TaskContext, TaskResult } from '../../core/interfaces/i-task-handler';
import { TaskHandler } from '../../infrastructure/common/decorators/task-handler.decorator';

@Injectable()
@TaskHandler('my-custom-handler')
export class MyCustomHandler implements ITaskHandler {
  async execute(payload: any, context: TaskContext): Promise<TaskResult> {
    // Task logic buraya
    return {
      success: true,
      message: 'Task completed successfully',
      data: {},
    };
  }
}
```

2. Handler'ı `TaskHandlersModule`'e ekleyin.

3. Handler'ı kullanarak bir task oluşturun:
```bash
POST /tasks
{
  "name": "My Custom Task",
  "description": "Task description",
  "handlerName": "my-custom-handler",
  "scheduleType": "CRON",
  "cronExpression": "0 0 * * *",
  "status": "ACTIVE"
}
```

### Mevcut Handler'lar
- `monthly-dues-report` - Aylık aidat raporu oluşturur
- `accrue-monthly-dues` - Aylık aidat tahakkuku yapar
- `check-overdue-debts` - Vadesi geçen borçları kontrol eder
- `cleanup-old-data` - Eski verileri temizler
- `cleanup-deleted-files` - Silinmiş dosyaları kalıcı olarak temizler (30 günden eski)
- `archive-expired-announcements` - Süresi dolan duyuruları otomatik olarak arşivler

### Schedule Tipleri
- **CRON**: Cron expression ile zamanlama (örn: `0 0 * * *` - her gün gece yarısı)
- **INTERVAL**: Belirli aralıklarla çalıştırma (örn: her 5 dakikada bir)
- **ONCE**: Tek seferlik çalıştırma

## Notification System

Sistem, event-driven mimari ile çalışan profesyonel bir bildirim sistemi içerir.

### Özellikler
- **Email Notifications**: Nodemailer ile email gönderimi
- **SMS Notifications**: Mock implementation (gerçek SMS provider entegrasyonu için hazır)
- **Template Engine**: Dinamik template rendering
- **Event-Driven**: Sistem event'lerine otomatik bildirim gönderimi
- **User Preferences**: Kullanıcı bazlı bildirim tercihleri
- **Notification Queue**: Asenkron bildirim işleme

### Event'ler
Sistem aşağıdaki event'leri otomatik olarak dinler:
- `UserCreatedEvent` - Yeni kullanıcı oluşturulduğunda
- `DebtCreatedEvent` - Yeni borç oluşturulduğunda
- `PaymentCreatedEvent` - Ödeme yapıldığında
- `DebtOverdueEvent` - Borç vadesi geçtiğinde
- `AnnouncementPublishedEvent` - Duyuru yayınlandığında
- `AnnouncementExpiredEvent` - Duyuru süresi dolduğunda

### Template Kullanımı
Bildirim template'leri değişken desteği ile çalışır:
```typescript
// Template örneği
{
  "subject": "Hoş geldiniz {{userName}}!",
  "body": "Merhaba {{userName}}, hesabınız oluşturuldu."
}
```

## File Management System

Sistem, polymorphic ilişkilerle çalışan profesyonel bir dosya yönetim sistemi içerir.

### Özellikler
- **File Upload**: Tek veya çoklu dosya yükleme
- **File Validation**: MIME type, dosya boyutu, uzantı kontrolü
- **Polymorphic Attachments**: Herhangi bir entity'ye dosya bağlama (Expense, Site, Unit, vb.)
- **Local Storage**: Tarih bazlı klasör yapısı (YYYY/MM/DD)
- **Soft Delete**: Dosya silme işlemlerinde soft delete
- **Cleanup Task**: 30 günden eski silinmiş dosyaları otomatik temizleme
- **Secure Naming**: UUID + original name ile güvenli dosya isimlendirme

### Desteklenen Dosya Tipleri
- **Documents**: PDF, DOC, DOCX, XLS, XLSX
- **Images**: JPEG, PNG, GIF, WEBP
- **Archives**: ZIP, RAR
- **Text**: TXT, CSV

### Dosya Kategorileri
- `EXPENSE` - Gider dosyaları
- `ANNOUNCEMENT` - Duyuru dosyaları
- `CONTRACT` - Sözleşme dosyaları
- `GENERAL` - Genel dosyalar
- `REPORT` - Rapor dosyaları
- `INVOICE` - Fatura dosyaları

## Announcement System

Sistem, gelişmiş özelliklerle donatılmış profesyonel bir duyuru yönetim sistemi içerir.

### Özellikler
- **Kategori Yönetimi**: Duyuruları kategorilere ayırma (Genel, Bakım, Finans, Acil, Etkinlik)
- **Öncelik Seviyeleri**: Düşük, Normal, Yüksek, Acil öncelik seviyeleri
- **Hedef Kitle**: Duyuruları tüm sakinlere, belirli site/blok/daireye veya rollere yönlendirme
- **Yayın Tarihleri**: Planlı yayınlama ve son geçerlilik tarihi desteği
- **Okunma Takibi**: Kullanıcıların hangi duyuruları okuduğunu takip etme
- **Dosya Eklentileri**: Duyurulara dosya ekleme desteği
- **Otomatik Arşivleme**: Süresi dolan duyuruları otomatik arşivleme (scheduled task)
- **Bildirim Entegrasyonu**: Duyuru yayınlandığında otomatik bildirim gönderimi
- **İstatistikler**: Okunma oranları ve istatistikler

### Duyuru Durumları
- `DRAFT` - Taslak (henüz yayınlanmamış)
- `PUBLISHED` - Yayınlanmış (aktif)
- `ARCHIVED` - Arşivlenmiş (süresi dolmuş veya manuel arşivlenmiş)
- `CANCELED` - İptal edilmiş

### Duyuru Kategorileri
- `GENERAL` - Genel duyurular
- `MAINTENANCE` - Bakım duyuruları
- `FINANCE` - Finansal duyurular
- `EMERGENCY` - Acil duyurular
- `EVENT` - Etkinlik duyuruları

### Öncelik Seviyeleri
- `LOW` - Düşük öncelik
- `NORMAL` - Normal öncelik
- `HIGH` - Yüksek öncelik
- `URGENT` - Acil öncelik

### Hedef Kitle Tipleri
- `ALL_RESIDENTS` - Tüm sakinler
- `SPECIFIC_SITE` - Belirli bir site
- `SPECIFIC_BLOCK` - Belirli bir blok
- `SPECIFIC_UNIT` - Belirli bir daire
- `SPECIFIC_ROLES` - Belirli roller

### Kullanım Örneği
```bash
# Duyuru oluştur
POST /announcements
{
  "title": "Yıllık Genel Kurul Toplantısı",
  "content": "Toplantı 15 Ocak'ta yapılacaktır...",
  "category": "GENERAL",
  "priority": "HIGH",
  "targetAudienceType": "ALL_RESIDENTS",
  "publishAt": "2025-01-10T10:00:00Z",
  "expireAt": "2025-01-20T23:59:59Z",
  "fileIds": [1, 2, 3]
}

# Duyuruyu yayınla
PATCH /announcements/1/publish

# Duyuruyu okundu olarak işaretle
POST /announcements/1/read
```

## Yetkilendirme

Sistem, Role-Based Access Control (RBAC) kullanır. Her endpoint için gerekli yetkiler:

- `resource.view` - Görüntüleme yetkisi
- `resource.create` - Oluşturma yetkisi
- `resource.update` - Güncelleme yetkisi
- `resource.delete` - Silme yetkisi
- `rbac.manage_roles` - Rol yönetimi yetkisi

Yetkiler otomatik olarak controller'lardaki `@DefineResource` decorator'ı ile oluşturulur.

## Güvenlik

- JWT token tabanlı kimlik doğrulama
- Password hashing (bcrypt)
- Input validation (class-validator)
- SQL injection koruması (Prisma)
- Soft delete mekanizması
- Audit logging
- File type validation
- Secure file naming

## Veritabanı

Prisma ORM kullanılmaktadır. Schema değişiklikleri için:

```bash
# Migration oluştur
npx prisma migrate dev --name migration_name

# Prisma Studio'yu aç (GUI)
npx prisma studio
```

## Test

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Geliştirme

```bash
# Watch mode
npm run start:dev

# Build
npm run build

# Format code
npm run format

# Lint
npm run lint
```

## Teknolojiler

- **Framework**: NestJS 11
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: MySQL
- **Authentication**: JWT (Passport)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Scheduling**: cron (node-cron)
- **Email**: Nodemailer
- **File Upload**: Multer
- **Event System**: @nestjs/event-emitter

## Lisans

Bu proje özel bir projedir.
