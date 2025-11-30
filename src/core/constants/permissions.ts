// src/core/constants/permissions.ts

// Standart CRUD izinleri (create, view, update, delete) artık 
// PermissionScannerService tarafından Controller'lar taranarak otomatik üretiliyor.
// Buraya SADECE özel (Custom) iş mantığı gerektiren izinleri yazın.

export const PERMISSIONS = [
  // FINANS ÖZEL
  { slug: 'finance.run_accrual', description: 'Aidat Tahakkuk Çalıştırma', module: 'FINANCE' },
  
  // ANKET ÖZEL
  { slug: 'poll.vote', description: 'Oy Kullanma', module: 'POLLS' },
  
  // YÖNETİM ÖZEL
  // rbac.manage_roles -> RoleController'da @DefineResource ile otomatik üretilecek.
  // rbac.assign_users -> Kullanıcıya rol atama özel bir işlemse burada kalabilir.
  { slug: 'rbac.assign_users', description: 'Kullanıcıya Rol Atama', module: 'ROLES' },
];