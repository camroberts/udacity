#!/usr/bin/env python
# -*- coding: utf-8 -*-
import pprint

# Pipelines and queries
street_types_pl = [{'$group': {'_id': '$address.street', 'count': {'$sum': 1}}},
				   {'$sort': {'count': -1}}]

elem_types_pl = [{'$group': {'_id': '$elem', 'count': {'$sum': 1}}},
				 {'$sort': {'count': -1}}]

key_types_pl = [{'$unwind': '$tags'},
				{'$group': {'_id': '$tags.key', 'count': {'$sum': 1}}},
				{'$sort': {'count': -1}},
				{'$limit': 10}]

amenities_pl = [{'$unwind': '$tags'},
				{'$match': {'tags.key': 'amenity'}},
				{'$group': {'_id': '$tags.value', 'count': {'$sum': 1}}},
				{'$sort': {'count': -1}},
				{'$limit': 10}]

unique_schools_pl = [{'$match': {'tags.value': 'school'}},
					 {'$unwind': '$tags'},
					 {'$match': {'tags.key': 'name'}},
					 {'$group': {'_id': '$tags.value'}},
					 {'$sort': {'_id': 1}}]

school_loc_query = {'tags.value': 'school', 
					'pos': {'$geoWithin': 
						   {'$centerSphere': [[153.0238, -27.4693], 10/6378.1]}}}

top_users_pl = [{'$group': {'_id': '$created.user', 'count': {'$sum': 1}}},
				{'$sort': {'count': -1}},
				{'$limit': 10}]

postcode_pl = [{'$group': {'_id': 'postcode', 
						   'min': {'$min': '$address.postcode'},
						   'max': {'$max': '$address.postcode'}}}]

pos_check = {'pos': {'$exists': True,
					 '$not': {'$geoWithin': 
					 		 {'$box': [[152.4, -28.1],[153.6, -26.8]]}}}}

expected = ["Street", "Avenue", "Boulevard", "Drive", "Court", "Place", "Square", 
            "Lane", "Road", "Trail", "Parkway", "Commons", "Close", "Parade", "Quay",
            "Terrace", "Crescent", "Circuit", "Corso", "Highway", "Way", "Vista",
            "Esplanade", "Grove", "Arterial", "Corner"]

street_check = {'address.street': {'$regex': '^((?!' + '|'.join(expected) + ').)*$'}}


def get_db(db_name):
    from pymongo import MongoClient
    client = MongoClient('localhost:27017')
    db = client[db_name]
    return db


def aggregate(db, pipeline):
	result = db.osm.aggregate(pipeline)
	pprint.pprint([r for r in result])
