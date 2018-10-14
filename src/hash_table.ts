import { NodeInterface, PeerInterface } from './protocol';

export class HashTable {
  logger: Console;
  nodes: NodeInterface[] = [];
  peers: PeerInterface[] = [];

  constructor(logger: Console = console) {
    this.logger = logger;
  }

  addPeers(peers: PeerInterface[]) {
    for (const peer of peers) {
      this.peers.push(peer);
    }
    this.logger.debug('Added peers ', peers);
  }

  addNodes(nodes: NodeInterface[]) {
    for (const node of nodes) {
      this.nodes.push(node);
    }
    this.logger.debug('Added nodes ', nodes);
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
