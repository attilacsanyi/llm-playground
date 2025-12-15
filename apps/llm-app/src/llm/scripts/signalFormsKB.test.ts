import { runSignalFormsKB } from './signalFormsKB';

it('answers main Signal Forms purpose correctly', async () => {
  const content = await runSignalFormsKB({
    prompt: 'What is the main purpose of Signal Forms?',
    tone: 'positive',
    format: 'json',
  });

  // parse + eval JSON here
});
