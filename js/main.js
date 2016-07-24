function draw(data) {
  "use strict";

  d3.select("body")
    .append("h1")
    .text("NRL Salary Cap");

  d3.select("body").append("div").attr("class", "intro");

  d3.select(".intro")
      .append("p")
      .text("The National Rugby League (NRL) is Australia's premier rugby league competition. \
        The league in its various forms has been running since 1908.  In 1990, the league \
        introduced a salary cap in an attempt to level the playing field between participating \
        clubs. I've set out to see if the cap made the competition more even by investigating the \
        which teams have won the minor premiership over the past fifty years.");

  d3.select(".intro")
      .append("p")
      .text("The chart shows as a timeseries for each team which is the number of years the club's \
        fans have been waiting to win the minor premiership. (The most important thing, right?) \
        The vertical axis represents the number of seasons since their last win or when they entered the competion. \
        A value of zero equates to winning the premiership that year. The mean number of years \
        across all teams participating in the current season is also displayed.  Finally there's a \
        series which shows the number of seasons the current winner took to win.");

  d3.select(".intro")
      .append("p")
      .text("You can toggle individual teams by clicking on the legend.");

  var svg = d3.select("body")
      .append("svg")
      .attr("width", 1200)
      .attr("height", 600)
      .append('g')
      .attr('class', 'chart');

  // Get a unique list of teams
  var teams = dimple.getUniqueValues(data, "Team");
  teams.splice(teams.indexOf("Mean"), 1);
  teams.splice(teams.indexOf("Current.Premier"), 1);
  
  // Create chart starting with all data to get legend
  var chart = new dimple.chart(svg, data);
  chart.setBounds(50, 150, 1100, 400);

  // x axis
  var x = chart.addTimeAxis("x", "Season", "%Y", "%Y"); 
  x.timeInterval = 2;
  x.fontFamily = 'Roboto';
  x.fontSize = 12;

  // y axis
  var y = chart.addMeasureAxis("y", "No.Years");
  y.fontFamily = 'Roboto';
  y.fontSize = 12;

  // series
  var series = chart.addSeries("Team", dimple.plot.line);
  series.addOrderRule(teams.concat(["Mean","Current.Premier"]));

  // legend
  var legend = chart.addLegend(100, 50, 1100, 100, "left");
  legend.fontSize = 12;
  legend.fontFamily = 'Roboto';

  // Some base colouring for mean and current premier
  chart.assignColor("Mean", "red");
  chart.assignColor("Current.Premier", "black");

  // Now draw!
  chart.draw();

  // Orphan the legend so we can make it interactive
  chart.legends = [];

  // Now filter the chart just to the mean and premier
  var visible = ["Mean", "Current.Premier"];
  series.data = dimple.filterData(data, "Team", visible);
  chart.draw();

  // Code for interactive legend
  legend.shapes.selectAll("rect")
    // Add a click event to each rectangle
    .on("click", function(e) {

      //debugger;
      // Add selected data if not visible, remove otherwise
      var selection = e.aggField.slice(-1)[0];
      var idx = visible.indexOf(selection);
      if (idx === -1) {
        // Not visible so show
        series.data = series.data.concat(dimple.filterData(data, "Team", selection));
        visible.push(selection);
      } else {
        // Already visible so hide
        visible.splice(idx, 1);
        series.data = dimple.filterData(series.data, "Team", visible);        
      }

      chart.draw(800);
        
    });

};