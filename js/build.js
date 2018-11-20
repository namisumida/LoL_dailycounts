var svg = d3.select("#svg-barchart");
var w_svg = document.getElementById('svg-barchart').getBoundingClientRect().width; // get width and height based on window size
var max_width = 720;
var n_champion = 141;

// Layout
var margin = { top:5, bottom:10, left:0, right:40 };

// Dimensions for column sections
var dim_col = { w_col:(w_svg-margin.left-margin.right)/3, w_names:105, btwn_colnames:3, btwn_col1:10, btwn_col2:10,
  w_colmin: 60,
  h_col:13, h_btwn:5,
  top:30, left:5 }
var w_bars = dim_col.w_col - dim_col.left - dim_col.w_names - dim_col.btwn_col1 - dim_col.btwn_col2;

// Saving datasets
var orig_dataset; // original dataset
var dataset_threemodes; // dataset with the three game modes
var dataset; // dataset that changes based on filters
var metric;
var sort;

// Defining groups
var breakline, group420, group450, group1200, group420enter, group450enter, group1200enter;

// Colors
var barColor = d3.color("#f6bba8");
var highlightBarColor = d3.rgb(79,39,79);
var light_gray = d3.rgb(200,200,200);
var gray = d3.color("#a19da8");

// Function that create subsets
var getSortedDataset = function(dataset, metric, gameMode, sort) { // input metric and gameMode; output sorted dataset ready to go in elements
  var sub_dataset = dataset.filter(function(d) { return d.queueid == gameMode; })
  if (sort == "count") { // sorting by metric count
    if (metric == "play") { // metric is play rate
      sub_dataset.sort(function(a,b) { return d3.descending(a.ngames, b.ngames); })
    }
    else { // metric is win rate
      sub_dataset.sort(function(a,b) { return d3.descending(a.nwins/a.ngames, b.nwins/b.ngames); })
    }
  }
  else { // sort alphabetically by name
    sub_dataset.sort(function(a,b) { return d3.ascending(a.champion, b.champion); })
  }
  return(sub_dataset);
}

// Function that finds rank of champion to display on click
var findRank = function(dataset, metric, gameMode, championName) {
  if (metric == "play") {
    var sub_dataset = dataset.filter(function(d) { return d.queueid == gameMode; })
                             .sort(function(a,b) { return d3.descending(a.ngames, b.ngames); })
  }
  else {
    var sub_dataset = dataset.filter(function(d) { return d.queueid == gameMode; })
                             .sort(function(a,b) { return d3.descending(a.nwins/a.ngames, b.nwins/b.ngames); })
  }
  // find rank in sub_dataset
  return sub_dataset.findIndex(x => x.champion==championName)+1;
}

var rowConverter = function(d) {
  return {
    champion: d.champion,
    queueid: parseInt(d.queueid),
    ngames: parseInt(d.ngames),
    nwins: parseInt(d.nwins),
    nkills: parseInt(d.nkills),
    ndeaths: parseInt(d.ndeaths),
    nassists: parseInt(d.nassists),
    totalminionskilled: parseInt(d.totalminionskilled),
    neutralminionskilled: parseInt(d.neutralminionskilled),
    avgdamagedealtchampions: parseInt(d.avgdamagedealtchampions),
    role: d.role,
    broad_role: d.broad_role
  };
}

