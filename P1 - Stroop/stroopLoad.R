# Libraries needed
require(ggplot2)
require(grid)
require(tidyr)
require(magrittr)
require(knitr)
require(extrafont)

# Read data from CSV
setwd('C:/Users/Cameron/Udacity/P1 - Stroop')
stroop <- read.csv("stroopdata.csv")

# Add subject ID and difference
stroop$Subject <- 1:nrow(stroop)
stroop$Difference <- stroop$Incongruent - stroop$Congruent
stroop <- stroop[c(3,1,2,4)]

# Skinny layout
stroopLongWithDiff <- gather(stroop, "Task", "Elapsed", 2:4)
stroopLong <- gather(stroop, "Task", "Elapsed", 2:3)
