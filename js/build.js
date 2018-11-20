var svg = d3.select("#svg-linechart");
var dataset;

// Dimensions
var w_svg = document.getElementById('svg-linechart').getBoundingClientRect().width; // get width and height based on window size
var dim = { top:5, bottom:20, left:5, right:5,
            h_line: 300 };
var w_line = w_svg - dim.left - dim.right;

// Colors
var color1200 = d3.rgb(191,59,39);
var color450 = d3.rgb(148,157,72);
var color420 = d3.rgb(69,106,131);

var line, yScale, xScale;

// Data changes
var parseTime = d3.timeParse("%Y-%m-%d");
var rowConverter = function(d) {
  return {
    day: parseTime(d.day),
    queueid: parseInt(d.queueid),
    ngames: parseInt(d.ngames)
  }
}

// Default settings
var show1200 = true;
var show450 = false;
var show420 = false

d3.csv('data/daily_play_counts.csv', rowConverter, function(data) {

  // save dataset
  dataset = data;

  // Create xScale - default xScale when 1200 is the only one being shown
  xScale = d3.scaleTime()
             .domain([
               d3.min(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; }),
               d3.max(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; })
             ])
             .range([dim.left, w_line-dim.right]);

  // Create yScale - always showing 1200, and that has the max
  yScale = d3.scaleLinear()
                 .domain([
                   d3.min(dataset, function(d) { return d.ngames; }),
                   d3.max(dataset, function(d) { return d.ngames; })
                 ])
                 .range([dim.h_line-dim.bottom-10, dim.top]); // -10 to account for xAxis

  // Create x axis
  var xAxis = d3.axisBottom()
                .scale(xScale)
                .ticks(5);
  svg.append("g")
     .attr("class", "xAxis")
     .attr("transform", "translate(" + dim.left + "," + (dim.h_line-dim.bottom) + ")")
     .call(xAxis);

/*
  group_dots = svg.append("g")
                  .attr("id", "group_dots")
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
            .attr("r", 2)
            .style("fill", function(d) {
              if (d.queueid==1200) {
                return color1200;
              }
              else if (d.queueid==450) {
                return color450;
              }
              else {
                return color420;
              }
            });*/

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

}); // end d3.csv
