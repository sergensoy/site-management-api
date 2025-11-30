// src/core/constants/permissions.ts

// Sadece Otomatik Tarama ile (CRUD) bulunamayacak ÖZEL izinler burada kalır.
// Controller'ı olmayan veya özel iş mantığı gerektirenler.

export const PERMISSIONS = [
  // FINANS ÖZEL
  { slug: 'finance.run_accrual', description: 'Aidat Tahakkuk Çalıştırma', module: 'FINANCE' },
  
  // ANKET ÖZEL
  { slug: 'poll.vote', description: 'Oy Kullanma', module: 'POLLS' },
  
  // YÖNETİM ÖZEL
  { slug: 'rbac.assign_users', description: 'Kullanıcıya Rol Atama', module: 'ROLES' },
  { slug: 'rbac.manage_roles', description: 'Rol Yönetimi', module: 'ROLES' }, // Eğer RoleController'da @DefineResource kullanmazsak burada kalsın
];