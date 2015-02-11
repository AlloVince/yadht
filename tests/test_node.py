# -*- coding: utf-8 -*-

import pytest
from yadht.dht import Node


class TestNode(object):
    def test_random_str(self):
        assert len(Node.random_str(1)) == 1
        assert len(Node.random_str(20)) == 20
        assert ord(Node.random_str(1)) <= 126
        assert ord(Node.random_str(1)) >= 33

    def test_nid(self):
        node = Node()
        assert len(node.id) == 20

    def test_node_equal(self):
        node1 = Node("foo")
        node2 = Node("bar")
        node3 = Node("foo")
        assert node1 == node3
        assert node1 != node2