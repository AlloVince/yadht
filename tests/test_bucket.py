# -*- coding: utf-8 -*-

import pytest
from yadht.dht import Bucket, Node


class TestBucket(object):
    def test_bucket_size(self):
        bucket = Bucket(0, 2 ** 160)
        assert bucket.ksize == 8
        bucket = Bucket(0, 2 ** 160, 2)
        assert bucket.ksize == 2

    def test_add_node(self):
        bucket = Bucket(0, 2 ** 160, 2)
        node_foo = Node("foo")
        node_bar = Node("bar")
        node_last = Node("last")
        assert bucket.add_node(node_foo) is True
        assert len(bucket) == 1
        assert bucket.add_node(node_bar) is True
        assert len(bucket) == 2
        assert bucket.add_node(node_last) is False
        assert bucket.is_full() is True
        assert len(bucket) == 2
        assert bucket.remove_node(node_foo) is True
        assert len(bucket) == 2
        assert bucket.remove_node(node_bar) is True
        assert len(bucket) == 1
        assert bucket.is_full() is False
        assert bucket.remove_node(node_last) is True
        assert len(bucket) == 0
        assert bucket.remove_node(node_foo) is False
        # print("id %s" % node.id)
