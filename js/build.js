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
var line, yScale, xScale, xAxis, xTickValues1200, xTickValues400s, currentDate;

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
var formatTime2 = d3.timeFormat("%m/%d/%y");
var formatTime3 = d3.timeFormat("%m/%d");

// Default settings
var show1200 = true;
var show450 = false;
var show420 = false

function setup() {
  // Create xScale - default xScale when 1200 is the only one being shown
  xScale = d3.scaleTime()
             .domain([
               d3.min(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; }),
               d3.max(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; })
             ])
             .range([dim.left, w_line-dim.right]);
  xTickValues1200 = [dataset1200[2].day, dataset1200[8].day, dataset1200[14].day,
                    dataset1200[20].day, dataset1200[26].day];
  xTickValues400s = [dataset420[2].day, dataset420[11].day, dataset420[20].day,
                     dataset420[29].day, dataset420[38].day, dataset420[47].day, dataset420[55].day];

  if (w_svg>=400) {
    xAxis = d3.axisBottom()
              .scale(xScale)
              .tickValues(xTickValues1200)
              .tickFormat(formatTime);
  }
  else {
    xAxis = d3.axisBottom()
              .scale(xScale)
              .tickValues(xTickValues1200)
              .tickFormat(formatTime2);
  }; // end if statement for determining format time
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

  // Mouseover dots
  // On mouseovers of points
  svg.selectAll(".dot").on("mouseover", function(d) {

    currentDate = d.day;
    var xPosition = parseFloat(d3.select(this).attr("cx"));

    // Change dot styles
    svg.selectAll(".dot")
        .attr("r", function(d) {
          if (d.day==currentDate) {
            return 5;
          }
          else { return 4; }
        });

    // Show date
    xAxis.ticks(1).tickValues([currentDate]) //specify an array here for values
    svg.selectAll(".xAxis").call(xAxis)
       .selectAll(".tick text")
       .style("text-anchor", function(d) {
         if (xPosition < 20) {
           return "start";
         }
         else if (xPosition > w_svg-30) {
           return "end";
         }
         else { return "middle"; }
       }) // end text anchor
  }) // end on mouseover
  svg.selectAll(".dot").on("mouseout", function(d) {
    svg.selectAll(".dot").attr("r", 4); // change dot style back

    // Change xAxis back
    if (show420 | show450) {
      xAxis.tickValues(xTickValues400s);
      svg.select(".xAxis").call(xAxis);
    }
    else {
      xAxis.tickValues(xTickValues1200);
      svg.select(".xAxis").call(xAxis);
    }
  });
}; // end setup function

function resize() {
  w_svg = document.getElementById('svg-linechart').getBoundingClientRect().width;
  w_line = w_svg - dim.left - dim.right;

  // xScale - depends on if 450 and 420 lines are shown
   if (show450 | show420) {
     xScale = d3.scaleTime()
                .domain([
                  d3.min(dataset, function(d) { return d.day; }),
                  d3.max(dataset, function(d) { return d.day; })
                ])
                .range([dim.left, w_line-dim.right]);
     xAxis.scale(xScale)
          .tickValues(xTickValues400s);
     if (w_svg>=600) { xAxis.tickFormat(formatTime); }
     else if (w_svg>=450) { xAxis.tickFormat(formatTime2); }
     else { xAxis.tickFormat(formatTime3); }
   }
   else {
     xScale = d3.scaleTime()
                .domain([
                  d3.min(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; }),
                  d3.max(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; })
                ])
                .range([dim.left, w_line-dim.right]);
     xAxis.scale(xScale)
          .tickValues(xTickValues1200);
     if (w_svg>=400) { xAxis.tickFormat(formatTime); }
     else { xAxis.tickFormat(formatTime2); }
   };
   svg.select(".xAxis")
      .attr("transform", "translate(" + dim.left + "," + (dim.h_line-dim.bottom) + ")")
      .call(xAxis);

  // Lines
  line.x(function(d) { return xScale(d.day); })
  svg.select("#group_lines")
     .select("#line1200")
     .attr("d", line); // calls line generator
  svg.select("#group_lines")
     .select("#line450")
     .attr("d", line); // calls line generator
  svg.select("#group_lines")
     .select("#line420")
     .attr("d", line); // calls line generator

  // Draw dots
  svg.select("#group_dots").selectAll(".dot")
      .attr("cx", function(d) {
        return xScale(d.day);
      });
}; // end resize function

