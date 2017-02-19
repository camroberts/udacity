#!/usr/bin/env python
# -*- coding: utf-8 -*-
import xml.etree.cElementTree as ET
import pprint
import re
import codecs
import json
import sys
"""
This code based on data.py from Lesson 6.
"""

lower = re.compile(r'^([a-z]|_)*$')
lower_colon = re.compile(r'^([a-z]|_)*:([a-z]|_)*$')
problemchars = re.compile(r'[=\+/&<>;\'"\?%#$@\,\. \t\r\n]')

CREATED = [ "version", "changeset", "timestamp", "user", "uid"]
POS = ['lat', 'lon']

expected = ["Street", "Avenue", "Boulevard", "Drive", "Court", "Place", "Square", "Lane", "Road", 
            "Trail", "Parkway", "Commons"]

# UPDATE THIS VARIABLE
mapping = { "St": "Street",
            "St.": "Street",
            "Ave": "Avenue",
            "Rd.": "Road"
            }


def audit_street_type(street_types, street_name):
    m = street_type_re.search(street_name)
    if m:
        street_type = m.group()
        if street_type not in expected:
            street_types[street_type].add(street_name)


def is_street_name(elem):
    return (elem.attrib['k'] == "addr:street")


def shape_element(element):
    node = {'created': {}}
    if element.tag == "node" or element.tag == "way" :
        # YOUR CODE HERE
        node['elem'] = element.tag
        
        for attr in element.attrib:
            if attr in CREATED:
                node['created'][attr] = element.get(attr)
            elif attr in POS:
                if 'pos' not in node:
                    node['pos'] = [0, 0]
                node['pos'][POS.index(attr)] = float(element.get(attr))
            else:
                node[attr] = element.get(attr)
        
        for tag in element.iter('tag'):
            k = tag.get('k')
            if problemchars.search(k):
                continue
            elif k.startswith('addr'):
                parts = k.split(':')
                if len(parts) == 2:
                    if 'address' not in node:
                        node['address'] = {}
                    node['address'][parts[1]] = tag.get('v')
            else:
                node[k] = tag.get('v')
                
        for nd in element.iter('nd'):
            if 'node_refs' not in node:
                node['node_refs'] = []
            node['node_refs'].append(nd.get('ref'))
            
        return node
    else:
        return None


def process_map(file_in, pretty = False):
    # You do not need to change this file
    file_out = "{0}.json".format(file_in)
    data = []
    with codecs.open(file_out, "w") as fo:
        for _, element in ET.iterparse(file_in):
            el = shape_element(element)
            if el:
                data.append(el)
                if pretty:
                    fo.write(json.dumps(el, indent=2)+"\n")
                else:
                    fo.write(json.dumps(el) + "\n")
    return data

def main(input_file):
    # NOTE: if you are running this code on your computer, with a larger dataset, 
    # call the process_map procedure with pretty=False. The pretty=True option adds 
    # additional spaces to the output, making it significantly larger.
    data = process_map(input_file, False)
    #pprint.pprint(data)

if __name__ == "__main__":
    main(sys.argv[1])