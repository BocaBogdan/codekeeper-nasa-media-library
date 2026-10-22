import { describe, expect, it } from 'vitest'

import { stripHtml } from '@/lib/strip-html'

describe('stripHtml', () => {
  it('returns plain text unchanged', () => {
    expect(stripHtml('Saturn and its rings')).toBe('Saturn and its rings')
  })

  it('removes tags but keeps their text', () => {
    expect(
      stripHtml('<b>Bold</b> and <a href="https://nasa.gov">a link</a>'),
    ).toBe('Bold and a link')
  })

  it('turns <br> and paragraphs into line breaks', () => {
    expect(stripHtml('<p>First</p><p>Second<br/>line</p>')).toBe(
      'First\n\nSecond\nline',
    )
  })

  it('removes scripts, styles and comments with their content', () => {
    expect(
      stripHtml(
        'Hello<script>alert("x")</script><style>p{}</style><!-- note --> world',
      ),
    ).toBe('Hello world')
  })

  it('decodes HTML entities without turning them into markup', () => {
    expect(
      stripHtml('Tom &amp; Jerry &lt;b&gt; &#8211; &#x2014;&nbsp;end'),
    ).toBe('Tom & Jerry <b> – — end')
  })

  it('normalises whitespace and collapses blank lines', () => {
    expect(stripHtml('  a   b \r\n\r\n\r\n\r\n  c  ')).toBe('a b\n\nc')
  })
})
