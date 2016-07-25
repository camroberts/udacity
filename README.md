# NRL Salary Cap

## Summary
The National Rugby League (NRL) is Australia's premier rugby league football competition. The league in its various forms has been running since 1908. In 1990, the league introduced a salary cap in an attempt to level the playing field between participating clubs. I've set out to see if the cap made the competition more even by investigating the end of regular season standings of participating teams over the past fifty years. Primarily I'm interested in how many seasons pass between minor premiership wins (ie. finishing first in the table) and how long the fans are waiting for their team to win.  After all, this is the often the most important thing to a fan - winning.

I've used the minor premiership rather than the champion or grand final winner since I feel that a team which leads over twenty or thirty rounds and loses the final is still the best performing team of that season. However, many would argue fans care more about the grand final winner. So this analysis could be performed again using that as the benchmark instead.

There is more information about how to interpret the final visualisation included in the webpage itself.

## Design
I really wanted to involve the viewer in the chart, to allow them to discover their own insights.  My two main ideas for the chart were:

1. A chart which shows the number of unique winners of the minor premiership in the last n years. The viewer would be able to choose n.
2. A chart which shows the number of years each team has been waiting to win the minor premiership. The viewer would be able to choose different teams.

Ultimately, I choose the second option as I felt this was more engaging. Especially if the viewer is a rugby league fan and is able to choose their own team.  As well as hopefully illustrating if the salary cap did or did not have a levelling effect the chart also provides a neat way of showing the history of the competition.

I chose to implement the chart in Dimple.js rather than D3.js as I thought being a relatively straight forward line chart, it would be smoother experience.  However, even with this chart, I feel I reached the limit of what could be done with Dimple and I regretted my choice in the end.  The availability of features somewhat determined the final design, more of which I'll discuss in the feedback section.

The interactivity of the chart is provided through the legend. I found examples of Dimple.js charts using the legend as buttons. While the end product works, I'm not 100% happy with the method. Without explaining, it's not obvious the legend behaves like this, and it's clumsy to implement.

## Feedback
### Round 1
The visualisation provided in folder v0.1 was the first attempt at the chart and was quite a rough sketch basically. I provided the chart to my father.

#### Feedback
* When I clicked on the legend I was unable to get back to the original graph.
* Perhaps "Premier" and "Mean" get lost in the legend.
* Some Teams/colors are very hard to see.
* So, if the salary cap was effective how would that be revealed on the graph?
* The graphic, on first impressions, seems to be very busy with lots of lines.
* I am not sure the data is represented correctly. For example, in 1998 it shows Brisbane 0 years.  We interpret this to mean they won the premiership in 1998.
But in 2000 Team Brisbane 0 years. But it would in fact be 2 years since they won it if they won it in 1998.
In 2001 it says New Zealand 1. If that is the case wouldn't that mean they won it in 2000?  But Brisbane did.
* The time period is maybe too long. Perhaps just look at 25yrs before and after the salary cap introduction.

#### Response
As a result of dad's feedback I made the following major changes:
* Restricted the data set to 1965 - 2015.
* Gave up on "greying out" the unselected teams since I could not achieve the polish with Dimple I required. Instead I changed to filtering the data so that only selected lines are show.
* Made the premier and mean lines stand out in bolder red and black colours.

### Round 2
The visualisation provided in folder v0.2 was the second attempt and was sent to my mother for feedback.

#### Feedback
* Would it be clearer if you named the vertical axis "No. of years since winning Minor Premiership"?
* Can you change the labels on the horizontal axis to say the year & the minor premier for that year?
* I had a look at Cronulla. 1998 shows 1 year since winning, but 1997 was not won by Cronulla.
* Not sure what "All" is

#### Response
After my mum's feedback I made the following changes:
* Improved the All button to Show All and Reset.
* Investigated some of the data issues. I discovered the problem leading to misinterpreted results is that in the late nineties there was a lot of upheaval in the competition. In fact a rival league ran for a single season and around half the teams defected to that competition before returning the following. As a side effect, the count of the number of years since winning or entering the competition was reset. I overcame this issue, by treating this gap year as a continuation in which the non-competing teams did not win.
* Customised the tool tips for the "Winner" series to show the name of the winning team for that year.
* Updated the descriptive text and axes labels.

### Round 3
Folder v0.3 contains the third version for which I sought feedback. This time, my wife was the victim.

#### Feedback
*

#### Response

## Resources
* http://www.rugbyleagueproject.org/competitions/nrl/seasons.html
* http://dimplejs.org/advanced_examples_viewer.html?id=advanced_interactive_legends
* http://stackoverflow.com/questions/25698268/dimple-js-d3-js-how-to-toggle-series
* https://github.com/PMSI-AlignAlytics/dimple/wiki/dimple.chart#assignColor
* http://dimplejs.org/examples_viewer.html?id=lines_horizontal_stacked
* http://stackoverflow.com/questions/26770631/dimple-js-dash-line-chart
* http://stackoverflow.com/questions/37127607/change-dimplejs-linemarker-style
* https://github.com/PMSI-AlignAlytics/dimple/wiki/dimple.legend
* http://stackoverflow.com/questions/4170117/how-to-parse-the-year-from-this-date-string-in-javascript
* http://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-in-javascript
