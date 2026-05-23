import type { AssertionOrSet } from '@promptfoo/types';

const CONTEXT_ASSERTION_TYPES = new Set([
  'context-faithfulness',
  'context-relevance',
  'not-context-faithfulness',
  'not-context-relevance',
]);

function getAtomicAssertions(assertions: unknown[] | undefined): AssertionOrSet[] {
  return (assertions ?? []).flatMap((assertion) => {
    if (!assertion || typeof assertion !== 'object' || !('type' in assertion)) {
      return [];
    }

    const typedAssertion = assertion as AssertionOrSet;
    return typedAssertion.type === 'assert-set' && Array.isArray(typedAssertion.assert)
      ? typedAssertion.assert.filter((nestedAssertion) =>
          Boolean(
            nestedAssertion && typeof nestedAssertion === 'object' && 'type' in nestedAssertion,
          ),
        )
      : [typedAssertion];
  });
}

export function getRequiredAssertionVariables(assertions: unknown[] | undefined): string[] {
  const contextAssertions = getAtomicAssertions(assertions).filter((assertion) =>
    CONTEXT_ASSERTION_TYPES.has(assertion.type),
  );
  if (contextAssertions.length === 0) {
    return [];
  }

  const requiredVariables = ['query'];
  if (contextAssertions.some((assertion) => assertion.contextTransform === undefined)) {
    requiredVariables.push('context');
  }
  return requiredVariables;
}

function hasUsableVariable(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim() !== '';
  }

  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((entry) => typeof entry === 'string' && entry.trim() !== '')
  );
}

function hasUsableAssertionVariable(variable: string, value: unknown): boolean {
  return variable === 'query'
    ? typeof value === 'string' && value.trim() !== ''
    : hasUsableVariable(value);
}

export function getMissingAssertionVariables(
  assertions: unknown[] | undefined,
  vars: Record<string, unknown>,
): string[] {
  return getRequiredAssertionVariables(assertions).filter(
    (variable) => !hasUsableAssertionVariable(variable, vars[variable]),
  );
}
