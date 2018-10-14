import { NodeInterface, PeerInterface } from './protocol';

export class HashTable {
  logger: Console;
  capacity: number;
  nodes: NodeInterface[] = [];
  peers: PeerInterface[] = [];

  constructor(logger: Console = console, capacity: number = 65535) {
    this.logger = logger;
    this.capacity = capacity;
  }

  getStats() {
    return {
      nodes: this.nodes.length,
      peers: this.peers.length,
    };
  }

  addPeers(peers: PeerInterface[]) {
    for (const peer of peers) {
      if (this.peers.length < this.capacity) {
        this.peers.push(peer);
      }
    }
    this.logger.debug('Added peers ', peers);
  }

  addNodes(nodes: NodeInterface[]) {
    for (const node of nodes) {
      if (this.nodes.length < this.capacity) {
        this.nodes.push(node);
      }
    }
    this.logger.debug('Added nodes ', nodes);
  }

  shiftNode(): NodeInterface {
    return this.nodes.shift();
  }

  getNearestNodes(targetNodeId: string): NodeInterface[] {
    let nodes: NodeInterface[] = [];
    if (this.nodes.length >= 8) {
      nodes = this.nodes.slice(0, 8);
    }
    if (this.nodes.length > 0) {
      nodes = Array.of(8).map(() => this.nodes[0]);
    }
    this.logger.debug('Return near nodes', this.nodes.slice(0, 8));
    return nodes;
  }
}
