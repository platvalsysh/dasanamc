export interface ImageVariant {
  width: number;
  height: number;
  size: number;
  format: string;
  ext: string;
  key: VariantKey;
}

export interface StoredVariant extends ImageVariant {
  path: string;
}

export type VariantKey = "small" | "medium" | "large";

export type StoredFileVariants = {
  [key in VariantKey]?: StoredVariant;
};
