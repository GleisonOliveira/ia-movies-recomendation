type DecimalLike = {
  toNumber?: () => number;
};

export function decimalToNumber<T>(value: T): T {
  if (value && typeof value === 'object' && 'toNumber' in value) {
    const decimal = value as DecimalLike;

    if (typeof decimal.toNumber === 'function') {
      return decimal.toNumber() as T;
    }
  }

  return value;
}
