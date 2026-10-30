import { describe, expect, it } from 'vitest';
import { timelineItems, timelineLayoutAlternate, timelineMode } from './timeline.engine';

describe('Timeline source data mapping', () => {
  it('normalizes legacy mode without rewriting legacy per-item positions', () => {
    expect(timelineMode('left')).toBe('start');
    expect(timelineMode('right')).toBe('end');
    expect(timelineMode()).toBe('start');
    const items = timelineItems(
      [{ position: 'left' }, { placement: 'end', position: 'right' }],
      'alternate',
      'loading'
    );

    expect(items.map(item => item.class)).toEqual(
      ['ant-timeline-item-placement-left', 'ant-timeline-item-placement-end']
    );
  });
  it('assigns alternate positions before reverse and preserves owner data', () => {
    const source = Object.freeze(
      [
        Object.freeze({ key: 'one', content: 'One' }),
        Object.freeze({ key: 'two', content: 'Two' }),
        Object.freeze({ key: 'three', content: 'Three' })
      ]
    );
    const items = timelineItems(source, 'alternate', 'loading', undefined, undefined, true);

    expect(items.map(item => item.content)).toEqual(['Three', 'Two', 'One']);
    expect(items.map(item => item.class)).toEqual(
      [
        'ant-timeline-item-placement-start',
        'ant-timeline-item-placement-end',
        'ant-timeline-item-placement-start'
      ]
    );
    expect(source[0].key).toBe('one');
  });
  it('keeps nullish alias priority and replaces falsy icons only for loading items', () => {
    const items = timelineItems(
      [
        {
          title: 0,
          label: 'Fallback',
          content: false,
          children: 'Ignored',
          loading: true,
          icon: 0,
          dot: 'Ignored dot'
        },
        { title: null, label: 'Legacy', content: null, children: 0, icon: true, loading: true }
      ],
      'start',
      'loading'
    );

    expect(items[0]).toMatchObject(
      { title: 0, content: false, icon: 'loading', status: 'process' }
    );
    expect(items[1]).toMatchObject(
      { title: 'Legacy', content: 0, icon: true, status: 'process' }
    );
  });
  it('keeps source truthiness for pending and nullish priority for pendingDot', () => {
    expect(timelineItems([], 'start', 'loading', 0)).toEqual([]);
    expect(timelineItems([], 'start', 'loading', false)).toEqual([]);
    expect(timelineItems([], 'start', 'loading', true, 0)).toEqual(
      [{ content: true, icon: 0, status: 'process' }]
    );
    expect(timelineItems([{ content: 'One' }], 'start', 'loading', 'Pending', null, true)[0])
      .toMatchObject(
        { content: 'Pending', icon: 'loading', status: 'process' }
      );
  });
  it('uses preset classes and lets inline styles override custom colors', () => {
    const items = timelineItems(
      [
        { color: 'red' },
        { color: '#123456', style: '--ant-cmp-steps-item-icon-dot-color:orange' }
      ],
      'end',
      'loading'
    );

    expect(items[0].class).toContain('ant-timeline-item-color-red');
    expect(items[1].style).toBe(
      '--ant-cmp-steps-item-icon-dot-color:#123456;--ant-cmp-steps-item-icon-dot-color:orange'
    );
    expect(items[1].class).not.toContain('color-');
  });
  it('uses truthy titles for vertical alternate layout but not horizontal layout', () => {
    expect(timelineLayoutAlternate('start', 'vertical', [{ title: 0 }])).toBe(false);
    expect(timelineLayoutAlternate('start', 'vertical', [{ title: true }])).toBe(true);
    expect(timelineLayoutAlternate('start', 'horizontal', [{ title: 'Title' }])).toBe(false);
    expect(timelineLayoutAlternate('alternate', 'horizontal', [])).toBe(true);
  });
});
