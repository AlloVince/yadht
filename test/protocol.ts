import test from 'ava';
import { PingQuery } from '../src/protocol';

test('ping query', async (t) => {
  const query = new PingQuery({
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
