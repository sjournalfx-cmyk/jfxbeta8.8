import { describe, expect, it } from 'vitest';

import { parseStructuredBlocks, stripStructuredBlocks } from './AIChat';

describe('parseStructuredBlocks', () => {
  it('extracts a Mermaid widget when the opening tag is inline with the diagram body', () => {
    const blocks = parseStructuredBlocks(
      '[WIDGET:MERMAID:FLOWCHART] flowchart TD A[Start] --> B[Check] [/WIDGET:MERMAID]'
    );

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({
      type: 'widget',
      widget: {
        kind: 'mermaid',
        type: 'FLOWCHART',
        body: 'flowchart TD A[Start] --> B[Check]',
      },
    });
  });

  it('accepts a generic closing tag for Mermaid widgets', () => {
    const blocks = parseStructuredBlocks(
      '[WIDGET:MERMAID:GANTT]\ngantt\nsection Day 1\nReview :a1, 2026-05-06, 1d\n[/WIDGET]'
    );

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({
      type: 'widget',
      widget: {
        kind: 'mermaid',
        type: 'GANTT',
        body: 'gantt\nsection Day 1\nReview :a1, 2026-05-06, 1d',
      },
    });
  });

  it('recovers a Mermaid widget that is missing a closing tag', () => {
    const blocks = parseStructuredBlocks(
      '[WIDGET:MERMAID:GANTT] gantt\nsection Day 1\nReview :a1, 2026-05-06, 1d'
    );

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({
      type: 'widget',
      widget: {
        kind: 'mermaid',
        type: 'GANTT',
        body: 'gantt\nsection Day 1\nReview :a1, 2026-05-06, 1d',
      },
    });
  });
});

describe('stripStructuredBlocks', () => {
  it('removes malformed Mermaid widgets from surrounding markdown', () => {
    const text = [
      'A concise 5-day scaling plan.',
      '',
      '[WIDGET:MERMAID:GANTT] gantt',
      'section Day 1',
      'Review :a1, 2026-05-06, 1d',
      '[/WIDGET]',
      '',
      'Wrap up.',
    ].join('\n');

    expect(stripStructuredBlocks(text)).toBe('A concise 5-day scaling plan.\n\nWrap up.');
  });
});
