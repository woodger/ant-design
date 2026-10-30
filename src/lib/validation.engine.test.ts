import { describe, expect, it } from 'vitest';
import { validateValue } from './validation.engine';

describe('validateValue', () => {
  it('rejects blank required text while preserving zero and false', async () => {
    expect(await validateValue('  ', {}, [{ required: true, message: 'Required' }])).toEqual(
      ['Required']
    );
    expect(await validateValue(0, {}, [{ required: true }])).toEqual([]);
    expect(await validateValue(false, {}, [{ required: true }])).toEqual([]);
  });

  it('allows empty optional values without running format rules', async () => {
    expect(await validateValue(undefined, {}, [{ min: 8, pattern: /@/ }])).toEqual([]);
  });

  it('compares string lengths and numeric values using their own units', async () => {
    expect(await validateValue('ab', {}, [{ min: 3, message: 'Too short' }])).toEqual(
      ['Too short']
    );
    expect(await validateValue(12, {}, [{ max: 10, message: 'Too large' }])).toEqual(
      ['Too large']
    );
    expect(await validateValue('🙂', {}, [{ min: 1, max: 1 }])).toEqual([]);
  });

  it(
    'runs a stateful regular expression consistently across repeated validations',
    async () => {
      const rule = { pattern: /^valid$/g };

      expect(await validateValue('valid', {}, [rule])).toEqual([]);
      expect(await validateValue('valid', {}, [rule])).toEqual([]);
      expect(rule.pattern.lastIndex).toBe(0);
    }
  );

  it('provides a snapshot of dependent values to an asynchronous validator', async () => {
    const errors = await validateValue('different', { password: 'secret' }, [{
      validator: async (value, values) => value === values.password ? undefined : 'Passwords differ'
    }]);

    expect(errors).toEqual(['Passwords differ']);
  });

  it('runs custom validation on an empty optional value', async () => {
    const errors = await validateValue('', {}, [{ validator: () => 'Custom rule' }]);

    expect(errors).toEqual(['Custom rule']);
  });

  it('turns a rejected validator into a field error', async () => {
    const errors = await validateValue('value', {}, [{
      validator: async () => {
        throw new Error('Unavailable');
      }
    }]);

    expect(errors).toEqual(['Unavailable']);
  });

  it('requires a nonempty array while retaining zero and false as valid items', async () => {
    expect(await validateValue([], {}, [{ required: true, message: 'Choose a role' }])).toEqual(
      ['Choose a role']
    );
    expect(await validateValue([0, false], {}, [{ required: true }])).toEqual([]);
    expect(await validateValue([], {}, [{ min: 2 }])).toEqual([]);
  });

  it('checks array item counts without coercing items to strings or numbers', async () => {
    expect(await validateValue([100], {}, [{ min: 2 }])).toEqual(['Минимальное количество: 2.']);
    expect(await validateValue(['a', 'b', 'c'], {}, [{ max: 2, message: 'Choose up to two' }]))
      .toEqual(
        ['Choose up to two']
      );
    expect(await validateValue([0, 1], {}, [{ min: 2, max: 2, pattern: /^never$/ }])).toEqual([]);
  });

  it('passes arrays to custom validators including empty optional selections', async () => {
    expect(
      await validateValue(
        [],
        {},
        [
          {
            validator: (value) => Array.isArray(value) && value.length === 0
              ? 'Custom empty'
              : undefined
          }
        ]
      )
    ).toEqual(
      ['Custom empty']
    );
    expect(
      await validateValue(
        [0],
        { allowed: [0, 2] },
        [
          {
            validator: (value, values) => Array
              .isArray(value)
              && value.every(
                (item) => values.allowed.includes(item)
              )
              ? undefined
              : 'Unknown item'
          }
        ]
      )
    ).toEqual(
      []
    );
  });
});
