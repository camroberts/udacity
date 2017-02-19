#!/usr/bin/env python
# -*- coding: utf-8 -*-
import xml.etree.cElementTree as ET
import pprint
import re
import codecs
import json
import sys
"""
This code based on data.py and audit.py from Lesson 6.
"""

CREATED = [ "version", "changeset", "timestamp", "user", "uid"]
POS = ['lon', 'lat']


expected = set(["Street", "Avenue", "Boulevard", "Drive", "Court", "Place", "Square", 
            "Lane", "Road", "Trail", "Parkway", "Commons", "Close", "Parade", "Quay",
            "Terrace", "Crescent", "Circuit", "Corso", "Highway", "Way", "Vista",
            "Esplanade", "Grove", "Arterial", "Corner"])

mapping = {"St": "Street",
           "Ave": "Avenue",
           "Cnr": "Corner",
           "road": "Road",
           "Hwy": "Highway",
           "Parade,": "Parade",
           "Foch": "Foch Street",
           "Crosby": "Crosby Road",
           "Silkwood": "Silkwood Street",
           "Muskwood": "Muskwood Street",
           "Dixon": "Dixon Street",
           "Beaconsfield": "Beaconsfield Street"
           }


problemchars = re.compile(r'[=\+/&<>;\'"\?%#$@\,\. \t\r\n]')
postcode = re.compile(r'\d+')


def audit_street_type(street_name):
    # Special case
    if street_name == 'The Village Centre':
        street_name = 'Corner of Musk Avenue and Kelvin Grove Road'
        return street_name

    # Find any street names which don't contain one of the expected street types
    words = street_name.split()
    if not expected.intersection(words):
        replaced = False
        for word in words:
            if word in mapping.keys():
                # Replace any known words in the mapping
                street_name = re.sub('\b' + word + '\b', street_name, mapping[word])
                replaced = True

        if not replaced:
            print('Unexpected street type: ' + street_name)

    return street_name


def audit_key(key):

    # Replace '.' with ':' and spaces with '_'
    key = key.replace('.', ':').replace(' ', '_')

    # Make key lowercase only
    key = key.lower()

    if problemchars.search(key):
        print('Problem chars in key: ' + key)    

    return key


def audit_postcode(pc):
    # pull out just the number
    pc = int(postcode.search(pc).group())

    # known case
    if pc == 5055:
        pc = 4014
        
    elif pc > 4999:
        print('Invalid postcode: '.format(pc))

    return pc


def process_addr(k, v):

    parts = k.split(':')
    if len(parts) == 2:
        ktype = parts[1]

        if ktype == 'postcode':
            v = audit_postcode(v)

        elif ktype == 'street':
            v = audit_street_type(v)

    else:
        print('Unexpected address type: ' + k + ': ' + v)
        # We'll enter it as is
        ktype = ':'.join(parts[1:])
        # TODO: fix these:
        # k=address v=280 Given tce, Paddington, QLD
        # k=addr:housenumber:source v=survey            

    return ktype, v


def shape_element(element):

    # Restrict elements to just node and way
    node = {}
    if element.tag == "node" or element.tag == "way" :
        
        node['elem'] = element.tag
        
        for attr in element.attrib:
            if attr in CREATED:
                if 'created' not in node:
                    node['created'] = {}

                node['created'][attr] = element.get(attr)
            elif attr in POS:
                if 'pos' not in node:
                    node['pos'] = {'type': 'Point', 'coordinates': [0, 0]}

                node['pos']['coordinates'][POS.index(attr)] = float(element.get(attr))
            else:
                node[attr] = element.get(attr)
        
        # Process tags
        for tag in element.iter('tag'):
            k = tag.get('k')
            v = tag.get('v')

            k = audit_key(k)
            
            if k.startswith('addr'):
                ktype, v = process_addr(k, v)
                if 'address' not in node:
                    node['address'] = {}

                node['address'][ktype] = v

            else:
                # All other tags
                if 'tags' not in node:
                    node['tags'] = []

                node['tags'].append({'key': k, 'value': v})
               
        # Process node refs 
        for nd in element.iter('nd'):
            if 'node_refs' not in node:
                node['node_refs'] = []

            node['node_refs'].append(nd.get('ref'))
            
        return node
    else:
        return None
    

def main(file_in):
    # Parse each element and writ to output file
    file_out = "{0}.json".format(file_in)
    with codecs.open(file_out, "w") as fo:
        for _, element in ET.iterparse(file_in):
            el = shape_element(element)
            if el:
                fo.write(json.dumps(el) + "\n")


if __name__ == "__main__":
    main(sys.argv[1])