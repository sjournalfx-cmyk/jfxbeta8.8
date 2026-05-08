import { describe, expect, it } from 'vitest';

import { normalizeAssistantMarkdown } from './aiChatFormatting';

describe('normalizeAssistantMarkdown', () => {
  it('preserves mermaid widget bodies and leaves surrounding prose intact', () => {
    const input = [
      'SUMMARY: keep it tight',
      '[WIDGET:MERMAID:FLOWCHART]',
      'graph TD',
      'A[START: Setup] --> B[Risk Check]',
      '[/WIDGET:MERMAID]',
    ].join('\n');

    const output = normalizeAssistantMarkdown(input);

    expect(output).toContain('SUMMARY: keep it tight');
    expect(output).toContain('[WIDGET:MERMAID:FLOWCHART]\ngraph TD\nA[START: Setup] --> B[Risk Check]\n[/WIDGET:MERMAID]');
    expect(output).not.toContain('__JFX_WIDGET_');
  });

  it('does not append or balance markdown delimiters on plain prose', () => {
    const input = 'Your biggest mistake is overtrading without a plan and drifting into inconsistent risk.';

    expect(normalizeAssistantMarkdown(input)).toBe(input);
  });
});
