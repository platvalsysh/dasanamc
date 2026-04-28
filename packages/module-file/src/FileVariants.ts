import { type StoredFileVariants, type VariantKey, type StoredVariant } from "./types";

export class FileVariants {
  private variants: StoredFileVariants;

  constructor(variants: StoredFileVariants = {}) {
    this.variants = variants;
  }

  static parse(value: unknown): FileVariants {
    let parsed: StoredFileVariants = {};
    
    if (typeof value === 'string') {
      try {
        const json = JSON.parse(value);
        if (typeof json === 'object' && json !== null) {
           parsed = json;
        }
      } catch (e) {
        // failed to parse
      }
    } else if (typeof value === 'object' && value !== null) {
      parsed = value as StoredFileVariants;
    }

    return new FileVariants(parsed);
  }

  set(key: VariantKey, variant: StoredVariant) {
    this.variants[key] = variant;
  }

  toJSON(): StoredFileVariants {
    return this.variants;
  }

  get data(): StoredFileVariants {
    return this.variants;
  }

  get hasVariants(): boolean {
    return Object.keys(this.variants).length > 0;
  }
}
