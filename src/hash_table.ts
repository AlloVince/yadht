import { NodeInterface, PeerInterface } from './protocol';

export class HashTable {
  nodes: NodeInterface[] = [];
  peers: PeerInterface[] = [];

  addPeers(peers: PeerInterface[]) {
    for (const peer of peers) {
      this.peers.push(peer);
    }
    console.debug('Added peers ', peers);
  }

  addNodes(nodes: NodeInterface[]) {
    for (const node of nodes) {
      this.nodes.push(node);
    }
    console.debug('Added nodes ', nodes);
  }

  getNearestNodes(targetNodeId: string): NodeInterface[] {
    let nodes: NodeInterface[] = [];
    if (this.nodes.length >= 8) {
      nodes = this.nodes.slice(0, 8);
    }
    if (this.nodes.length > 0) {
      nodes = Array.of(8).map(() => this.nodes[0]);
    }
    console.debug('Return near nodes', this.nodes.slice(0, 8));
    return nodes;
  }
}
