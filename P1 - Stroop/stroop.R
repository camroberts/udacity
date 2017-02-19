# Libraries needed
library(ggplot2)
library(grid)
library(tidyr)
library(magrittr)

# Read data from CSV
setwd('C:/Users/Cameron/Udacity/P1 - Stroop')
stroop <- read.csv("stroopdata.csv")

# Add subject ID and difference
stroop$Subject <- 1:nrow(stroop)
stroop$Difference <- stroop$Incongruent - stroop$Congruent
stroop <- stroop[c(3,1,2,4)]
stroopClean <- slice(stroop, -c(15,20)) # removes outliers

# Skinny layout
stroopLong <- gather(stroop, "Task", "Elapsed", 2:4)

# Stats
stats <- aggregate(stroopLongWithDiff["Elapsed"], stroopLongWithDiff["Task"], mean) %>% data.frame()
sMedian <- aggregate(stroopLongWithDiff["Elapsed"], stroopLongWithDiff["Task"], median) %>% data.frame()
sStdDev <- aggregate(stroopLongWithDiff["Elapsed"], stroopLongWithDiff["Task"], sd) %>% data.frame()
sCount <- aggregate(stroopLongWithDiff["Elapsed"], stroopLongWithDiff["Task"], length) %>% data.frame()
stats$Median <- sMedian$Elapsed
stats$StdDev <- sStdDev$Elapsed
stats$Count <- sCount$Elapsed
colnames(stats)[2] <- "Mean"

testStats <- stats[stats$Task=="Difference",2:5]
t <- testStats$Mean/(testStats$StdDev/sqrt(testStats$Count))
tCrit <- qt(.95, testStats$Count-1)

# Plots
qplot(data=stroop, x=Difference)
bp <- ggplot(data=stroopLong, aes(x=Task, y=Elapsed, fill=Task)) +
  geom_boxplot() +
  #coord_fixed(ratio=0.1) +
  theme(aspect.ratio=1) + 
  guides(fill=FALSE)
bp

axisLimits <- c(min(stroopLong$Elapsed), max(stroopLong$Elapsed))
sp <- ggplot(data=stroop, aes(Congruent, Incongruent)) +
  scale_x_continuous(limit=axisLimits) +
  scale_y_continuous(limit=axisLimits) +
  coord_fixed() +
  geom_point() +
  geom_rug(col=rgb(.5,0,0,alpha=.5)) +
  geom_abline(colour="blue", linetype="dashed")
sp
# can change grid with breaks=round(fivenum(data$Congruent),1)

lp <- ggplot(data=stroopLong, aes(Task, Elapsed, group=Subject, colour=Subject)) + 
  geom_line() +
  geom_point() +
  scale_colour_gradientn(colours=rainbow(24), guide=FALSE)
lp

# t-test
t.test(stroop$Congruent, stroop$Incongruent, paired=TRUE)

