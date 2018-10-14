import test from 'ava';
import Node from '../src/node';

test('distance', async (t) => {
  const node1 = new Node({
    id: '67cdcf5c6627c4c49345e943c19eb72e7eca9616',
    ip: '127.0.0.1',
    port: 6881,
  });
  const node2 = new Node({
    id: '858d82c95d2794f78cbb4acd5857ff5ad33733af',
    ip: '127.0.0.1',
    port: 6881,
  });
  t.is(node1.distanceTo(node1), '0');
  t.is(node1.distanceTo(node2), '1291665920325409187511188140136210697566082147769');
});


test('node relay', async (t) => {
  const node = new Node({
    id: '67cdcf5c6627c4c49345e943c19eb72e7eca9616',
    ip: '127.0.0.1',
    port: 6881,
  });
  t.is(
    node.getRelayNodeId('858d82c95d2794f78cbb4acd5857ff5ad33733af'),
    '858d82c95d27c4c49345e943c19eb72e7eca9616',
  );
});