d3.csv('data/champion_stats_by_queue.csv', rowConverter, function(data) {

  // Datasets
  orig_dataset = data;
  dataset_threemodes = data.filter(function(d) {
                          return d.queueid!=470;
                        }); // save data that doesn't include the 470 mode
  dataset = dataset_threemodes; // default dataset - showing all champions

  // Default mode
  metric = "play";
  sort = "count";

  // Scale functions
  var xScale_play = d3.scaleLinear()
                      .domain([d3.min(dataset, function(d) { return d.ngames; }), d3.max(dataset, function(d) { return d.ngames})])
                      .range([1, dim_col.w_col - dim_col.w_names - dim_col.btwn_colnames]);

  // Create column groups
  var col1 = svg.append("g") // make a group element
                .attr("class", "column")
                .attr("id", "col1")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // Second column - ARAM; 1200
  var col2 = svg.append("g") // make a group element
                .attr("class", "column")
                .attr("transform", "translate(" + (margin.left+dim_col.w_col+dim_col.btwn_col1) + "," + margin.top + ")");
  // Third column - Nexus Blitz; 450
  var col3 = svg.append("g") // make a group element
                .attr("class", "column")
                .attr("transform", "translate(" + (margin.left+dim_col.w_col*2+dim_col.btwn_col1+dim_col.btwn_col2) + "," + margin.top + ")");

  // Create labels
  col1.append("text")
      .attr("class", "mode_label")
      .attr("x", dim_col.w_col/2)
      .attr("y", 10)
      .text("Nexus Blitz");
  col2.append("text")
      .attr("class", "mode_label")
      .attr("x", dim_col.w_col/2)
      .attr("y", 10)
      .text("Ranked 5v5");
  col3.append("text")
      .attr("class", "mode_label")
      .attr("x", dim_col.w_col/2)
      .attr("y", 10)
      .text("ARAM");

  // 420 ranked 5v5 column
  group420 = col2.selectAll("group420")
                  .data(getSortedDataset(dataset, metric, 420, sort))
                  .enter()
                  .append("g")
                  .attr("class", "champion_group")
                  .attr("transform", "translate(" + dim_col.left + "," + dim_col.top + ")");
  group420.append("rect") // to allow clickability between name and rect
          .attr("class", "background")
          .attr("x", 0)
          .attr("y", function(d,i) {
            return (dim_col.h_col+dim_col.h_btwn)*i;
          })
          .attr("width", dim_col.w_col)
          .attr("height", dim_col.h_col);
  group420.append("text") // champion names
          .attr("class", "nameLabel")
          .attr("x", dim_col.w_names-dim_col.btwn_colnames)
          .attr("y", function(d,i) {
            return (dim_col.h_col+dim_col.h_btwn)*i + dim_col.h_col/2 +3;
          })
          .text(function(d) {
            return d.champion;
          });
  group420.append("rect") // bars
          .attr("class", "bar")
          .attr("x", dim_col.left+dim_col.w_names)
          .attr("y", function(d,i) {
            return (dim_col.h_col+dim_col.h_btwn)*i;
          })
          .attr("width", function(d) {
            return xScale_play(d.ngames);
          })
          .attr("height", dim_col.h_col)
          .style("fill", barColor);
  group420.append("text")
          .attr("class", "countLabel")
          .attr("x", function(d) {
            if (xScale_play(d.ngames) <= dim_col.w_colmin) {
              return dim_col.left+dim_col.w_names + xScale_play(d.ngames) + 3;
            }
            else { return dim_col.left+dim_col.w_names + xScale_play(d.ngames) - 5;}
          })
          .attr("y", function(d,i) {
            return (dim_col.h_col+dim_col.h_btwn)*i + dim_col.h_col/2 +4;
          })
          .text(function(d) {
            return d3.format(",")(d.ngames);
          })
          .style("text-anchor", function(d) {
            if (xScale_play(d.ngames) <= dim_col.w_colmin) {
              return "start"
            }
            else { return "end"; }
          });

  // 450 ARAM
  group450 = col3.selectAll("group450")
                 .data(getSortedDataset(dataset, metric, 450, sort))
                 .enter()
                 .append("g")
                 .attr("class", "champion_group")
                 .attr("transform", "translate(" + dim_col.left + "," + dim_col.top + ")");
  group450.append("rect") // to allow clickability between name and rect
          .attr("class", "background")
          .attr("x", 0)
          .attr("y", function(d,i) {
            return (dim_col.h_col+dim_col.h_btwn)*i;
          })
          .attr("width", dim_col.w_col)
          .attr("height", dim_col.h_col);
  group450.append("text") // champion names
          .attr("class", "nameLabel")
          .attr("x", dim_col.w_names-dim_col.btwn_colnames)
          .attr("y", function(d,i) {
            return (dim_col.h_col+dim_col.h_btwn)*i + dim_col.h_col/2 +3;
          })
          .text(function(d) {
            return d.champion;
          });
  group450.append("rect") // bars
          .attr("class", "bar")
          .attr("x", dim_col.left+dim_col.w_names)
          .attr("y", function(d,i) {
            return (dim_col.h_col+dim_col.h_btwn)*i
          })
          .attr("width", function(d) {
            return xScale_play(d.ngames)
          })
          .attr("height", dim_col.h_col)
          .style("fill", barColor);
  group450.append("text") // count labels
          .attr("class", "countLabel")
          .attr("x", function(d) {
            if (xScale_play(d.ngames) <= dim_col.w_colmin) {
              return dim_col.left+dim_col.w_names + xScale_play(d.ngames) + 3;
            }
            else { return dim_col.left+dim_col.w_names + xScale_play(d.ngames) - 5;}
          })
          .attr("y", function(d,i) {
            return (dim_col.h_col+dim_col.h_btwn)*i + dim_col.h_col/2 +4;
          })
          .text(function(d) {
            return d3.format(",")(d.ngames);
          })
          .style("text-anchor", function(d) {
            if (xScale_play(d.ngames) <= dim_col.w_colmin) {
              return "start"
            }
            else { return "end"; }
          });

  // 1200 Nexus Blitz
  group1200 = col1.selectAll("group1200")
                   .data(getSortedDataset(dataset, metric, 1200, sort))
                   .enter()
                   .append("g")
                   .attr("class", "champion_group")
                   .attr("transform", "translate(" + dim_col.left + "," + dim_col.top + ")");
  group1200.append("rect") // to allow clickability between name and rect
            .attr("class", "background")
            .attr("x", 0)
            .attr("y", function(d,i) {
              return (dim_col.h_col+dim_col.h_btwn)*i;
            })
            .attr("width", dim_col.w_col)
            .attr("height", dim_col.h_col);
  group1200.append("text") // champion names
          .attr("class", "nameLabel")
          .attr("x", dim_col.w_names-dim_col.btwn_colnames)
          .attr("y", function(d,i) {
            return (dim_col.h_col+dim_col.h_btwn)*i + dim_col.h_col/2 +3;
          })
          .text(function(d) {
            return d.champion;
          });
  group1200.append("rect") // bars
          .attr("class", "bar")
          .attr("x", dim_col.left+dim_col.w_names)
          .attr("y", function(d,i) {
            return (dim_col.h_col+dim_col.h_btwn)*i
          })
          .attr("width", function(d) {
            return xScale_play(d.ngames);
          })
          .attr("height", dim_col.h_col)
          .style("fill", barColor);
  group1200.append("text") // count labels
          .attr("class", "countLabel")
          .attr("x", function(d) {
            if (xScale_play(d.ngames) <= dim_col.w_colmin) {
              return dim_col.left+dim_col.w_names + xScale_play(d.ngames) + 3;
            }
            else { return dim_col.left+dim_col.w_names + xScale_play(d.ngames) - 5;}
          })
          .attr("y", function(d,i) {
            return (dim_col.h_col+dim_col.h_btwn)*i + dim_col.h_col/2 +4;
          })
          .text(function(d) {
            return d3.format(",")(d.ngames);
          })
          .style("text-anchor", function(d) {
            if (xScale_play(d.ngames) <= dim_col.w_colmin) {
              return "start"
            }
            else { return "end"; }
          });

  // Create line breaks
  var breakline_g = svg.append("g").attr("id", "breakline_g");
  breakline = breakline_g.selectAll("breakline")
                          .data(getSortedDataset(dataset, metric, 1200, sort).filter(function(d,i) {
                            return (i+1)%5==0;
                          })) // this can be any mode, but should be based on the metric
                          .enter()
                          .append("line")
                          .attr("class", "breakline")
                          .attr("x1", 0)
                          .attr("x2", w_svg-margin.left-margin.right)
                          .attr("y1", function(d,i) {
                            return margin.top + dim_col.top + (dim_col.h_col+dim_col.h_btwn)*(i+1)*5 - dim_col.h_btwn/2;
                          })
                          .attr("y2", function(d,i) {
                            return margin.top + dim_col.top + (dim_col.h_col+dim_col.h_btwn)*(i+1)*5 - dim_col.h_btwn/2;
                          });

}) // end d3.csv()
