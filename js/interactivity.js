var currentDate;

d3.csv("data/daily_play_counts.csv", rowConverter, function(data) {

  xTickValues400s = [dataset420[2].day, dataset420[11].day, dataset420[20].day,
                     dataset420[29].day, dataset420[38].day, dataset420[47].day, dataset420[55].day];

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

  /*  // Show count
    document.getElementById("counttext1200").innerHTML = d3.format(",")(dataset1200.filter(function(d) { return d.day==currentDate; })[0].ngames);
    document.getElementById("counttext450").innerHTML = d3.format(",")(dataset450.filter(function(d) { return d.day==currentDate; })[0].ngames);
    document.getElementById("counttext420").innerHTML = d3.format(",")(dataset420.filter(function(d) { return d.day==currentDate; })[0].ngames);
*/
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
  })

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
        xScale = d3.scaleTime()
                   .domain([
                     d3.min(dataset, function(d) { return d.day; }),
                     d3.max(dataset, function(d) { return d.day; })
                   ])
                   .range([dim.left, w_line-dim.right]);
        xAxis = d3.axisBottom()
                  .scale(xScale)
                  .tickValues(xTickValues400s)
                  .tickFormat(formatTime);
        svg.select(".xAxis")
           .transition()
           .duration(800)
           .call(xAxis);

        // Show line
        line = d3.line() // redefine line again because xScale changed
                 .x(function(d) { return xScale(d.day); })
                 .y(function(d) { return yScale(d.ngames); });
        svg.select("#line450")
           .transition()
           .duration(800)
           .attr("d", line)
           .style("stroke", color450);
        svg.select("#line1200")
           .transition()
           .duration(800)
           .attr("d", line);
        svg.select("#line420") // redefine even if we don't show it
           .attr("d", line);
        svg.selectAll(".dot")
           .transition()
           .duration(800)
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
          .duration(800)
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
        xScale = d3.scaleTime()
                   .domain([
                     d3.min(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; }),
                     d3.max(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; })
                   ])
                   .range([dim.left, w_line-dim.right]);
        xAxis = d3.axisBottom()
                  .scale(xScale)
                  .tickValues(xTickValues1200)
                  .tickFormat(formatTime);
        svg.select(".xAxis")
           .attr("transform", "translate(" + dim.left + "," + (dim.h_line-dim.bottom) + ")")
           .transition()
           .duration(800)
           .call(xAxis);
        line = d3.line() // redefine line again because xScale changed
                 .x(function(d) { return xScale(d.day); })
                 .y(function(d) { return yScale(d.ngames); });
        svg.select("#line1200")
            .transition()
            .duration(800)
            .attr("d", line);
        svg.select("#line450") // hide line
           .attr("d", line)
           .style("stroke", "none");
        svg.select("#line420")
           .attr("d", line)
           .style("stroke", "none");
        svg.selectAll(".dot")
           .transition()
           .duration(800)
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
           .duration(800)
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
        xScale = d3.scaleTime()
                   .domain([
                     d3.min(dataset, function(d) { return d.day; }),
                     d3.max(dataset, function(d) { return d.day; })
                   ])
                   .range([dim.left, w_line-dim.right]);
        xAxis = d3.axisBottom()
                      .scale(xScale)
                      .tickValues(xTickValues400s)
                      .tickFormat(formatTime);
        svg.select(".xAxis")
           .attr("transform", "translate(" + dim.left + "," + (dim.h_line-dim.bottom) + ")")
           .transition()
           .duration(800)
           .call(xAxis)
        // Show line
        var line = d3.line()
                 .x(function(d) { return xScale(d.day); })
                 .y(function(d) { return yScale(d.ngames); });
        svg.select("#line420")
           .transition()
           .duration(800)
           .attr("d", line)
           .style("stroke", color420);
        svg.select("#line1200")
           .transition()
           .duration(800)
           .attr("d", line);
        svg.select("#line450") // redefine even if we don't show it
           .attr("d", line);
        svg.selectAll(".dot")
           .transition()
           .duration(800)
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
           .duration(800)
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
        xScale = d3.scaleTime()
                   .domain([
                     d3.min(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; }),
                     d3.max(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; })
                   ])
                   .range([dim.left, w_line-dim.right]);
        xAxis = d3.axisBottom()
                  .scale(xScale)
                  .tickValues(xTickValues1200)
                  .tickFormat(formatTime);
        svg.select(".xAxis")
           .attr("transform", "translate(" + dim.left + "," + (dim.h_line-dim.bottom) + ")")
           .transition()
           .duration(800)
           .call(xAxis);
        line = d3.line() // redefine line again because xScale changed
                 .x(function(d) { return xScale(d.day); })
                 .y(function(d) { return yScale(d.ngames); });
        svg.select("#line1200")
           .transition()
           .duration(800)
           .attr("d", line);
        svg.select("#line420") // hide line
           .attr("d", line)
           .style("stroke", "none");
        svg.select("#line450")
           .attr("d", line)
           .style("stroke", "none");
        svg.selectAll(".dot")
           .transition()
           .duration(800)
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
           .duration(800)
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
