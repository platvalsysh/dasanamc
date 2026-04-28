import { type VariantKey } from "./types";

export interface VariantConfig {
  key: VariantKey;
  width: number;
}

export const VARIANT_CONFIGS: VariantConfig[] = [
  { key: "small", width: 400 },
  { key: "medium", width: 800 },
  { key: "large", width: 1200 },
];
