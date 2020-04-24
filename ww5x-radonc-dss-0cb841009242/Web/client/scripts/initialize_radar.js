import {Chart} from './scripts/Chart.min.js' 

console.log("initializing radar chart")
var ctx = document.getElementById("myChart");

//variables that will be dynamic later - need to be in this format/data structure for code to work as is.
dose = [5.0, 10.0, 15.0, 20.0];
axis_labels = ["Cord", "Esophagus", "External", "Heart"];
//data = [[100, 19, 34, 100],[200, 140, 201, 100], [60,30,4,5]];
data = [[0.987429, 0.977210, 0.986444, 0, 0.938905, 0, 0.980805, 0.984186], [0.978574, 0.980654, 0.954063, 0, 0.944817, 0, 0.950039, 0.956075], [0.976692, 0.993900, 0.921704, 0, 0.953927, 0, 0.881296, 0.899165],[0.962152, 1.000000, 0.863276, 0, 0.962527, 0, 0.774538, 0.815311]];

// plottedData = [];
// DatasetsInfo = []; //this is populated by the web function
// dalen = data.length;
// axesLables = topX(4);
// plotLen = plottedData.length;
//document.write(plottedData);

var RadarChartConfig = {
    type: 'radar',
    data: [{
	    labels: axis_labels,
	    data: dose        
    }]
};	

var myChart = new Chart(ctx, RadarChartConfig);