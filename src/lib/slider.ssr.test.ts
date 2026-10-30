import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import Slider, { type SliderProps } from './Slider.svelte';

describe('Slider server rendering', () => {
  it(
    'renders a labelled native range with a numeric zero and one successful form control',
    () => {
      const { body } = render(
        Slider,
        { props: { value: 0, defaultValue: 50, name: 'volume', 'aria-label': 'Volume' } }
      );

      expect(body).toContain('type="range"');
      expect(body).toContain('value="0"');
      expect(body).toContain('aria-valuenow="0"');
      expect(body).toContain('aria-label="Volume"');
      expect(body.match(/name="volume"/g)).toHaveLength(1);
      expect(body).not.toContain('type="hidden"');
      expectTypeOf<NonNullable<SliderProps['onValueChange']>>().parameter(0).toEqualTypeOf<
        number
      >();
      expectTypeOf<NonNullable<SliderProps['onChangeComplete']>>().parameter(0).toEqualTypeOf<
        number
      >();
    }
  );

  it('renders a default with explicit fractional bounds and step', () => {
    const { body } = render(Slider, { props: { defaultValue: 0.3, min: 0, max: 1, step: 0.1 } });

    expect(body).toContain('value="0.3"');
    expect(body).toContain('min="0"');
    expect(body).toContain('max="1"');
    expect(body).toContain('step="0.1"');
    expect(body).toContain('aria-valuemin="0"');
    expect(body).toContain('aria-valuemax="1"');
  });

  it('normalizes an exceeded owner value for display without invoking either callback', () => {
    const fail = () => {
      throw new Error('Unexpected callback');
    };
    const { body } = render(
      Slider,
      { props: { value: 120, onValueChange: fail, onChangeComplete: fail } }
    );

    expect(body).toContain('value="100"');
    expect(body).toContain('aria-valuenow="100"');
    expect(body).toContain('left:100%');
  });

  it('exposes vertical orientation and reverses visual position', () => {
    const normal = render(Slider, { props: { value: 25, orientation: 'vertical' } }).body;
    const reverse = render(
      Slider,
      { props: { value: 25, orientation: 'vertical', reverse: true } }
    )
      .body;

    expect(normal).toContain('ant-slider-vertical');
    expect(normal).toContain('aria-orientation="vertical"');
    expect(normal).toContain('top:75%');
    expect(reverse).toContain('top:25%');
  });

  it('disables native interaction and submission and forwards external form ownership', () => {
    const {
      body
    } = render(
      Slider,
      { props: { disabled: true, name: 'volume', form: 'settings' } }
    );

    expect(body).toContain('ant-slider-disabled');
    expect(body).toContain('ant-slider-handle-disabled');
    expect(body).toMatch(/<input[^>]*\sdisabled(?:[\s=>])/);
    expect(body).toContain('form="settings"');
  });

  it('keeps non-finite values and invalid bounds out of ARIA and the form value', () => {
    const { body } = render(Slider, { props: { value: NaN, min: 5, max: 2, step: 0 } });

    expect(body).toContain('value="5"');
    expect(body).toContain('aria-valuemin="5"');
    expect(body).toContain('aria-valuemax="5"');
    expect(body).not.toContain('NaN');
    expect(body).not.toContain('Infinity');
  });

  it('escapes caller-provided accessible text', () => {
    const { body } = render(
      Slider,
      { props: { 'aria-label': '"><script>alert(1)</script>', 'aria-valuetext': 'Quiet & calm' } }
    );

    expect(body).not.toContain('<script>alert(1)</script>');
    expect(body).toContain('&quot;');
    expect(body).toContain('aria-valuetext="Quiet &amp; calm"');
  });

  it(
    'renders formatted tooltip text hidden until hydration and accepts placement and arrow options',
    () => {
      const { body } = render(
        Slider,
        {
          props: {
            value: 125,
            tooltip: {
              open: true,
              formatter: (value) => `${value}%`,
              placement: 'bottom',
              arrow: false
            }
          }
        }
      );

      expect(body.replace(/<!--.*?-->/g, '')).toContain('>100%</span>');
      expect(body).toContain('ant-tooltip-placement-bottom');
      expect(body).toMatch(/role="tooltip"[^>]*\shidden(?:[\s=>])/);
      expect(body).not.toContain('class="ant-tooltip-arrow');
    }
  );

  it('omits tooltip text for disabled controls and disabled formatters', () => {
    const format = () => 'Custom value';

    expect(
      render(Slider, { props: { value: 20, disabled: true, tooltip: { formatter: format } } }).body
    ).not.toContain(
      'Custom value'
    );
    expect(
      render(Slider, { props: { value: 20, tooltip: { formatter: null } } }).body.replace(
        /<!--.*?-->/g,
        ''
      )
    ).not.toContain(
      '>20</span>'
    );
    expect(
      render(Slider, { props: { value: 20, tooltip: false } }).body.replace(/<!--.*?-->/g, '')
    )
      .not
      .toContain(
        '>20</span>'
      );
  });
});
