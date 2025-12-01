import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplateEngineService {
  /**
   * Template'deki değişkenleri replace eder
   * Örnek: "Merhaba {{userName}}" -> "Merhaba Ahmet"
   */
  render(template: string, variables: Record<string, any>): string {
    let rendered = template;

    // Tüm değişkenleri replace et
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      rendered = rendered.replace(regex, this.formatValue(value));
    }

    return rendered;
  }

  /**
   * Değeri string'e çevirir
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toLocaleDateString('tr-TR');
    }

    if (typeof value === 'number') {
      // Para formatı için
      if (value % 1 !== 0) {
        return value.toFixed(2).replace('.', ',') + ' TL';
      }
      return value.toString();
    }

    return String(value);
  }

  /**
   * Template'deki eksik değişkenleri kontrol eder
   */
  validateTemplate(template: string, variables: Record<string, any>): {
    valid: boolean;
    missingVariables: string[];
  } {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = template.matchAll(regex);
    const requiredVariables = new Set<string>();

    for (const match of matches) {
      requiredVariables.add(match[1]);
    }

    const missingVariables = Array.from(requiredVariables).filter(
      (varName) => !(varName in variables),
    );

    return {
      valid: missingVariables.length === 0,
      missingVariables,
    };
  }
}

