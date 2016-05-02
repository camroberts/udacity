#!/usr/bin/python

import sys
import pickle
import pandas as pd
import numpy as np
sys.path.append("../tools/")

from feature_format import featureFormat, targetFeatureSplit
from tester import dump_classifier_and_data

### Load the dictionary containing the dataset
with open("final_project_dataset.pkl", "r") as data_file:
    data_dict = pickle.load(data_file)

# I prefer to work with a DataFrame
frame = pd.DataFrame.from_dict(data_dict, 'index')
frame = frame.replace('NaN', np.NaN)


### Task 2: Remove outliers
# These outliers can be observed by inspecting the data manually
# Remove TOTAL outlier
frame = frame.drop('TOTAL')

# Remove people with no total payment or stock value
remove = frame.total_payments.isnull() & frame.total_stock_value.isnull()
frame = frame[~remove]


### Task 1: Select what features you'll use.
# Remove email address as it is just a label
frame = frame.drop('email_address', axis=1)

# Also remove the total features as these are the sum of parts and thus contain 
# redundant information
frame = frame.drop(['total_payments', 'total_stock_value'], axis=1)

# Remove some features which clearly do not have enough data
valueCount = frame.count()
remove = valueCount[valueCount < 70].keys().tolist()
frame = frame.drop(remove, axis=1)

# Start with all remaining features (poi first)
# We'll use k-select in a pipeline to further choose below
features_list = frame.columns.tolist()
features_list.remove('poi')
features_list.insert(0, 'poi')

# Replace NaN with 0
frame = frame.fillna(0)


### Task 3: Create new feature(s)
# Try PCA on the two types of feature: financial and email
# I think it makes sense that these two "larger dimensions" could be represented
# by one principle component
from sklearn.decomposition import PCA
from sklearn import preprocessing

fin_features_list = ['salary', 'exercised_stock_options', 'bonus', 'restricted_stock',
	'expenses', 'other']
email_features_list = ['to_messages', 'shared_receipt_with_poi', 'from_messages',
	'from_this_person_to_poi', 'from_poi_to_this_person']

# Need to scale first
pca = PCA(1)
fin_features = preprocessing.scale(frame[fin_features_list])
frame['fin_pc'] = pca.fit_transform(fin_features)
print 'explained var ratio (fin) = ' + repr(pca.explained_variance_ratio_)
	
pca = PCA(1)
email_features = preprocessing.scale(frame[email_features_list])
frame['email_pc'] = pca.fit_transform(email_features)
print 'explained var ratio (email) = ' + repr(pca.explained_variance_ratio_)

# Add these to the original features so k-best can select from all
features_list = features_list + ['fin_pc', 'email_pc']


### Extract features and labels from dataset for local testing
# Convert frame back to data_dict
data_dict = frame.T.to_dict()
data = featureFormat(data_dict, features_list, sort_keys = True)
labels, features = targetFeatureSplit(data)
labels = np.array(labels)
features = np.array(features)


### Task 4: Try a varity of classifiers
### Please name your classifier clf for easy export below.
### Note that if you want to do PCA or other multi-stage operations,
### you'll need to use Pipelines. For more info:
### http://scikit-learn.org/stable/modules/pipeline.html

# Create a pipeline to do feature selection and param search
from sklearn.pipeline import Pipeline
from sklearn.feature_selection import SelectKBest
from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier

# I've used AdaBoost. I started with a plain DecisionTree but found Ada better.
# I also experimented with RandomForests
boost = AdaBoostClassifier(DecisionTreeClassifier(random_state=41), random_state=41)
clf = Pipeline([('sel', SelectKBest()), ('boost', boost)])


### Task 5: Tune your classifier to achieve better than .3 precision and recall 
### using our testing script. Check the tester.py script in the final project
### folder for details on the evaluation method, especially the test_classifier
### function. Because of the small size of the dataset, the script uses
### stratified shuffle split cross validation. For more info: 
### http://scikit-learn.org/stable/modules/generated/sklearn.cross_validation.StratifiedShuffleSplit.html

# Param grid
wgts = [
	{0: .2, 1: .8},
	{0: .4, 1: .6},
	{0: .6, 1: .4},
	{0: .8, 1: .2}
]
# I'd like to know more about these weights. How are they used? What constraints do
# they have?
param_grid = [{
	'sel__k': np.arange(1,6),
	'boost__n_estimators': [1,2,3],
	'boost__base_estimator__criterion': ['gini', 'entropy'], 
	'boost__base_estimator__max_depth': np.arange(1,21),
	'boost__base_estimator__class_weight': [None, 'balanced'] + wgts
	}]

# Find best params using CV on entire data set since it is small
# (Testing is done by partition into train/test)
from sklearn.grid_search import GridSearchCV
from sklearn.cross_validation import StratifiedShuffleSplit

cv = StratifiedShuffleSplit(labels, 10, random_state = 43)
# Make sure to use different seed to tester
clf = GridSearchCV(clf, param_grid, scoring='f1', cv=cv)
clf = clf.fit(features, labels)
print 'best score = ' + repr(clf.best_score_)
print 'best params:'
print clf.best_params_

### Task 6: Dump your classifier, dataset, and features_list so anyone can
### check your results. You do not need to change anything below, but make sure
### that the version of poi_id.py that you submit can be run on its own and
### generates the necessary .pkl files for validating your results.
clf = clf.best_estimator_
sel = clf.named_steps['sel']
features_list = ['poi'] + [features_list[i+1] for i in sel.get_support(True)]
dump_classifier_and_data(clf, data_dict, features_list)