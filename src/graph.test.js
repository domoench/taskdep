import nodeWeights from './graph.js';

test('empty graph', () => {
  const nodes = [];
  const edges = [];
  expect(nodeWeights(nodes, edges)).toEqual([]);
});

test('one node graph', () => {
  const nodes = [{id: 'single'}];
  const edges = [];
  expect(nodeWeights(nodes, edges)).toEqual([1]);
});

test('DAG', () => {
  const nodes = [
    {id: 'a'},
    {id: 'b'},
    {id: 'c'},
    {id: 'd'},
    {id: 'e'},
    {id: 'f'},
  ];
  const edges = [
    {source: 'a', target: 'b'},
    {source: 'a', target: 'c'},
    {source: 'b', target: 'd'},
    {source: 'c', target: 'd'},
    {source: 'c', target: 'e'},
    {source: 'e', target: 'f'},
  ];
  const expectedWeights = [7, 2, 4, 1, 2, 1]
  expect(nodeWeights(nodes, edges)).toEqual(expectedWeights);
});
