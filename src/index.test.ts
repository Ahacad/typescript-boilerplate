import { greet } from './index';

describe('greet', () => {
  it('should greet a person', () => {
    expect(greet('John')).toBe('Hello, John!');
  });

  it('should handle empty string', () => {
    expect(greet('')).toBe('Hello, !');
  });
});
