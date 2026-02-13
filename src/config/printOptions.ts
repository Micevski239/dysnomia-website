// Print options configuration
// These are the standard prices for all products

export type PrintType = 'canvas' | 'roll' | 'framed';

export interface PrintSize {
  id: string;
  label: string;
  width: number;
  height: number;
}

export interface PrintTypeOption {
  id: PrintType;
  label: string;
  labelMk: string;
}

export const printTypes: PrintTypeOption[] = [
  { id: 'canvas', label: 'Canvas Print', labelMk: 'Принт на Платно' },
  { id: 'roll', label: 'Roll Print', labelMk: 'Принт на Ролна' },
  { id: 'framed', label: 'Decorative Frame', labelMk: 'Декоративна Рамка' },
];

export const printSizes: PrintSize[] = [
  { id: '50x70', label: '50 x 70 см', width: 50, height: 70 },
  { id: '60x90', label: '60 x 90 см', width: 60, height: 90 },
  { id: '70x100', label: '70 x 100 см', width: 70, height: 100 },
  { id: '80x120', label: '80 x 120 см', width: 80, height: 120 },
  { id: '100x150', label: '100 x 150 см', width: 100, height: 150 },
];

// Price matrix: printType -> sizeId -> price (in MKD ден.)
export const priceMatrix: Record<PrintType, Record<string, number>> = {
  canvas: {
    '50x70': 2640,
    '60x90': 2930,
    '70x100': 3260,
    '80x120': 3460,
    '100x150': 3800,
  },
  roll: {
    '50x70': 1000,
    '60x90': 1150,
    '70x100': 1300,
    '80x120': 1700,
    '100x150': 2150,
  },
  framed: {
    '50x70': 5043,
    '60x90': 5596,
    '70x100': 6150,
    '80x120': 6765,
    '100x150': 7749,
  },
};

export function getPrice(printType: PrintType, sizeId: string): number {
  return priceMatrix[printType]?.[sizeId] ?? 0;
}

export function formatPriceMKD(price: number): string {
  return `${price.toLocaleString()} MKD`;
}
