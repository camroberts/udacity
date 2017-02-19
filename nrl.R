# Libraries ----------------
library(ggplot2)
library(tidyr)
library(dplyr)

# Load data ------------
nrl_raw <- read.csv('data/nrl_raw.csv', na.strings = "")

nrl_long <- gather(nrl_raw, 'Year', 'Team', 2:ncol(nrl_raw))
nrl_long <- nrl_long[complete.cases(nrl_long),]
nrl_long$Year <- substr(nrl_long$Year, 2, 5)
write.csv(nrl_long, 'data/nrl_long.csv')

nrl <- spread(nrl_long, 'Team', 'Position')
nrl <- data.frame(nrl[,-1], row.names = nrl[,1])
write.csv(nrl, 'data/nrl.csv', na = "")

# There must be a way to do all these calcs without loops in R, 
# but I don't have the time to figure it out today.

# No. years since last premiership ---------------
years_since_1 <- nrl
for (i in 1:nrow(years_since_1)) {
  prem <- !is.na(years_since_1[i,]) & years_since_1[i,] == 1
  notPrem <- !is.na(years_since_1[i,]) & years_since_1[i,] != 1
  years_since_1[i,prem] <- 0
  if (i == 1) {
    years_since_1[i,notPrem] <- 1
  } else {
    prev <- years_since_1[i-1,]
    prev[is.na(prev)] <- 0
    if (rownames(years_since_1)[i] == 1997) {
      # Super league - so don't restart counts
      notPrem <- !is.na(years_since_1[i-1,]) | !is.na(years_since_1[i,])
      notPrem[prem] <- FALSE
    } else if (rownames(years_since_1)[i] == 1999) {
      # St George and Illawarra merged, so take the mean of the two
      prev$St.George.Illawarra <- ceiling(prev$St.George * 0.5 + prev$Illawarra * 0.5)
    } else if (rownames(years_since_1)[i] == 2000) {
      # Balmain and Wests merged, so tahe the mean of the two
      prev$Wests.Tigers <- ceiling(prev$Western.Suburbs * 0.5 + prev$Balmain * 0.5)
    }
    years_since_1[i,notPrem] <- prev[notPrem] + 1
  }
}
mean_years <- rowMeans(years_since_1, na.rm = TRUE)
years_since_1['Mean'] <- mean_years
mean_years <- data.frame(mean = mean_years, year = as.numeric(names(mean_years)))
years_since_1['Mean.Before'] <- mean(mean_years[mean_years$year < 1990 & mean_years$year >= 1965,1])
years_since_1['Mean.After'] <- mean(mean_years[mean_years$year >= 1990,1])

# No. years since current premier won ---------------
prem <- which(years_since_1 == 0, arr.ind = TRUE)
prem[,1] <- prem[,1]-1
prem['1908',1] <- 1
prem <- prem[order(rownames(prem)),]
years_between <- data.frame(years_since_1[prem], row.names = row.names(prem))
years_between[is.na(years_between)] <- 0
years_since_1['Winner'] <- years_between

# Output results ---------------
# Dimple/D3 like it in long format
stats <- data.frame(Season = rownames(years_since_1), years_since_1)
stats <- gather(stats, Team, No.Years, -Season)
stats <- stats[!is.na(stats$No.Years),]

# Filter to 1965 to 2015
stats$Season <- as.numeric(as.character(stats$Season))
stats <- stats[stats$Season >= 1965,]

stats <- stats[!(stats$Season < 1990 & stats$Team == "Mean.After"),]
stats <- stats[!(stats$Season > 1990 & stats$Team == "Mean.Before"),]

# Add dummy "All/None" team
stats <- rbind(stats, c(2015, 'Show All', -1))
stats <- rbind(stats, c(2015, 'Reset', -1))
write.csv(stats, 'data/nrl_stats.csv', na = "", row.names = FALSE)
