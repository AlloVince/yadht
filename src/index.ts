import dgram from 'dgram';
import Node from './node';
import { HashTable } from './hash_table';
import {
  AddressInterface, FindNodeQuery, FindNodeResponse, GetPeersQuery, GetPeersResponse, PingQuery,
} from './protocol';

declare type Callback = () => void;

class Token {
  token: string;

  constructor() {
    this.generate();
    setInterval(() => this.generate(), 60000 * 15);
  }

  isValid(t: Buffer) {
    return t.toString() === this.token;
  }

  generate() {
    this.token = (new Buffer([
      Math.floor(Math.random() * 200),
      Math.ceil(Math.random() * 200),
    ])).toString('hex');
  }
}

export default class Crawler {
  ip: string;
  port: number;
  server: dgram.Socket;
  logger: Console;
  node: Node;
  bootstrapNodes: Node[];
  hashTable: HashTable;

  constructor(
    { ip, port, logger }: {
      ip?: string,
      port?: number,
      logger?: Console,
    }) {
    this.server = dgram.createSocket('udp4');
    this.logger = logger || console;
    this.ip = ip || '127.0.0.1';
    this.port = port || 6881;

    this.node = new Node(
      {
        id: Node.generateId().toString('hex'),
        ip: this.ip,
        port: this.port,
        logger: this.logger,
      },
      this.server,
    );

    this.hashTable = new HashTable();
  }

  setBootstrapNodes(nodes: Node[]) {
    this.bootstrapNodes = nodes;
  }

  getBootstrapNodes() {
    return this.bootstrapNodes;
  }

  findPeer(infoHash: string) {

  }

  start(inputHash: string) {
    const token = new Token();
    const infoHash = process.env.INFO_HASH || inputHash.toLowerCase();
    this.node.onPingQuery((query: PingQuery) => {
      this.hashTable.addNodes([{
        id: query.getId(),
        ip: query.getFromIp(),
        port: query.getFromPort(),
      }]);
      this.node.replyPing(query, this.node);
    });

    this.node.onFindNodeQuery((query: FindNodeQuery) => {
      this.hashTable.addNodes([{
        id: query.getId(),
        ip: query.getFromIp(),
        port: query.getFromPort(),
      }]);
      this.node.replyFindNode(query, this.hashTable.getNearestNodes(query.getTargetNodeId()));
    });

    this.node.onFindNodeResponse((response: FindNodeResponse) => {
      const nodes = response.getNodes();
      this.hashTable.addNodes(nodes);
      for (const foundNode of nodes) {
        this.node.findNode(this.node.id, foundNode);
        this.node.getPeers(infoHash, foundNode);
      }
    });

    this.node.onGetPeersQuery((query: GetPeersQuery) => {
      this.hashTable.addNodes([{
        id: query.getId(),
        ip: query.getFromIp(),
        port: query.getFromPort(),
      }]);
      this.node.replyGetPeers(query, token.token, this.hashTable.getNearestNodes(query.getId()));
    });

    this.node.onGetPeersResponse((response: GetPeersResponse) => {
      if (response.foundPeers()) {
        const peers = response.getPeers();
        this.hashTable.addPeers(peers);
      } else {
        const nodes = response.getNodes();
        this.hashTable.addNodes(nodes);
        for (const foundNode of nodes) {
          this.node.findNode(this.node.id, foundNode);
          this.node.getPeers(infoHash, foundNode);
        }
      }
    });

    this.listen(() => {
      for (const bootNode of this.bootstrapNodes) {
        this.node.findNode(this.node.id, bootNode);
        this.node.getPeers(infoHash, bootNode);
      }
    });
  }

  listen(callback: Callback, port?: number) {
    this.server.bind(port || this.port);

    this.server.on('listening', () => {
      this.logger.info('[NODE:%s] Listen on: %j', this.node, this.server.address());
      callback();
    });

    this.server.on('error', (err: Error) => {
      this.logger.error('[NODE:%s] UDP socket err: ', this.node, err);
    });

    this.server.on('message', (rawMessage: Buffer, address: AddressInterface) => {
      try {
        this.node.receiveMessage(rawMessage, address);
      } catch (e) {
        this.logger.error(e);
      }
    });
  }
}
