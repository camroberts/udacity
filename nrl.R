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

nrl <- spread(nrl_long, 'Year', 'Position')
write.csv(nrl, 'data/nrl.csv', na = "", row.names = FALSE)

# There must be a way to do all these calcs without loops in R, 
# but I don't have the time to figure it out today.

# No. years since last premiership ---------------
years_since_1 <- nrl
for (i in 2:ncol(years_since_1)) {
  prem <- !is.na(years_since_1[,i]) & years_since_1[,i] == 1
  notPrem <- !is.na(years_since_1[,i]) & years_since_1[,i] != 1
  years_since_1[prem,i] <- 0
  if (i == 2) {
    years_since_1[notPrem,i] <- 1
  } else {
    prev <- years_since_1[,i-1]
    prev[is.na(prev)] <- 0
    years_since_1[notPrem,i] <- prev[notPrem] + 1
  }
}

# No. unique premiers in last n-years -----------------
n <- 10
uq_prems <- nrl[1,-1]
for (i in 2:ncol(nrl)) {
  if (i == 2) {
    uq_prems[i-1] <- 1
  } else {
    prems <- which(nrl[,(i-(min(i-1,n)-1)):i] == 1, arr.ind = TRUE)
    uq_prems[i-1] <- length(unique(prems[,1]))  
  }
}

# Perc of teams premiers in last n-years -----------------
n <- 10
prem_perc <- nrl[1,-1]
for (i in 2:ncol(nrl)) {
  if (i == 2) {
    prem_perc[i-1] <- 1/sum(!is.na(nrl[,i]))
  } else {
    results <- nrl[,(i-(min(i-1,n)-1)):i]
    prems <- which(results == 1, arr.ind = TRUE)
    teams <- which(!is.na(results), arr.ind = TRUE)
    prem_perc[i-1] <- length(unique(prems[,1]))/length(unique(teams[,1]))
  }
}

# Perc of possible premiers in last n-years -----------------
n <- 10
prem_perc <- nrl[1,-1]
for (i in 2:ncol(nrl)) {
  if (i == 2) {
    prem_perc[i-1] <- 1/min(n, sum(!is.na(nrl[,i])))
  } else {
    results <- nrl[,(i-(min(i-1,n)-1)):i]
    prems <- which(results == 1, arr.ind = TRUE)
    teams <- which(!is.na(results), arr.ind = TRUE)
    prem_perc[i-1] <- length(unique(prems[,1]))/min(n, length(unique(teams[,1])))
  }
}

# Distribution of results --------------
