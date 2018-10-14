import test from 'ava';
import * as Protocol from '../src/protocol';

test('ping query', async (t) => {
  const query = new Protocol.PingQuery({
    queryArguments: { id: 'foo' },
    fromIp: '127.0.0.1',
    fromPort: 6881,
  });
  const message = query.toJSON();
  t.is(message.y, 'q');
  t.is(message.q, 'ping');
  t.is(message.t.toString().length, 4);
  t.deepEqual(message.a, { id: 'foo' });
});

test('find node query', async (t) => {
  const query = new Protocol.FindNodeQuery({
    queryArguments: {
      id: 'c8b4f81e99bd1a9bf60b30b065449d0db56abc8a',
      target: '07de97bfd8d131457b4be18023a0866afa3c87d2',
    },
    fromIp: '127.0.0.1',
    fromPort: 6881,
  });
  const message = query.toJSON();
  t.is(message.y, 'q');
  t.is(message.q, 'find_node');
  t.is(message.t.toString().length, 4);
  // t.deepEqual(
  //   message.a,
  //   {
  //     id: 'c8b4f81e99bd1a9bf60b30b065449d0db56abc8a',
  //     target: '07de97bfd8d131457b4be18023a0866afa3c87d2',
  //   },
  // );
});
