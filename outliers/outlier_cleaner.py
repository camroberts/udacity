#!/usr/bin/python


def outlierCleaner(predictions, ages, net_worths):
    """
        Clean away the 10% of points that have the largest
        residual errors (difference between the prediction
        and the actual net worth).

        Return a list of tuples named cleaned_data where 
        each tuple is of the form (age, net_worth, error).
    """
    import numpy as np

    cleaned_data = []
    #return cleaned_data

    # Sort the data by error
    err = predictions - net_worths
    idx = np.argsort(abs(err), axis=0)

    # Get 10%
    n = int(len(err) * .9)
    keep = idx[0:n-1]
    ages = ages[keep]
    net_worths = net_worths[keep]
    err = err[keep]

    cleaned_data = zip(ages, net_worths, idx[keep])
    return cleaned_data

