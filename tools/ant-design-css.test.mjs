import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { archiveEntry, cssBlocks, extractCss, splitSelectors, verifyArchive } from './ant-design-css-core.mjs';

const recipe = (extra = {}) => ({ include: ['\\.ant-test(?![\\w])'], exclude: ['ant-other'], replacements: [{ pattern: '\\.ant-test(?![-\\w])', replacement: '.ant-test:where(.test-vars)' }], expectedRules: 1, keyframes: [], header: '/* Test source */', ...extra });

describe('Pinned CSS archive', () => {
  it('verifies the archive bytes before extraction', () => {
    const bytes = Buffer.from('source'); const hash = createHash('sha256').update(bytes).digest('hex'); expect(() => verifyArchive(bytes, hash)).not.toThrow(); expect(() => verifyArchive(Buffer.from('changed'), hash)).toThrow('SHA-256 mismatch');
  });
  it('reads only the requested npm tar entry and rejects missing or truncated data', () => {
    const header = Buffer.alloc(512); header.write('package/dist/antd.css'); const body = Buffer.from('.a{color:red}'); header.write(`${body.length.toString(8).padStart(11, '0')}\0`, 124); header[156] = 48;
    const archive = gzipSync(Buffer.concat([header, body, Buffer.alloc(512 - body.length), Buffer.alloc(1024)])); expect(archiveEntry(archive, 'package/dist/antd.css').toString()).toBe('.a{color:red}'); expect(() => archiveEntry(archive, 'package/other.css')).toThrow('Missing npm archive entry'); expect(() => archiveEntry(gzipSync(Buffer.concat([header, body.subarray(0, 2)])), 'package/dist/antd.css')).toThrow('Truncated');
  });
});

describe('CSS extraction', () => {
  it('splits selector lists without splitting functional selectors or quoted attribute values', () => {
    expect(splitSelectors('.ant-test:is(.a,.b),[data-x="a,b"],.escaped\\,comma')).toEqual(['.ant-test:is(.a,.b)', '[data-x="a,b"]', '.escaped\\,comma']);
  });
  it('preserves declarations quoted braces comments and escaped strings exactly', () => {
    const body = 'content:"{,}";background:url("data:image/svg+xml,%7B%7D");/* } */color:red;';
    const result = extractCss(`/* header */.ant-test,.ant-other{${body}}.ant-testing{color:blue}`, recipe()); expect(result.content).toBe(`/* Test source */\n.ant-test:where(.test-vars){${body}}\n`); expect(result.rules).toBe(1);
  });
  it('preserves media scope and does not move scoped keyframes to the root', () => {
    const result = extractCss('@media(width>20px){.ant-test{color:red}@keyframes pulse{0%{opacity:0}}}.other{color:blue}', recipe({ keyframes: ['pulse'], appendRootKeyframes: true }));
    expect(result.content).toContain('@media(width>20px){.ant-test:where(.test-vars){color:red}@keyframes pulse{0%{opacity:0}}}'); expect(result.keyframes).toEqual(['pulse']);
  });
  it('appends explicitly selected root keyframes when a recipe requires that order', () => {
    const result = extractCss('@keyframes pulse{to{opacity:0}}.ant-test{color:red}', recipe({ keyframes: ['pulse'], appendRootKeyframes: true })); expect(result.content).toBe('/* Test source */\n.ant-test:where(.test-vars){color:red}\n@keyframes pulse{to{opacity:0}}\n');
  });
  it('fails closed on missing rules keyframes malformed CSS and empty recipes', () => {
    expect(() => extractCss('.other{color:red}', recipe())).toThrow('rule count'); expect(() => extractCss('.ant-test{color:red}', recipe({ keyframes: ['absent'] }))).toThrow('Missing keyframes'); expect(() => extractCss('.ant-test{content:"unterminated}', recipe())).toThrow('Unclosed'); expect(() => cssBlocks('/* unclosed')).toThrow('comment'); expect(() => extractCss('.ant-test{color:red}', recipe({ expectedRules: 0 }))).toThrow('positive expectedRules');
  });
});
