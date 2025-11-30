// src/core/constants/permissions.ts

// 1. Standart Eylemlerimiz
export const CRUD_ACTIONS = {
  VIEW: { suffix: 'view', desc: 'görüntüleme' },
  CREATE: { suffix: 'create', desc: 'oluşturma' },
  UPDATE: { suffix: 'update', desc: 'güncelleme' },
  DELETE: { suffix: 'delete', desc: 'silme' },
};

// 2. Modüllerimiz (Kaynaklar)
const RESOURCES = [
  { key: 'users', name: 'Kullanıcı' },
  { key: 'sites', name: 'Site' },
  { key: 'finance', name: 'Finans' },
  { key: 'roles', name: 'Rol' },
  { key: 'polls', name: 'Anket' },
  { key: 'files', name: 'Dosya' },
];

// 3. Özel (Standart Dışı) İzinler
// CRUD dışındaki özel işler buraya eklenir
const CUSTOM_PERMISSIONS = [
  { slug: 'finance.run_accrual', description: 'Aidat Tahakkuk Çalıştırma', module: 'FINANCE' },
  { slug: 'poll.vote', description: 'Oy Kullanma', module: 'POLLS' },
  { slug: 'rbac.assign_users', description: 'Kullanıcıya Rol Atama', module: 'ROLES' },
];

// 4. Otomatik Üretici Fonksiyon (Magic Happens Here ✨)
export const PERMISSIONS = [
  ...RESOURCES.flatMap(res => {
    return Object.values(CRUD_ACTIONS).map(action => ({
      slug: `${res.key}.${action.suffix}`, // Örn: users.create
      description: `${res.name} ${action.desc}`, // Örn: Kullanıcı oluşturma
      module: res.key.toUpperCase(), // Örn: USERS
    }));
  }),
  ...CUSTOM_PERMISSIONS
];