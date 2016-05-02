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

# Start with all features
features_list = frame.columns.tolist()
features_list.remove('poi')
features_list.insert(0, 'poi')

# Remove email address as it is just a label
features_list.remove('email_address')
frame = frame.drop('email_address', axis=1)

# Remove some features which clearly do not have enough data
valueCount = frame.count()
remove = valueCount[valueCount < 70].keys().tolist()
features_list = [f for f in features_list if f not in remove]
frame = frame.drop(remove, axis=1)

# total payments vs total stock value
# This quickly shows the TOTAL outlier we will remove
import matplotlib.pyplot as plt
plt.plot(frame.total_payments[frame.poi], frame.total_stock_value[frame.poi], 'r.',
	frame.total_payments[~frame.poi], frame.total_stock_value[~frame.poi], 'b.')
#plt.show()

# Remove total oulier
frame = frame.drop('TOTAL')

# Have a look at features grouped by poi
avg = frame.groupby('poi').mean()
diff = abs((avg.loc[True] - avg.loc[False])/avg.loc[True])
diff.sort_values()
	
# Some employees have little data
valueCount = frame.count(axis=1)
valueCount[valueCount<5]

# Actually maybe we should remove people with no total payment or stock value
remove = frame.total_payments.isnull() & frame.total_stock_value.isnull()
frame = frame[~remove]

# Convert frame back to data_dict (replace NaN with zero first)
frame = frame.fillna(0)
data_dict = frame.T.to_dict()

### Extract features and labels from dataset for local testing
data = featureFormat(data_dict, features_list, sort_keys = True)
labels, features = targetFeatureSplit(data)
labels = np.array(labels)
features = np.array(features)
	
# Remove low importance features based on initial decision tree
#features_list = ['poi', 'shared_receipt_with_poi', 'salary', 
#'exercised_stock_options', 'bonus']

# Create a pipeline to do feature selection and param search
from sklearn.feature_selection import SelectKBest
from sklearn.pipeline import Pipeline
from sklearn import tree
dt = tree.DecisionTreeClassifier()
sel = SelectKBest()
clf = Pipeline([
	('selection', sel),
	('tree', dt)
	])

# Param grid
param_grid = [{
	'selection__k': np.arange(1,6),
	'tree__criterion': ['gini', 'entropy'], 
	'tree__splitter': ['best', 'random'],
	'tree__max_depth': np.arange(2,11)
	}]

# Find best params using entire data set since it is small
from sklearn.grid_search import GridSearchCV
from sklearn.cross_validation import StratifiedShuffleSplit
folds = 10
cv = StratifiedShuffleSplit(labels, folds, random_state = 43)
# Make sure to use different seed to tester
clf = GridSearchCV(clf, param_grid, scoring='f1', cv=cv)
clf = clf.fit(features, labels)
print clf.best_score_
print clf.best_params_
clf = clf.best_estimator_

# Do CV folds on train/test to assess performance 
from sklearn.cross_validation import StratifiedShuffleSplit
from sklearn.metrics import classification_report
from sklearn.metrics import recall_score, precision_score, f1_score
folds = 10
cv = StratifiedShuffleSplit(labels, folds, random_state = 42)
f1 = []
precision = []
recall = []
for train_idx, test_idx in cv:
	features_train, features_test = features[train_idx], features[test_idx]
	labels_train, labels_test = labels[train_idx], labels[test_idx]

	clf = clf.fit(features_train, labels_train)

	# Evaluate using f1 (which combines precision and recall)
	# precision = of those we identified as POIs how many are
	# recall = of all POIs how many did we identify
	pred = clf.predict(features_test)
	f1.append(f1_score(labels_test, pred))
	precision.append(precision_score(labels_test, pred))
	recall.append(recall_score(labels_test, pred))
	#print classification_report(labels_test, pred)

# Have a look at features importances
#zip(features_list[1:], clf.feature_importances_)
# It looks like the most important are
# shared_receipt_with_poi
# salary
# exercised_stock_options
# bonus

print 'avg recall = ' + repr(np.mean(recall))
print 'avg precision = ' + repr(np.mean(precision))
print 'avg f1 = ' + repr(np.mean(f1))

# Now use udacity tester to evaulate using train/test split
from tester import test_classifier
test_classifier(clf, data_dict, features_list)