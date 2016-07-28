function draw(data) {
    "use strict";

    // base svg element
    var svg = d3.select(".chart")
        .append("svg")
        .attr("width", 1200)
        .attr("height", 600)
        .append('g')
        .attr('class', 'chart');

    // Get a unique list of teams
    var teams = dimple.getUniqueValues(data, "Team");
    teams.splice(teams.indexOf("Show All"), 1);
    teams.splice(teams.indexOf("Reset"), 1);
    var teamsPlus = teams.slice();
    teams.splice(teams.indexOf("Mean"), 1);
    teams.splice(teams.indexOf("Winner"), 1);
    teams.splice(teams.indexOf("Mean.Before"), 1);
    teams.splice(teams.indexOf("Mean.After"), 1);

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
    var baseCat = ["Winner", "Mean", "Mean.Before", "Mean.After"];
    var series = chart.addSeries("Team", dimple.plot.line);
    series.addOrderRule(teams.concat(baseCat)
        .concat(["Show All", "Reset"]));

    // legend
    var legend = chart.addLegend(100, 50, 1100, 100, "left");
    legend.fontSize = 12;
    legend.fontFamily = 'Roboto';

    // Colouring for mean and current premier
    chart.assignColor("Mean", "red");
    chart.assignColor("Mean.Before", "red");
    chart.assignColor("Mean.After", "red");
    chart.assignColor("Winner", "black");
    chart.assignColor("Show All", "white");
    chart.assignColor("Reset", "white");

    // Colouring for teams!
    chart.assignColor("Adelaide", "#ffcc00");
    chart.assignColor("Balmain", "#ff6600");
    chart.assignColor("Brisbane", "maroon");
    chart.assignColor("Canberra", "lime");
    chart.assignColor("Canterbury", "#3333cc");
    chart.assignColor("Cronulla", "#99ccff");
    chart.assignColor("Eastern.Sydney", "#003366");
    chart.assignColor("Gold.Coast", "#00ffcc");
    chart.assignColor("Gold.Coast.Titans", "#00cc99");
    chart.assignColor("Illawarra", "red");
    chart.assignColor("Manly.Warringah", "#b30000");
    chart.assignColor("Melbourne", "#660033");
    chart.assignColor("Newcastle", "#990033");
    chart.assignColor("Newtown", "#0066ff");
    chart.assignColor("North.Queensland", "#52527a");
    chart.assignColor("North.Sydney", "#4d0000");
    chart.assignColor("Parramatta", "yellow");
    chart.assignColor("Penrith", "brown");
    chart.assignColor("South.Queensland", "#b3b300");
    chart.assignColor("South.Sydney", "#009900");
    chart.assignColor("St.George", "#ff6666");
    chart.assignColor("St.George.Illawarra", "red");
    chart.assignColor("Warriors", "black");
    chart.assignColor("Western.Reds", "#993300");
    chart.assignColor("Western.Suburbs", "#3d3d29");
    chart.assignColor("Wests.Tigers", "#ff6600");

    // Add custom tooltip
    series.getTooltipText = function(e) {
        var str = []
        if (e.aggField[0] === 'Winner') {
            // figure out the premier - this isn't very nice
            //debugger;
            for (var i = 0; i < this.x.chart.data.length; i++) {
                if (this.x.chart.data[i]["No.Years"] == 0) {
                    // It's a winner, but which year?
                    var d = new Date(e.x);
                    if (this.x.chart.data[i]["Season"] == d.getFullYear()) {
                        // Found it!
                        str.push(this.x.chart.data[i]["Team"]);
                        break;
                    }
                }
            }
        } else {
            str.push(e.aggField[0]);
        }
        var d = new Date(e.x);
        str.push("Season: " + d.getFullYear());
        str.push("No. Years: " + Math.round(e.y * 100) / 100);
        return str;
    };

    // Now draw!
    chart.draw();

    //debugger;
    // Hide legend items I don't want to show - can't get this to work
    //legend.shapes.select(".dimple-mean-pre").text("");
    //legend.shapes.select(".dimple-mean-pre").style("fill","white");

    // legend title
    svg.selectAll("title_text")
        .data(["Click legend to choose team:"])
        .enter()
        .append("text")
        .attr("x", 100)
        .attr("y", 30)
        .style("font-family", "Roboto")
        .style("font-size", "12px")
        .style("color", "Black")
        .text(function(d) {
            return d;
        });

    // Orphan the legend so we can make it interactive
    chart.legends = [];

    // Now filter the chart just to the means and premier
    var baseData = dimple.filterData(data, "Team", baseCat);
    series.data = baseData;
    chart.draw();

    // Make mean pre and post dotted
    svg.selectAll("path.dimple-mean-before")
        .style("stroke-dasharray", "2");
    svg.selectAll("path.dimple-mean-after")
        .style("stroke-dasharray", "2");
    svg.selectAll("path.dimple-mean")
        .style("stroke-dasharray", "10,2")
    svg.selectAll("path.dimple-winner")
        .style("stroke-dasharray", "10,2")

    // Add vertical line to show salary cap start
    var salaryCapStart = new Date("1990");
    svg.append("line")
        .attr("x1", x._scale(salaryCapStart))
        .attr("x2", x._scale(salaryCapStart))
        .attr("y1", chart._yPixels())
        .attr("y2", chart._yPixels() + chart._heightPixels())
        .style("stroke", "grey")
        .style("stroke-dasharray", "3");

    // Code for interactive legend
    var visible = [];
    legend.shapes.selectAll("rect")
        // Add a click event to each rectangle
        .on("click", function(e) {

            // Add selected data if not visible, remove otherwise
            var selection = e.aggField.slice(-1)[0];
            if (selection === "Show All") {
                series.data = dimple.filterData(data, "Team", teamsPlus);
                visible = teams;
            } else if (selection === "Reset") {
                series.data = baseData;
                visible = [];
            } else if (baseCat.indexOf(selection) == -1) {
                var idx = visible.indexOf(selection);
                if (idx === -1) {
                    // Not visible so show
                    visible.push(selection);
                } else {
                    // Already visible so hide
                    visible.splice(idx, 1);
                }
                series.data = baseData.concat(dimple.filterData(data,
                    "Team", visible));
            }

            chart.draw(800);

        });

};