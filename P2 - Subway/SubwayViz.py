import pandas as pd
from ggplot import *

#%% Load the data
turnstile_weather = pd.read_csv('C:\Users\Cameron\Udacity\P2 - Subway\\turnstile_data_master_with_weather.csv')
turnstile_weather['DATEn'] = pd.to_datetime(turnstile_weather['DATEn'])
turnstile_weather['DayOfWeek'] = turnstile_weather['DATEn'].dt.dayofweek
turnstile_weather['Weekend'] = turnstile_weather['DayOfWeek'] > 4

#%% Histograms of hourly entries by rainy and non-rainy days
# DOES NOT WORK
plot = ggplot(turnstile_weather, aes(x='ENTRIESn_hourly')) \
    + geom_histogram(binwidth=500, alpha=0.6) \
    + scale_x_continuous(breaks=range(0, 5000, 500)) + xlim(high=5000) \
    + xlab('Ridership Volume') + ylab('Frequency') \
    + facet_grid('rain')
plot

#%% Density of hourly entires by rainy and non-rainy days
rain = turnstile_weather[['rain','ENTRIESn_hourly']].groupby('rain', as_index=False).median()
plot = ggplot(turnstile_weather, aes(x='ENTRIESn_hourly', color='rain')) \
    + geom_density() \
    + geom_vline(rain, aes(xintercept='ENTRIESn_hourly',  colour='rain'), linetype="dashed", size=1) \
    + scale_x_continuous(breaks=range(0, 5000, 500)) \
    + xlim(high=5000) \
    + xlab('Ridership Volume') + ylab('Density')
plot

#%% Line graph showing mean entries per hour for weekdays and weekends
weekendHour = turnstile_weather[['Weekend', 'Hour', 'ENTRIESn_hourly']].groupby(['Weekend', 'Hour'], as_index=False).mean()
plot = ggplot(weekendHour, aes('Hour', 'ENTRIESn_hourly', color='Weekend')) \
    + geom_line(size=2, alpha=0.6) + geom_point(size=50, alpha=0.6) \
    + xlim(-1,24) + ylab('Mean Ridership')
plot

#%% Line graph showing mean entries per day for rainy and non rainy days
dayRain = turnstile_weather[['DayOfWeek', 'rain', 'ENTRIESn_hourly']].groupby(['DayOfWeek', 'rain'], as_index=False).mean()
plot = ggplot(dayRain, aes(x='DayOfWeek', y='ENTRIESn_hourly', fill='rain', color='rain')) \
    + geom_line(size=2, alpha=0.6) + geom_point(size=50, alpha=0.6) \
    + xlab('Day of Week') + ylab('Mean Ridership') \
    + xlim(-1, 7) \
    + scale_x_continuous(breaks=range(0, 7, 1), labels=['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
plot

#%% Line graph showing mean entries per hour for rainy and non-rainy hours
hourRain = turnstile_weather[['Hour', 'rain', 'ENTRIESn_hourly']].groupby(['Hour', 'rain'], as_index=False).mean()
plot = ggplot(hourRain, aes(x='Hour', y='ENTRIESn_hourly', fill='rain', color='rain')) \
    + geom_line(size=2, alpha=0.6) + geom_point(size=50, alpha=0.6) \
    + xlim(-1,24) + ylab('Mean Ridership') 
plot