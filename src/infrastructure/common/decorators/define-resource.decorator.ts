import { SetMetadata } from '@nestjs/common';

export const RESOURCE_DEFINITION_KEY = 'resource_definition';

export interface ResourceDefinition {
  key: string;       // Örn: 'users'
  name: string;      // Örn: 'Kullanıcı' (İnsan okuması için)
}

// Controller'ın tepesine koyacağımız etiket
export const DefineResource = (key: string, name: string) => 
  SetMetadata(RESOURCE_DEFINITION_KEY, { key, name });