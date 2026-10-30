import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Avatar from './Avatar.svelte';

const children = createRawSnippet(() => ({ render: () => '<strong>АН</strong>' }));
const icon = createRawSnippet(
  () => ({ render: () => '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>' })
);

describe('Avatar server rendering', () => {
  it('renders a named image and keeps its alternative name on the persistent root', () => {
    const body = render(
      Avatar,
      {
        props: {
          src: '/portrait.svg',
          srcSet: '/portrait@2x.svg 2x',
          alt: 'Анна Новикова',
          draggable: false,
          crossOrigin: 'anonymous'
        }
      }
    ).body;

    expect(body).toContain('role="img"');
    expect(body).toContain('aria-label="Анна Новикова"');
    expect(body).toContain('src="/portrait.svg"');
    expect(body).toContain('srcset="/portrait@2x.svg 2x"');
    expect(body).toContain('crossorigin="anonymous"');
    expect(body).toContain('draggable="false"');
    expect(body).toContain('alt=""');
    expect(body).toContain('ant-avatar-image');
    expect(body).not.toContain('tabindex');
    expect(body).not.toContain('aria-live');
  });
  it('renders a visible text fallback with the same name before hydration', () => {
    const body = render(
      Avatar,
      { props: { children, alt: 'Анна Новикова', shape: 'square', size: 'small' } }
    ).body;

    expect(body).toContain('<strong>АН</strong>');
    expect(body).toContain('ant-avatar-string');
    expect(body).toContain('ant-avatar-square');
    expect(body).toContain('ant-avatar-sm');
    expect(body).toContain('aria-label="Анна Новикова"');
    expect(body).toContain('inert');
    expect(body).not.toContain('<img');
  });
  it('gives image then icon priority over children', () => {
    const image = render(
      Avatar,
      { props: { src: '/portrait.svg', icon, children, alt: 'User' } }
    )
      .body;

    expect(image).toContain('<img');
    expect(image).not.toContain('<svg');
    expect(image).not.toContain('<strong>');
    const fallback = render(Avatar, { props: { icon, children, alt: 'User', size: 48 } }).body;

    expect(fallback).toContain('<svg');
    expect(fallback).toContain('ant-avatar-icon-content');
    expect(fallback).toContain('inert');
    expect(fallback).toContain('font-size: 24px');
    expect(fallback).not.toContain('<strong>');
  });
  it('treats unnamed content and explicitly hidden avatars as decorative', () => {
    const unnamed = render(Avatar, { props: { children } }).body;

    expect(unnamed).toContain('aria-hidden="true"');
    expect(unnamed).not.toContain('role=');
    const hidden = render(
      Avatar,
      { props: { src: '/portrait.svg', alt: 'User', 'aria-hidden': true } }
    ).body;

    expect(hidden).toContain('aria-hidden="true"');
    expect(hidden).not.toContain('role=');
  });
  it('forwards root names attributes and custom styling and preserves numeric geometry', () => {
    const body = render(
      Avatar,
      {
        props: {
          children,
          size: 50.5,
          id: 'profile',
          title: 'Profile',
          alt: 'Fallback',
          'aria-label': 'Owner name',
          'aria-describedby': 'hint',
          class: 'custom',
          style: 'background: red'
        }
      }
    ).body;

    expect(body).toContain('id="profile"');
    expect(body).toContain('title="Profile"');
    expect(body).toContain('aria-label="Owner name"');
    expect(body).toContain('aria-describedby="hint"');
    expect(body).toContain('custom');
    expect(body).toContain('background: red');
    expect(body).toContain('width: 50.5px');
    expect(body).toContain('height: 50.5px');
    expect(body).toContain('font-size: 18px');
    const linked = render(Avatar, { props: { children, 'aria-labelledby': 'owner' } }).body;

    expect(linked).toContain('aria-labelledby="owner"');
    expect(linked).toContain('role="img"');
  });
  it('does not allocate DOM observers timers or error callbacks during SSR', () => {
    const onError = vi.fn();
    vi.useFakeTimers();
    try {
      render(Avatar, { props: { src: 'invalid-image', onError, children } });
      render(Avatar, { props: { children } });
      expect(onError).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    }
    finally {
      vi.useRealTimers();
    }
  });
});
