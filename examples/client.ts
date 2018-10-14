import Node from '../src/node';
import dgram from 'dgram';

const node = new Node(
  {
    id: Node.generateId().toString('hex'),
    ip: '127.0.0.1',
    port: 6882,
  },
  dgram.createSocket('udp4')
);

node.findNode(Node.generateId().toString('hex'), new Node({
  id: Node.generateId().toString('hex'),
  ip: '127.0.0.1',
  port: 6881,
}));
