it(
  [
    'Given some text',
    'When a summary is generated',
    'Then the summary should contain the word "summary"',
  ].join('\n'),
  () => {
    const summary = 'This contains a summary.';
    expect(summary).toContain('summary');
  }
);
