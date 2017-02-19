import pandas as pd
import itertools
import statsmodels.api as sm
import csv
import matplotlib.pyplot as plt
from ggplot import *

#%% Functions
def ols(features, values):
    
    features = sm.add_constant(features)
    model = sm.OLS(values, features)
    result = model.fit()
    
    return result

#%%
def linearReg(dataframe, features):
    # Convert to dummy variables if we need to
    model = set(features)
    dummies = model.intersection(set(['UNIT', 'Hour']))
    model = model.difference(dummies)
    features = dataframe[list(model)]
    for dummy in dummies:
        dummy = pd.get_dummies(dataframe[dummy])
        # fix rank issue by removing one of the dummy columns
        dummy = dummy.drop(dummy.columns[0], axis=1)
        features = features.join(dummy)

    # Perform linear regression and gather results
    output = ols(features, dataframe['ENTRIESn_hourly'])
    return output

#%%
def testAllModels(dataframe, featureSet):
        
    # Iterate through the selected variables and run regression for each
    resultList = []
    for k in range(1, len(featureSet)+1):
        for m in itertools.combinations(featureSet, k):
            
            # Show the current model
            print(m)
            output = linearReg(dataframe, m)
            
            # Collect measures of fit
            result = {'model': list(m),
                      'params': output.params,
                      'condition': output.condition_number,
                      'f_stat': output.fvalue,
                      'p_value': output.f_pvalue,
                      'rsquared': output.rsquared,
                      'rsquared_adj': output.rsquared_adj}
            infl = output.get_influence()
            result['rsquared_pred'] = 1 - infl.ess_press/output.centered_tss
            resultList.append(result)
               
    return resultList
    
#%% Load data
turnstile_weather = pd.read_csv('C:\Users\Cameron\Udacity\P2 - Subway\\turnstile_data_master_with_weather.csv')
turnstile_weather['DATEn'] = pd.to_datetime(turnstile_weather['DATEn'])
turnstile_weather['DayOfWeek'] = turnstile_weather['DATEn'].dt.dayofweek
turnstile_weather['Weekend'] = (turnstile_weather['DayOfWeek'] > 4).astype(int)
turnstile_weather['Hour'] = turnstile_weather['Hour'].astype(str)

#%% Run all combinations of models
features = ['UNIT', 'Weekend', 'Hour', 'rain', 'fog', 'meantempi']
results = testAllModels(turnstile_weather, features)

#%% Write the outpt to file
with open('ols.csv', 'w') as csvfile:
    fields = ['model', 'condition', 'f_stat', 'p_value', 'rsquared', 'rsquared_adj', 'rsquared_pred']
    writer = csv.DictWriter(csvfile, fieldnames=fields, extrasaction='ignore', lineterminator='\n')
    
    writer.writeheader()
    writer.writerows(results)

#%% Best model
features = ['UNIT', 'Weekend', 'Hour', 'rain', 'fog']
result = linearReg(turnstile_weather, features)

#%% Plot residual q-q plot
probplot = sm.ProbPlot(result.resid)
probplot.qqplot()

#%% Plot residuals vs fitted
resid_fitted = pd.concat([result.resid, result.fittedvalues], axis=1)
resid_fitted.columns = ['resid', 'fitted']
plot = ggplot(resid_fitted, aes(x='fitted', y='resid')) + geom_point()
plot