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
diff.sort()
	
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

# Remove features with low variance
from sklearn.feature_selection import VarianceThreshold
sel = VarianceThreshold(threshold=.8)
sel.fit_transform(features)
# None removed!

# Have a try with select k best
from sklearn.feature_selection import SelectKBest
sel = SelectKBest(k=5)
sel.fit_transform(features, labels)
print [features_list[i+1] for i in sel.get_support(True)]
# But how do I justify k?

# Split into train and test
from sklearn.cross_validation import train_test_split
features_train, features_test, labels_train, labels_test = train_test_split(
	features, labels, test_size=0.3, random_state=42)

# Try a decision tree
from sklearn import tree
clf = tree.DecisionTreeClassifier()
clf = clf.fit(features_train, labels_train)
pred = clf.predict(features_test)

# Have a look at features importances
zip(features_list[1:], clf.feature_importances_)
# It looks like the most important are
# shared_receipt_with_poi
# salary
# exercised_stock_options
# bonus

# Evaluate using f1 (which combines precision and recall)
# precision = of those we identified as POIs how many are
# recall = of all POIs how many did we identify
from sklearn.metrics import recall_score, precision_score, f1_score
recall = recall_score(labels_test, pred)
precision = precision_score(labels_test, pred)
f1 = f1_score(labels_test, pred)
print 'recall = ' + repr(recall)
print 'precision = ' + repr(precision)
print 'f1 = ' + repr(f1)
