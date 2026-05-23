import { describe, expect, it } from 'vitest';
import { isFullYamlConfig } from './yamlConfigValidation';

describe('isFullYamlConfig', () => {
  it('accepts full configurations with provider and prompt fields', () => {
    expect(isFullYamlConfig({ providers: ['echo'], prompts: ['hello'] })).toBe(true);
  });

  it('rejects individual test cases that use non-vars test fields', () => {
    expect(
      isFullYamlConfig({
        provider: 'echo',
        prompts: ['Greeting prompt'],
        threshold: 0.8,
      }),
    ).toBe(false);
  });

  it('rejects prompt-only test filters rather than treating them as a full config', () => {
    expect(isFullYamlConfig({ prompts: ['Greeting prompt'] })).toBe(false);
  });
});
