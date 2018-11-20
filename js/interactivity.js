
d3.csv("data/daily_play_counts.csv", rowConverter, function(data) {

  d3.select("#button450").on("click", function() {
    // Decide if it's a click to show or hide line
    if (show450 == false) {
      show450 = true;
    }
    else { show450 = false; }

    // Draw line
    if (show450) {
      // Expand xAxis
      xScale = d3.scaleTime()
                 .domain([
                   d3.min(dataset, function(d) { return d.day; }),
                   d3.max(dataset, function(d) { return d.day; })
                 ])
                 .range([dim.left, w_line-dim.right]);
      xAxis = d3.axisBottom()
                    .scale(xScale)
                    .ticks(5);
      svg.select(".xAxis")
         .attr("transform", "translate(" + dim.left + "," + (dim.h_line-dim.bottom) + ")")
         .call(xAxis);
      // Show line
      line = d3.line() // redefine line again because xScale changed
               .x(function(d) { return xScale(d.day); })
               .y(function(d) { return yScale(d.ngames); });
      svg.select("#line450")
         .attr("d", line)
         .style("stroke", color450);
      svg.select("#line1200")
         .attr("d", line);
      // change button color
      d3.select(this).style("background-color", color450)
                     .style("color", "white");
    }
    // Hide line
    else {
      svg.select("#line450") // hide line
         .style("stroke", "none");
      if (show420 == false) { // 420 line is also hidden, change xScale back to just 1200
        xScale = d3.scaleTime()
                   .domain([
                     d3.min(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; }),
                     d3.max(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; })
                   ])
                   .range([dim.left, w_line-dim.right]);
        xAxis = d3.axisBottom()
                  .scale(xScale)
                  .ticks(5);
        svg.select(".xAxis")
           .attr("transform", "translate(" + dim.left + "," + (dim.h_line-dim.bottom) + ")")
           .call(xAxis);
        line = d3.line() // redefine line again because xScale changed
                 .x(function(d) { return xScale(d.day); })
                 .y(function(d) { return yScale(d.ngames); });
        svg.select("#line1200")
           .attr("d", line);
      }
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
      // Expand xAxis
      xScale = d3.scaleTime()
                 .domain([
                   d3.min(dataset, function(d) { return d.day; }),
                   d3.max(dataset, function(d) { return d.day; })
                 ])
                 .range([dim.left, w_line-dim.right]);
      xAxis = d3.axisBottom()
                    .scale(xScale)
                    .ticks(5);
      svg.select(".xAxis")
         .attr("transform", "translate(" + dim.left + "," + (dim.h_line-dim.bottom) + ")")
         .call(xAxis);
      // Show line
      var line = d3.line()
               .x(function(d) { return xScale(d.day); })
               .y(function(d) { return yScale(d.ngames); });
      svg.select("#line420")
         .attr("d", line)
         .style("stroke", color420);
      svg.select("#line1200")
         .attr("d", line);
      // change button color
      d3.select(this).style("background-color", color420)
                     .style("color", "white");
    }
    // Hide line
    else {
      svg.select("#line420") // hide line
         .style("stroke", "none");
      if (show450 == false) { // 450 line is also hidden, change xScale back to just 1200
        xScale = d3.scaleTime()
                   .domain([
                     d3.min(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; }),
                     d3.max(dataset.filter(function(d) { return d.queueid==1200; }), function(d) { return d.day; })
                   ])
                   .range([dim.left, w_line-dim.right]);
        line = d3.line() // redefine line again because xScale changed
                 .x(function(d) { return xScale(d.day); })
                 .y(function(d) { return yScale(d.ngames); });
        svg.select("#line1200")
           .attr("d", line);
      }
      d3.select(this).style("background-color", "white") // change button color back
                     .style("color", "#a19da8");
    }
  }); // end on button420 click

}); // end d3.csv