function init() {
  setup();

  window.addEventListener("resize", resize);
}; // end init function

d3.csv('data/daily_play_counts.csv', rowConverter, function(data) {

  // save dataset
  dataset = data;
  dataset1200 = dataset.filter(function(d) { return d.queueid==1200; });
  dataset420 = dataset.filter(function(d) { return d.queueid==420; });
  dataset450 = dataset.filter(function(d) { return d.queueid==450; });

  init();

  // On button clicks
  d3.select("#button450").on("click", function() {
    // Decide if it's a click to show or hide line
    if (show450 == false) {
      show450 = true;
    }
    else { show450 = false; }
    // Draw line
    if (show450) {
      if (!show420) { // if 450 is the first line to be shown, then need to redefine xAxis and redraw lines
        // Expand xAxis
        expandAxis();

        // draw lines
        svg.select("#line450")
           .transition()
           .duration(500)
           .attr("d", line)
           .style("stroke", color450);
        svg.select("#line1200")
           .transition()
           .duration(500)
           .attr("d", line);
        svg.select("#line420") // redefine even if we don't show it
           .attr("d", line);
        svg.selectAll(".dot")
           .transition()
           .duration(500)
           .attr("cx", function(d) {
             return xScale(d.day);
           })
           .style("fill", function(d) {
             if (d.queueid == 1200) {
               return color1200;
             }
             else if (d.queueid == 450) {
               return color450;
             }
             else { return "none"; }
           });

     } // end if 420 not shown
     else { // if 420 is already shown
       svg.select("#line450") // just show the line (that should have been updated when 420 was changed)
          .style("stroke", color450);
       svg.selectAll(".dot")
          .transition()
          .duration(500)
          .attr("cx", function(d) {
            return xScale(d.day);
          })
          .style("fill", function(d) {
            if (d.queueid == 1200) {
              return color1200;
            }
            else if (d.queueid == 450) {
              return color450;
            }
            else { return color420; }
          })
     }
      // change button color
      d3.select(this).style("background-color", color450)
                     .style("color", "white");
    } // end draw line
    // Hide line
    else {
      if (!show420) { // 420 line is also hidden, change xScale back to just 1200
        shrinkAxis();
        // change lines
        svg.select("#line1200")
            .transition()
            .duration(500)
            .attr("d", line);
        svg.select("#line450") // hide line
           .attr("d", line)
           .style("stroke", "none");
        svg.select("#line420")
           .attr("d", line)
           .style("stroke", "none");
        svg.selectAll(".dot")
           .transition()
           .duration(500)
           .attr("cx", function(d) {
             return xScale(d.day);
           })
           .style("fill", function(d) {
             if (d.queueid == 1200) {
               return color1200;
             }
             else { return "none"; }
           });
      } // end if 420 line is also hidden
      else { // else 420 line is still there
        svg.select("#line450") // hide line
           .attr("d", line)
           .style("stroke", "none");
        svg.selectAll(".dot") // hide dots
           .transition()
           .duration(500)
           .attr("cx", function(d) {
             return xScale(d.day);
           })
           .style("fill", function(d) {
             if (d.queueid == 1200) {
               return color1200;
             }
             else if (d.queueid == 420) {
               return color420;
             }
             else { return "none"; }
           })
      }; // end else 420 line still there
      // change button color
      d3.select(this).style("background-color", "white")
                     .style("color", "#a19da8");
    };
  }); // end on button450 click

  d3.select("#button420").on("click", function() {
    // Decide if it's a click to show or hide line
    if (show420 == false) {
      show420 = true;
    }
    else { show420 = false; }
    // Draw line
    if (show420) {
      if (!show450) {
        // Expand xAxis
        expandAxis();
        // draw lines
        svg.select("#line420")
           .transition()
           .duration(500)
           .attr("d", line)
           .style("stroke", color420);
        svg.select("#line1200")
           .transition()
           .duration(500)
           .attr("d", line);
        svg.select("#line450") // redefine even if we don't show it
           .attr("d", line);
        svg.selectAll(".dot")
           .transition()
           .duration(500)
           .attr("cx", function(d) {
             return xScale(d.day);
           })
           .style("fill", function(d) {
             if (d.queueid == 1200) {
               return color1200;
             }
             else if (d.queueid == 420) {
               return color420;
             }
             else { return "none"; }
           })
     } // end if 450 not shown
     else { // 450 is already shown, then don't want transition
        svg.select("#line420") // just show the line (that should have been updated when 450 was changed)
           .style("stroke", color420);
        svg.selectAll(".dot")
           .transition()
           .duration(500)
           .attr("cx", function(d) {
             return xScale(d.day);
           })
           .style("fill", function(d) {
             if (d.queueid == 1200) {
               return color1200;
             }
             else if (d.queueid == 420) {
               return color420;
             }
             else { return color450; }
           })
     }
      // change button color
      d3.select(this).style("background-color", color420)
                     .style("color", "white");
    }
    // Hide line
    else {
      if (!show450) { // 450 line is also hidden, change xScale back to just 1200
        shrinkAxis();
        // change lines
        svg.select("#line1200")
           .transition()
           .duration(500)
           .attr("d", line);
        svg.select("#line420") // hide line
           .attr("d", line)
           .style("stroke", "none");
        svg.select("#line450")
           .attr("d", line)
           .style("stroke", "none");
        svg.selectAll(".dot")
           .transition()
           .duration(500)
           .attr("cx", function(d) {
             return xScale(d.day);
           })
           .style("fill", function(d) {
             if (d.queueid == 1200) {
               return color1200;
             }
             else { return "none"; }
           })
      } // end if 450 is also hidden
      else { // 450 still there
        svg.select("#line420") // hide line
           .attr("d", line)
           .style("stroke", "none");
        svg.selectAll(".dot")
           .transition()
           .duration(500)
           .attr("cx", function(d) {
             return xScale(d.day);
           })
           .style("fill", function(d) {
             if (d.queueid == 1200) {
               return color1200;
             }
             else if (d.queueid == 450) {
               return color450;
             }
             else { return "none"; }
           })
      }; // end if 450 still there
      d3.select(this).style("background-color", "white") // change button color back
                     .style("color", "#a19da8");
    }
  }); // end on button420 click

}); // end d3.csv

