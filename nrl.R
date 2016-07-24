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
    years_since_1[i,notPrem] <- prev[notPrem] + 1
  }
}
mean_years <- rowMeans(years_since_1, na.rm = TRUE)
years_since_1['Mean'] <- mean_years

# No. years since current premier won ---------------
prem <- which(years_since_1 == 0, arr.ind = TRUE)
prem[,1] <- prem[,1]-1
prem['1908',1] <- 1
prem <- prem[order(rownames(prem)),]
years_between <- data.frame(years_since_1[prem], row.names = row.names(prem))
years_between[is.na(years_between)] <- 0
years_since_1['Premier'] <- years_between

# Output results ---------------
# Dimple/D3 like it in long format
stats <- data.frame(Season = rownames(years_since_1), years_since_1)
stats <- gather(stats, Team, No.Years, -Season)
stats <- stats[!is.na(stats$No.Years),]

# Add dummy "All" team
stats <- rbind(stats, c(2015, 'All', -1))
write.csv(stats, 'data/nrl_stats.csv', na = "", row.names = FALSE)

# No. unique premiers in last n-years -----------------
n <- 10
uq_prems <- data.frame(integer(nrow(nrl)), row.names = rownames(nrl))
for (i in 1:nrow(nrl)) {
  if (i == 1) {
    uq_prems[i,] <- 1
  } else {
    prems <- which(nrl[(i-(min(i,n)-1)):i,] == 1, arr.ind = TRUE)
    uq_prems[i,] <- length(unique(prems[,2]))  
  }
}

# Perc of possible premiers in last n-years -----------------
n <- 10
prem_perc <- data.frame(integer(nrow(nrl)), row.names = rownames(nrl))
for (i in 1:nrow(nrl)) {
  if (i == 1) {
    prem_perc[i,] <- 1/min(n, sum(!is.na(nrl[i,])))
  } else {
    results <- nrl[(i-(min(i,n)-1)):i,]
    prems <- which(results == 1, arr.ind = TRUE)
    teams <- which(!is.na(results), arr.ind = TRUE)
    prem_perc[i,] <- length(unique(prems[,2]))/min(n, length(unique(teams[,2])))
  }
}

yearly_summary <- data.frame(years_between, mean_years, uq_prems, prem_perc)
colnames(yearly_summary) <- c('years_between', 'mean_years', 'unique_prems', 
                              'prem_perc')


write.csv(yearly_summary, 'data/nrl_yearly_stats.csv', na = "")
