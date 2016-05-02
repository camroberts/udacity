import sys
import pickle
import pandas as pd
import numpy as np
sys.path.append("../tools/")

from feature_format import featureFormat, targetFeatureSplit

with open("final_project_dataset.pkl", "r") as data_file:
    data_dict = pickle.load(data_file)

# I prefer to work with a DataFrame first
frame = pd.DataFrame.from_dict(data_dict, 'index')
frame = frame.replace('NaN', np.NaN)
# Do we want to replace NaN with zero?

# Remove total oulier
frame = frame.drop('TOTAL')

# Actually maybe we should remove people with no total payment or stock value
remove = frame.total_payments.isnull() & frame.total_stock_value.isnull()
frame = frame[~remove]

# Start with all features
features_list = frame.columns.tolist()
features_list.remove('poi')
features_list.insert(0, 'poi')

# Remove email address as it is just a label
features_list.remove('email_address')
frame = frame.drop('email_address', axis=1)

# Also remove total features as these are the sum of parts and thus contain same
# information
features_list.remove('total_payments')
features_list.remove('total_stock_value')
frame = frame.drop(['total_payments', 'total_stock_value'], axis=1)

# Remove some features which clearly do not have enough data
valueCount = frame.count()
remove = valueCount[valueCount < 70].keys().tolist()
features_list = [f for f in features_list if f not in remove]
frame = frame.drop(remove, axis=1)

frame = frame.fillna(0)

# Have a look at features grouped by poi
avg = frame.groupby('poi').mean()
diff = abs((avg.loc[True] - avg.loc[False])/avg.loc[True])
diff.sort_values()

# Try PCA on the two types of feature: financial and email
from sklearn.decomposition import PCA
fin_features_list = ['salary', 'exercised_stock_options', 'bonus', 'restricted_stock',
	'expenses', 'other']
email_features_list = ['to_messages', 'shared_receipt_with_poi', 'from_messages',
	'from_this_person_to_poi', 'from_poi_to_this_person']

# Need to replace NaN with zero first and rescale
from sklearn import preprocessing

pca = PCA(1)
fin_features = preprocessing.scale(frame[fin_features_list])
frame['fin_pc'] = pca.fit_transform(fin_features)
print 'explained var ratio (fin) = ' + repr(pca.explained_variance_ratio_)
	
pca = PCA(1)
email_features = preprocessing.scale(frame[email_features_list])
frame['email_pc'] = pca.fit_transform(email_features)
print 'explained var ratio (email) = ' + repr(pca.explained_variance_ratio_)

# We've added these to the original features so k-best can select from all
features_list = features_list + ['fin_pc', 'email_pc']

# Convert frame back to data_dict
data_dict = frame.T.to_dict()

### Extract features and labels from dataset for local testing
data = featureFormat(data_dict, features_list, sort_keys = True)
labels, features = targetFeatureSplit(data)
labels = np.array(labels)
features = np.array(features)

# Create a pipeline to do PCA, feature selection and param search
from sklearn.feature_selection import SelectKBest
from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier

boost = AdaBoostClassifier(DecisionTreeClassifier())
clf = Pipeline([('sel', SelectKBest()), ('boost', boost)])

# Param grid
param_grid = [{
	'sel__k': np.arange(1,6),
	'boost__n_estimators': [1,2],
	'boost__base_estimator__criterion': ['gini', 'entropy'], 
	'boost__base_estimator__max_depth': np.arange(1,21)
	}]

# Find best params using entire data set since it is small
from sklearn.grid_search import GridSearchCV
from sklearn.cross_validation import StratifiedShuffleSplit
folds = 10
cv = StratifiedShuffleSplit(labels, folds, random_state = 43)
# Make sure to use different seed to tester
clf = GridSearchCV(clf, param_grid, scoring='f1', cv=cv)
clf = clf.fit(features, labels)
print 'best score = ' + repr(clf.best_score_)
print 'best params:'
print clf.best_params_

# Now use udacity tester to evaulate using train/test split
from tester import test_classifier
test_classifier(clf.best_estimator_, data_dict, features_list)