function expandAxis() {
  xScale = d3.scaleTime()
             .domain([
               d3.min(dataset, function(d) { return d.day; }),
               d3.max(dataset, function(d) { return d.day; })
             ])
             .range([dim.left, w_line-dim.right]);
  xAxis = d3.axisBottom()
            .scale(xScale)
            .tickValues(xTickValues400s);
  if (w_svg>=600) { xAxis.tickFormat(formatTime); }
  else if (w_svg>=450) { xAxis.tickFormat(formatTime2); }
  else { xAxis.tickFormat(formatTime3); }
  svg.select(".xAxis")
     .transition()
     .duration(500)
     .call(xAxis);

  line = d3.line() // redefine line again because xScale changed
           .x(function(d) { return xScale(d.day); })
           .y(function(d) { return yScale(d.ngames); });
}; // end expand Axis function

function shrinkAxis() {
  xScale = d3.scaleTime()
             .domain([
               d3.min(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; }),
               d3.max(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; })
             ])
             .range([dim.left, w_line-dim.right]);
  xAxis = d3.axisBottom()
            .scale(xScale)
            .tickValues(xTickValues1200);
  if (w_svg>=400) { xAxis.tickFormat(formatTime); }
  else { xAxis.tickFormat(formatTime2); }
  svg.select(".xAxis")
     .attr("transform", "translate(" + dim.left + "," + (dim.h_line-dim.bottom) + ")")
     .transition()
     .duration(500)
     .call(xAxis);
  line = d3.line() // redefine line again because xScale changed
           .x(function(d) { return xScale(d.day); })
           .y(function(d) { return yScale(d.ngames); });
}; // end shrinkAxis
