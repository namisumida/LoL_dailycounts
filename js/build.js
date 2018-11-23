var svg = d3.select("#svg-linechart");
var dataset, dataset420, dataset450, dataset1200;
var ma1200, ma420, ma450;

// Dimensions
var w_svg = document.getElementById('svg-linechart').getBoundingClientRect().width; // get width and height based on window size
var dim = { top:5, bottom:20, left:5, right:5,
            h_line: 300 };
var w_line = w_svg - dim.left - dim.right;

// Colors
var color1200 = d3.rgb(191,59,39);
var color450 = d3.rgb(148,157,72);
var color420 = d3.rgb(69,106,131);

// Saving variables
var line, yScale, xScale, xAxis, xTickValues1200, xTickValues400s;

// Data changes
var parseTime = d3.timeParse("%Y-%m-%d");
var rowConverter = function(d) {
  return {
    day: parseTime(d.day),
    queueid: parseInt(d.queueid),
    ngames: parseInt(d.ngames)
  }
};
var formatTime = d3.timeFormat("%b %d, %Y"); // date to string;

// Default settings
var show1200 = true;
var show450 = false;
var show420 = false

d3.csv('data/daily_play_counts.csv', rowConverter, function(data) {

  // save dataset
  dataset = data;
  dataset1200 = dataset.filter(function(d) { return d.queueid==1200; })
  dataset420 = dataset.filter(function(d) { return d.queueid==420; })
  dataset450 = dataset.filter(function(d) { return d.queueid==450; })

  // Create xScale - default xScale when 1200 is the only one being shown
  xScale = d3.scaleTime()
             .domain([
               d3.min(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; }),
               d3.max(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; })
             ])
             .range([dim.left, w_line-dim.right]);
  xTickValues1200 = [dataset1200[2].day, dataset1200[8].day, dataset1200[14].day,
                    dataset1200[20].day, dataset1200[26].day]
  xAxis = d3.axisBottom()
            .scale(xScale)
            .tickValues(xTickValues1200)
            .tickFormat(formatTime);
  svg.append("g")
     .attr("class", "xAxis")
     .attr("transform", "translate(" + dim.left + "," + (dim.h_line-dim.bottom) + ")")
     .call(xAxis);

  // Create yScale - always showing 1200, and that has the max
  yScale = d3.scaleLinear()
                 .domain([
                   d3.min(dataset, function(d) { return d.ngames; }),
                   d3.max(dataset, function(d) { return d.ngames; })
                 ])
                 .range([dim.h_line-dim.bottom-10, dim.top]); // -10 to account for xAxis

  // Create lines
  line = d3.line()
           .x(function(d) { return xScale(d.day); })
           .y(function(d) { return yScale(d.ngames); });
  var group_lines = svg.append("g")
                       .attr("id", "group_lines");
  group_lines.append("path")
             .datum(dataset.filter(function(d) { return d.queueid==1200; }))
             .attr("class", "line")
             .attr("id", "line1200")
             .attr("stroke", color1200)
             .attr("d", line); // calls line generator
  group_lines.append("path")
             .datum(dataset.filter(function(d) { return d.queueid==450; }))
             .attr("class", "line")
             .attr("id", "line450")
             .style("stroke", "none")
             .attr("d", line); // calls line generator
  group_lines.append("path")
             .datum(dataset.filter(function(d) { return d.queueid==420; }))
             .attr("class", "line")
             .attr("id", "line420")
             .style("stroke", "none")
             .attr("d", line); // calls line generator

  // Draw dots
  var group_dots = svg.append("g")
                      .attr("id", "group_dots");
  group_dots.selectAll("dot")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", function(d) {
              return xScale(d.day);
            })
            .attr("cy", function(d) {
              return yScale(d.ngames);
            })
            .attr("r", 4)
            .style("fill", function(d) {
              if (d.queueid==1200) {
                return color1200;
              }
              else { return "none"; }
            });

}); // end d3.csv
