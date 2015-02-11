# -*- coding: utf-8 -*-
from datetime import time
import hashlib
import random
from collections import OrderedDict


class Node(object):
    @staticmethod
    def random_str(length):
        s = ""
        for i in range(length):
            s += chr(random.randint(33, 126))
        return s

    @staticmethod
    def generate_id():
        return hashlib.sha1(str(random.getrandbits(255))).digest()
        """
        hash = sha1()
        hash.update(Node.random_str(20))
        return hash.digest()
        """

    def distance(self, node):
        return self.id_as_number ^ node.id_as_number

    def __eq__(self, other):
        return self.id == other.id

    def __ne__(self, other):
        return self.id != other.id

    def __init__(self, id=None, ip=None, port=None):
        self.id = id or Node.generate_id()
        self.ip = ip
        self.port = port
        self.id_as_number = long(self.id.encode('hex'), 16)


class Bucket(object):
    # How many nodes could be contained in one bucket
    DEFAULT_KSZIE = 8

    last_change = None

    def add_node(self, node):
        if node.id in self.nodes:
            del self.nodes[node.id]
            self.nodes[node.id] = node
        elif len(self) < self.ksize:
            self.nodes[node.id] = node
        else:
            self.save_replacement_nodes(node)
            return False
        return True

    def remove_node(self, node):
        if node.id not in self.nodes:
            return False

        del self.nodes[node.id]
        if len(self.replacement_nodes) > 0:
            newnode = self.replacement_nodes.pop()
            self.nodes[newnode.id] = newnode

        return True

    def in_range(self, node):
        return self.range_start <= node.id_as_number <= self.range_end

    def is_full(self):
        return len(self.nodes) >= self.ksize

    def update(self):
        self.last_change = time()

    def save_replacement_nodes(self, node):
        nodes = self.replacement_nodes
        if node in nodes:
            nodes.remove()
        nodes.append(node)

    def __len__(self):
        return len(self.nodes)

    def __init__(self, range_start, range_end, ksize=None, nodes=[]):
        self.range_start = range_start
        self.range_end = range_end
        self.nodes = nodes or OrderedDict()
        self.ksize = ksize or self.DEFAULT_KSZIE
        self.replacement_nodes = []
        self.update()


class RoutingTable(object):
    def __init__(self):
        pass
