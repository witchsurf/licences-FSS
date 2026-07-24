import { describe, expect, it } from 'vitest';
import { calculateFittedFontSize } from './AutoFitText';

describe('calculateFittedFontSize', () => {
  it('keeps the preferred size when the name fits', () => {
    expect(calculateFittedFontSize(100, 80, 12, 7)).toBe(12);
  });

  it('shrinks a long name instead of truncating it', () => {
    expect(calculateFittedFontSize(72, 90, 12, 7)).toBeCloseTo(9.6);
  });

  it('never becomes smaller than the readable minimum', () => {
    expect(calculateFittedFontSize(40, 200, 12, 7)).toBe(7);
  });

  it('handles an element before layout without shrinking it', () => {
    expect(calculateFittedFontSize(0, 90, 12, 7)).toBe(12);
  });
});
