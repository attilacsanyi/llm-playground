import { getVectorStoreDir } from './env';

describe('env', () => {
  it('should get the vector store directory', () => {
    expect(getVectorStoreDir().includes('.vector-stores')).toBe(true);
  });
});
