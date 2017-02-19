library(ggplot2)
library(scales)
require(dplyr)
require(tidyr)

setwd('C:/Users/Cameron/Udacity/P2 - Subway')
subway <- read.csv("turnstile_data_master_with_weather.csv")
subway$rain <- factor(subway$rain)
levels(subway$rain) <- c('Not raining', 'Raining')
subway$Date <- as.Date(subway$DATEn, format='%Y-%m-%d')
subway$Dow <- factor(as.POSIXlt(subway$Date)$wday)
subway$UNIT <- factor(subway$UNIT)
subway$Weekend <- subway$Dow == 0 | subway$Dow == 6

# Histogram
plot <- ggplot(subway, aes(x=ENTRIESn_hourly))
plot <- plot + geom_histogram(binwidth=100, alpha=0.6)
plot <- plot + scale_x_continuous(limits=c(0,5000), breaks=seq(0, 5000, 1000))
plot <- plot + scale_y_continuous(limits=c(0,35000), breaks=seq(0, 35000, 5000))
plot <- plot + xlab('Ridership Volume') + ylab('Frequency')
plot <- plot + facet_grid(. ~ rain)
plot

# Difference from overall mean
hourRain <- subway %>% group_by(Hour, rain) %>% summarise(mean = mean(ENTRIESn_hourly))
hour <- subway %>% group_by(Hour) %>% summarise(hourly_mean = mean(ENTRIESn_hourly))
hourRain <- inner_join(hourRain, hour, by='Hour')
hourRain['Diff'] <- (hourRain['mean'] - hourRain['hourly_mean'])/hourRain['hourly_mean']
plot <- ggplot(hourRain, aes(Hour, Diff, colour=rain))
plot <- plot + geom_line(size=1)
plot <- plot + scale_x_continuous(limits=c(-1,24), breaks=seq(0,24,2))
plot <- plot + ylab('Perc difference in Mean Ridership')
plot <- plot + scale_y_continuous(labels=percent,limits=c(-0.1,0.1))
plot <- plot + scale_colour_discrete(name='')
plot

# Heat map of mean diff, hour by day
dayHourRain <- subway %>% group_by(Dow, Hour, rain) %>% summarise(ENTRIESn_hourly = mean(ENTRIESn_hourly))
dayHour <- spread(dayHourRain, rain, ENTRIESn_hourly)
dayHour['Diff'] <- dayHour['Raining'] - dayHour['Not raining']
plot <- ggplot(dayHour, aes(Dow, Hour))
plot <- plot + geom_tile(aes(fill=Diff))
plot <- plot + scale_fill_gradient2(low="blue", high="red")
plot <- plot + scale_x_discrete(expand=c(0,0)) + scale_y_continuous(expand=c(0,0), breaks=0:23)
plot
