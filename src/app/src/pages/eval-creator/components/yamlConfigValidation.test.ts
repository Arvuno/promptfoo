import { describe, expect, it } from 'vitest';
import { INVALID_FULL_CONFIG_YAML_MESSAGE, isFullYamlConfig } from './yamlConfigValidation';

describe('isFullYamlConfig', () => {
  it('rejects null, undefined, and primitives', () => {
    expect(isFullYamlConfig(null)).toBe(false);
    expect(isFullYamlConfig(undefined)).toBe(false);
    expect(isFullYamlConfig('providers: []')).toBe(false);
    expect(isFullYamlConfig(42)).toBe(false);
  });

  it('rejects arrays', () => {
    expect(isFullYamlConfig([{ vars: { x: 1 } }])).toBe(false);
  });

  it('rejects a single test case shape', () => {
    expect(isFullYamlConfig({ vars: { animal: 'penguin' } })).toBe(false);
    expect(isFullYamlConfig({ assert: [{ type: 'contains', value: 'safe' }] })).toBe(false);
    expect(isFullYamlConfig({ vars: {}, assert: [], options: {} })).toBe(false);
  });

  it('accepts a full UnifiedConfig shape', () => {
    expect(isFullYamlConfig({ providers: ['openai:gpt-4'], prompts: ['Hi'] })).toBe(true);
    expect(isFullYamlConfig({ tests: [{ vars: { a: 1 } }] })).toBe(true);
    expect(isFullYamlConfig({ redteam: { plugins: [] } })).toBe(true);
  });

  it('accepts an object that looks ambiguous when at least one full-config key is present', () => {
    expect(isFullYamlConfig({ vars: { a: 1 }, tests: [] })).toBe(true);
  });

  it('exports a stable error message', () => {
    expect(INVALID_FULL_CONFIG_YAML_MESSAGE).toMatch(/full configuration/i);
  });
});
