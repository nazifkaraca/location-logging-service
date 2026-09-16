import { diffAreaSets } from './set-diff';

describe('diffAreaSets', () => {
  it('detects a first enter', () => {
    expect(diffAreaSets([], ['a'])).toEqual({ entered: ['a'], exited: [] });
  });

  it('is a no-op when the set is unchanged', () => {
    expect(diffAreaSets(['a'], ['a'])).toEqual({ entered: [], exited: [] });
  });

  it('detects exit without inventing an "outside" area', () => {
    expect(diffAreaSets(['a'], [])).toEqual({ entered: [], exited: ['a'] });
  });

  it('treats overlapping areas independently', () => {
    expect(diffAreaSets(['a'], ['a', 'b'])).toEqual({
      entered: ['b'],
      exited: [],
    });
  });
});
