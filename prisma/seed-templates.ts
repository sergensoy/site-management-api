import { PrismaClient } from '@prisma/client';
import { NotificationChannel } from '../src/core/entities/notification-channel.enum';

const prisma = new PrismaClient();

export async function seedNotificationTemplates() {
  console.log('Seeding notification templates...');

  const templates = [
    {
      code: 'payment.created',
      name: 'Ödeme Oluşturuldu',
      description: 'Ödeme yapıldığında gönderilen bildirim',
      category: 'PAYMENT',
      channel: NotificationChannel.EMAIL,
      subject: 'Ödeme Alındı - {{amount}} TL',
      bodyHtml: `
        <h2>Ödeme Alındı</h2>
        <p>Sayın {{userName}},</p>
        <p>{{amount}} TL tutarında ödemeniz alınmıştır.</p>
        <p>Ödeme ID: {{paymentId}}</p>
        <p>Teşekkürler.</p>
      `,
      bodyText: `
        Ödeme Alındı
        
        Sayın {{userName}},
        {{amount}} TL tutarında ödemeniz alınmıştır.
        Ödeme ID: {{paymentId}}
        
        Teşekkürler.
      `,
      variables: {
        userName: 'string',
        amount: 'number',
        paymentId: 'number',
      },
      isActive: true,
      isSystem: true,
    },
    {
      code: 'debt.created',
      name: 'Borç Oluşturuldu',
      description: 'Yeni borç oluşturulduğunda gönderilen bildirim',
      category: 'DEBT',
      channel: NotificationChannel.EMAIL,
      subject: 'Yeni Borç Bildirimi - {{amount}} TL',
      bodyHtml: `
        <h2>Yeni Borç Bildirimi</h2>
        <p>Sayın {{userName}},</p>
        <p>{{amount}} TL tutarında yeni bir borç kaydınız oluşturulmuştur.</p>
        <p>Son Ödeme Tarihi: {{dueDate}}</p>
        <p>Borç ID: {{debtId}}</p>
        <p>Lütfen ödemenizi zamanında yapınız.</p>
      `,
      bodyText: `
        Yeni Borç Bildirimi
        
        Sayın {{userName}},
        {{amount}} TL tutarında yeni bir borç kaydınız oluşturulmuştur.
        Son Ödeme Tarihi: {{dueDate}}
        Borç ID: {{debtId}}
        
        Lütfen ödemenizi zamanında yapınız.
      `,
      variables: {
        userName: 'string',
        amount: 'number',
        dueDate: 'date',
        debtId: 'number',
      },
      isActive: true,
      isSystem: true,
    },
    {
      code: 'debt.overdue',
      name: 'Vadesi Geçen Borç',
      description: 'Borç vadesi geçtiğinde gönderilen uyarı',
      category: 'DEBT',
      channel: NotificationChannel.EMAIL,
      subject: 'UYARI: Vadesi Geçen Borç - {{amount}} TL',
      bodyHtml: `
        <h2>Vadesi Geçen Borç Uyarısı</h2>
        <p>Sayın {{userName}},</p>
        <p><strong>{{amount}} TL</strong> tutarında borcunuzun vadesi geçmiştir.</p>
        <p>Vade Tarihi: {{dueDate}}</p>
        <p>Borç ID: {{debtId}}</p>
        <p>Lütfen en kısa sürede ödemenizi yapınız.</p>
      `,
      bodyText: `
        Vadesi Geçen Borç Uyarısı
        
        Sayın {{userName}},
        {{amount}} TL tutarında borcunuzun vadesi geçmiştir.
        Vade Tarihi: {{dueDate}}
        Borç ID: {{debtId}}
        
        Lütfen en kısa sürede ödemenizi yapınız.
      `,
      variables: {
        userName: 'string',
        amount: 'number',
        dueDate: 'date',
        debtId: 'number',
      },
      isActive: true,
      isSystem: true,
    },
    {
      code: 'welcome.email',
      name: 'Hoş Geldin E-postası',
      description: 'Yeni kullanıcı kaydı yapıldığında gönderilen hoş geldin e-postası',
      category: 'SYSTEM',
      channel: NotificationChannel.EMAIL,
      subject: 'Hoş Geldiniz - Site Yönetim Sistemi',
      bodyHtml: `
        <h2>Hoş Geldiniz!</h2>
        <p>Sayın {{userName}},</p>
        <p>Site Yönetim Sistemimize hoş geldiniz.</p>
        <p>E-posta adresiniz: {{email}}</p>
        <p>Sistemimizi kullanmaya başlayabilirsiniz.</p>
        <p>İyi günler dileriz.</p>
      `,
      bodyText: `
        Hoş Geldiniz!
        
        Sayın {{userName}},
        Site Yönetim Sistemimize hoş geldiniz.
        E-posta adresiniz: {{email}}
        
        Sistemimizi kullanmaya başlayabilirsiniz.
        İyi günler dileriz.
      `,
      variables: {
        userName: 'string',
        email: 'string',
      },
      isActive: true,
      isSystem: true,
    },
  ];

  for (const template of templates) {
    await prisma.notificationTemplate.upsert({
      where: { code: template.code },
      update: template,
      create: template,
    });
  }

  console.log('Notification templates seeded successfully!');
}

