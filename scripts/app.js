// variables for the plot
var plot1; // interactive plot
var plot2; // ntcp plot
var plot3; // treatment range plot
var plot4;// treatment range plot
var plot5;// treatment range plot for similarpatients for risk structure
var plot6;// treatment range plot for similarpatients for target
var xClick; // x coordinates of a click
var yClick; // y coordinates of a click

// dicom viewer example
var dicomviewer;

// similar string comparison - needed npm install string-similarity)
//global variables
// var lines; // all the original data for all plans for the specific patient
var current = 0; // determine which organ is being adjusted
var patient = 0; // determines which patient data to read in
var choice = 0; // choice of organ from the navigation bar
var colors = ["#ff0000", "#ff6600", "#3399ff", "#009933", "#DAA520", "#9900cc", "#FF00FF", "#A52A2A"]; // colors for all the organs

var riskRangeLines = []; //all plans for all similarpatients for all organs for risk structure
var riskmaxLine = [];//the max at each dose of each organ across similar patients for risk structure
var riskminLine = [];//the min at each dose of each organ across similar patients for risk structure
var tgtRangeLines = []; //all plans for all similarpatients for all organs for target
var tgtmaxLine = [];//the max at each dose of each organ across similar patients for target
var tgtminLine = [];//the min at each dose of each organ across similar patients for target
var rangeLines = []; // all plans for all organs
var maxLine = []; // the max at each dose of each organ
var minLine = []; // the min at each dose of each organ

var organs = [];
var plans = [];

// ------------------------------------------------------------------------------------------------------------
// Create the interactive_dvh - Interactive DVH plot using jqplot
// after reading all files generate the plot given the data points and options to move only in the y direction
// only plots for Chart 1
function plot(all, seriesOptions)
{
    // generate the interactive plot
    plot1 = $.jqplot('intdvh', all,{
    title: 'Dose Volume Histogram',
    seriesColors: colors,
     axes: {
        xaxis:{
          label:'Dose (cGy)',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          min: 0,
          tickOptions: {
              mark: 'inside'
          },
          max: 8400,
          decimal: 0
        },
        yaxis:{
          label:'Relative Volume',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          pad: 1.0,
          tickOptions: {
              mark: 'inside'
          }
        }
     },
    highlighter: {
         sizeAdjust: 10,
         tooltipLocation: 'n',
         tooltipAxes: 'y',
         tooltipFormatString: '<b><i><span style="color:red;">cDVH</span></i></b> %.2f',
         useAxesFormatters: false
     },
     cursor: {
         show: true
     },
    legend: {
        show: true,
        renderer: $.jqplot.EnhancedLegendRenderer,
        location: 'w' ,
        placement : "outside",
        marginRight: '100px',
        rendererOptions: {
            numberColumns: 1
        },
        seriesToggle: true
      },
    series: seriesOptions
  });
}


//-----------------------------------------------------------------------------------------------------------------
// create rangelines to display min/max values for each OAR

function createMinMaxRangeLines(lines){
  // console.log("Entering createMinMaxRangelines function with lines")
  //console.log(lines.length)
  //
  //console.log("\n\n Value 0,0:")
  //console.dir(lines)
  //console.log(lines[0][0].length)

  for(var i=0; i<lines.length; i++)
  {
    rangeLines[i] = [];
  }
  //console.log("length ranglines = ", rangeLines.length)


  // each entry in rangeLines has all the converted data for that organ
  for(var i=0; i<lines[0].length; i++)
  {
    for(var j=0; j<rangeLines.length; j++)
    {
      //console.log(i,j)
      //console.dir(lines[j][i])
      rangeLines[j].push(convert(lines[j][i]));
    }
  }

  // initialize maxLine and minLine to initial low and high values
  // previously was error with max and min changing simultaneously
  for(var i=0; i<lines.length; i++)
  {
    maxLine[i] = [];
    minLine[i] = [];
    for(var k=0; k<lines[0][0].length; k++)
    {
      maxLine[i].push([rangeLines[i][0][k][0], -1]);
      minLine[i].push([rangeLines[i][0][k][0], 2]);
    }
  }

  // loop through all data files and determine max and min values out of all data files for each organ
  for(var i=0; i<lines.length; i++)
  {
    for(var j=0; j<lines[0].length; j++)
    {
      for(var k=0; k<lines[0][0].length; k++)
      {
        if(parseFloat(rangeLines[i][j][k][1]) > parseFloat(maxLine[i][k][1]))
        {
          maxLine[i][k][0] = rangeLines[i][j][k][0];
          maxLine[i][k][1] = rangeLines[i][j][k][1];
        }
        if(parseFloat(rangeLines[i][j][k][1]) < parseFloat(minLine[i][k][1]))
        {
          minLine[i][k][0] = rangeLines[i][j][k][0];
          minLine[i][k][1] = rangeLines[i][j][k][1];
        }
      }
    }
  }

}

// load DVH data based on selected index, current patient, organ list
function loadGraph (index, patient, organs, lines){
  // convert to cumulative
  // console.log(organs[choice])
  var converted = [];
  for(var i=0; i<lines.length; i++)
  {
    converted.push(convert(lines[i][index]));
  }

  // generate an array to pass in series options for all data sets
  var series = [];
  for(var i=0; i<converted.length; i++)
  {
    series.push({
      dragable: {
          color: '#ff3366',
          constrainTo: 'y'
      },
      markerOptions: {
        show: false,
        size: 2
     },
     label: organs[i]
    });
  }
  /////////////
  //BAR CHART//
  /////////////
  var bars = [];
  var barcolors = [];
  var k = 0;
  console.log(organs.length)
  for(var i=0; i<organs.length ; i++)
  {
    var testStr = organs[i];
    if(testStr.includes('otal')){ // 'Heart', 'Left Lung', 'Right Lung', 'Esophagus', 'PTV'
      bars.push([organs[i], returnPRP(converted[i])]);
      barcolors[k] = colors[i];
      k = k+1;};
      //colors[i] = "#00FFFF";
    //if(organs[i] === 'Right Lung') // 'Heart', 'Left Lung', 'Right Lung', 'Esophagus', 'PTV'
    //  bars.push([organs[i], returnPRS(converted[i])]);
    if(testStr.includes('soph')){ // 'Heart', 'Left Lung', 'Right Lung', 'Esophagus', 'PTV'
      bars.push([organs[i], returnPRE(converted[i])]);
      barcolors[k] = colors[i];
      k = k+1;};
      //colors[i] = "#7FFF00";
    if(testStr.includes('eart')){ // 'Heart', 'Left Lung', 'Right Lung', 'Esophagus', 'PTV'
      bars.push([organs[i], returnPRH(converted[i])]);
      barcolors[k] = colors[i];
      k = k+1;};
      //colors[i] = "#FF0000";
    if(testStr.includes('ord')) { // 'Heart', 'Left Lung', 'Right Lung', 'Esophagus', 'PTV'
      bars.push([organs[i], returnPRS(converted[i])]);
      barcolors[k] = colors[i];
      k = k+1;};
      //colors[i] = "#FFA500";
    if(testStr.includes('ana')) { // 'Heart', 'Left Lung', 'Right Lung', 'Esophagus', 'PTV'
      bars.push([organs[i], returnPRS(converted[i])]);
      barcolors[k] = colors[i];
      k = k+1;};
      //colors[i] = "#FFA500";
  }
  console.log(barcolors)
  console.log(k)
  plot2 = $.jqplot('ntcpbar', [bars], {
      seriesColors: colors,
      seriesDefaults: {
          renderer:$.jqplot.BarRenderer,
          pointLabels: { show: true },
          rendererOptions: {
                varyBarColor: true
            }
      },
      axes: {
          xaxis: {
              renderer: $.jqplot.CategoryAxisRenderer,
              decimal:0,
          },
          yaxis:{
            label:'NTCP (%)',
            labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          }
      }
  });

  /////////////////////////
  //TREATMENT RANGE CHART//
  /////////////////////////
  var range = [maxLine[choice], minLine[choice], converted[choice]];

  // add another one to the series for the new line
  series.push({
      dragable: {
          color: '#ff3366',
          constrainTo: 'y'
      },
      markerOptions: {
        show: false,
        size: 2
     },
     label: 'Not seen'
    });

  // generate the jqplot
  // fills the area in between the max and min
  // also draws the currently selected line on top
  plot3 = $.jqplot('dvhrange', range, {
    title: 'Treatment Range of '+organs[choice],
    seriesColors: [colors[choice], colors[choice], '#000000'],
    axesDefaults: {
      pad: 1.05
    },
    fillBetween: {
      series1: 0,
      series2: 1,
      color: colors[choice],
      baseSeries: 0,
      fill: true
    },
    axes: {
        xaxis:{
          label:'Dose (cGy)',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          min: 0,
          tickOptions: {
              mark: 'inside'
          },
          max: 8400
        },
        yaxis:{
          label:'Relative Volume',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          pad: 1.0,
          tickOptions: {
              mark: 'inside'
          }
        }
     },
    seriesDefaults: {
      rendererOptions: {
        smooth: true
      }
    },
    series: series
  });

  /////////////////////////
  //TRADEOFF RANGE CHART//
  /////////////////////////
  var tradeoff_range = [maxLine[choice], minLine[choice], maxLine[choice+1], minLine[choice+1]];
  // add another one to the series for the new line
  series.push({
      dragable: {
          //color: colors[choice] //'#ff3366',
          constrainTo: 'y'
      },
      markerOptions: {
        show: false,
        size: 2
     },
     label: 'Not seen'
    });

  // generate the jqplot
  // also draws the currently selected line on top
  plot4 = $.jqplot('dvhtradeoff', tradeoff_range, {
        title: 'Tradeoff of '+organs[choice]+' and '+organs[choice+1],
    seriesColors: [colors[choice], colors[choice], colors[choice+1], colors[choice+1]], // '#000000', '#000000'],
    axesDefaults: {
      pad: 1.05
    },
    fillBetween: {
      series1: 0,
      series2: 1,
      color: colors[choice],
      baseSeries: 0,
      fill: false
    },
    axes: {
        xaxis:{
          label:'Dose (cGy)',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          min: 0,
          tickOptions: {
              mark: 'inside'
          },
          max: 8400
        },
        yaxis:{
          label:'Relative Volume',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          pad: 1.0,
          tickOptions: {
              mark: 'inside'
          }
        }
     },
    seriesDefaults: {
      rendererOptions: {
        smooth: true
      }
    },
    series: series
  });



  // switch the Plugins on and off based on the chart being plotted
  $.jqplot.config.enablePlugins = true;
  // plot the data for the line chart
  plot(converted, series);
  // replot the data so graphs don't stack
  plot1.replot();
  $.jqplot.config.enablePlugins = false;
  plot2.replot();
  plot3.replot();
  plot4.replot();
}
function loadGraph2(riskmaxlines,riskminlines,tgtmaxlines,tgtminlines,lines,index){
    var converted = [];
    for(var i=0; i<lines.length; i++)
    {
      converted.push(convert(lines[i][index]));
    }
 var range2 = [riskmaxlines[choice], riskminlines[choice], converted[choice]];
 var series = [];
 $.jqplot.config.enablePlugins = true;
 for(var i=0; i<converted.length; i++)
 {
   series.push({
     dragable: {
         color: '#ff3366',
         constrainTo: 'y'
     },
     markerOptions: {
       show: false,
       size: 2
    },
    label: organs[i]
   });
 }

  // add another one to the series for the new line
  series.push({
      dragable: {
          color: '#ff3366',
          constrainTo: 'y'
      },
      markerOptions: {
        show: false,
        size: 2
     },
     label: 'Not seen'
   });

  // generate the jqplot
  // fills the area in between the max and min
  // also draws the currently selected line on top
  plot5 = $.jqplot('priordvh1', range2, {
    title: 'Treatment Range of '+organs[choice]+' Past Patients Risk Structure',
    seriesColors: [colors[choice], colors[choice], '#000000'],
    axesDefaults: {
      pad: 1.05
    },
    fillBetween: {
      series1: 0,
      series2: 1,
      color: colors[choice],
      baseSeries: 0,
      fill: true
    },
    axes: {
        xaxis:{
          label:'Dose (cGy)',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          min: 0,
          tickOptions: {
              mark: 'inside'
          },
          max: 8400
        },
        yaxis:{
          label:'Relative Volume',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          pad: 1.0,
          tickOptions: {
              mark: 'inside'
          }
        }
     },
    seriesDefaults: {
      rendererOptions: {
        smooth: true
      }
    },
    series: series
  });
  var range3 = [tgtmaxlines[choice], tgtminlines[choice], converted[choice]];

  // add another one to the series for the new line
  series.push({
      dragable: {
          color: '#ff3366',
          constrainTo: 'y'
      },
      markerOptions: {
        show: false,
        size: 2
     },
     label: 'Not seen'
   });

  // generate the jqplot
  // fills the area in between the max and min
  // also draws the currently selected line on top
  plot6 = $.jqplot('priordvh2', range3, {
    title: 'Treatment Range of '+organs[choice]+' Past Patients Target',
    seriesColors: [colors[choice], colors[choice], '#000000'],
    axesDefaults: {
      pad: 1.05
    },
    fillBetween: {
      series1: 0,
      series2: 1,
      color: colors[choice],
      baseSeries: 0,
      fill: true
    },
    axes: {
        xaxis:{
          label:'Dose (cGy)',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          min: 0,
          tickOptions: {
              mark: 'inside'
          },
          max: 8400
        },
        yaxis:{
          label:'Relative Volume',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          pad: 1.0,
          tickOptions: {
              mark: 'inside'
          }
        }
     },
    seriesDefaults: {
      rendererOptions: {
        smooth: true
      }
    },
    series: series
  });
  plot5.replot()
  plot6.replot()
}
//--------------------------------------------------------------------------------------------------------
// Utility Methods

//**********
// convert the data from dvh volume to cdvh volume
// uses method from Dr. Watkin's python program
function convert(data)
{
  //console.log("Entering Conversion to Cumulative DVH w/ data")
  //console.dir(data)
  var dose = [];
  var volume = [];
  var total_volume = 0;
  for(var i=0; i<data.length; i++)
  {
    dose.push(data[i][0]);
    volume.push(data[i][1]);
    total_volume += data[i][1];
  }

  totalData = [];
  for(var i=data.length-1; i>-1; i--)
  {
    var sum = volume.slice(0,i).reduce(function(a, b) { return a + b; }, 0);
    totalData[i] = [dose[i], 1 - sum/total_volume];
  }

  return totalData;
}


function getPearsonCorrelation(x, y) {
    var shortestArrayLength = 0;
     
    if(x.length == y.length) {
        shortestArrayLength = x.length;
    } else if(x.length > y.length) {
        shortestArrayLength = y.length;
        console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
    } else {
        shortestArrayLength = x.length;
        console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
    }
  
    var xy = [];
    var x2 = [];
    var y2 = [];
  
    for(var i=0; i<shortestArrayLength; i++) {
        xy.push(x[i] * y[i]);
        x2.push(x[i] * x[i]);
        y2.push(y[i] * y[i]);
    }
  
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_x2 = 0;
    var sum_y2 = 0;
  
    for(var i=0; i< shortestArrayLength; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += xy[i];
        sum_x2 += x2[i];
        sum_y2 += y2[i];
    }
  
    var step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
    var step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
    var step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
    var step4 = Math.sqrt(step2 * step3);
    var answer = step1 / step4;
  
    return answer;
}

function compute_correlations(organ_index, plan_index, selected_point, cdvh_array)
{
    // selected data is the current selected point on the dvh graph
    // cdvh array is cdvh_array[organ_index][plan_index][pixelposition]
    // Kelsie and Dana - here is where we would put the correlation calculation
    // same code as in python, loop over cdvh_array and compute correlation with current selected data

    selected_organ = organs[organ_index]
    console.log("Selected organ = ", selected_organ)
    selected_plan = plans[plan_index]
    console.log('Selected plan = ', selected_plan)
    selected_data = cdvh_array[organ_index][plan_index][selected_point]
    console.log("Selected data = ", selected_data) 
    selected_array = [];
    temp_array = [];
    for(var iplan=0; iplan < number_plans ; iplan++) {
        selected_array[iplan] = [];
        temp_array[iplan] = [];
    }
    for(var iplan=0; iplan < number_plans ; iplan++) {
        selected_array[iplan].push(cdvh_array[organ_index][iplan][selected_point][1])
        
    }
    console.log(selected_array)
    max_correlations = [0,0,0,0];
    axis_lengths = [0,0,0,0];
    label_coordinates = [[],[],[],[]]; //track the coordinates of the organ name and dose for each axis    
    for(var ioar=0; ioar < number_organs; ioar++) { //for each organ 
        for(var j=0; j < cdvh_array[ioar][iplan].length; j++){ // for each dose level
          for(var iplan=0; iplan < number_plans ; iplan++) { //construct for each plan
            temp_array[iplan].push(cdvh_array[organ_index][iplan][j][1])
          } 

          corr = getPearsonCorrelation(temp_array, selected_array);
          
          // check if correlation is greater than the smallest value in max_correlations
          current_min = math.min(max_correlations);
          if(corr > current_min){
            var new_index = current_min.indexOf(current_min);
            max_correlations[new_index].push(corr);
            var abs_change = math.max(temp_array) - math.min(temp_array); 
            axis_lengths[new_index].push(abs_change);
            label_coordinates[new_index].push(ioar,j);
          }
          console.log("corr:" + corr);
          console.log(temp_array)
          //findJS function to computer correlation
          //if one of the top 4
          //make axes max - min         
           
           //compute correlation for "selected organ, and dose value" vs all other'
           
           //push the data point to a new array

        }
    }
                                  
}


function returnPRP(data)
{
  var con = -2.98;
  var c_d = 0.0356;
  var c_v = 4.13;
  var c_v2 = -5.18;
  var c_d2 = -0.000727;
  var c_dv = 0.221;
  var PRPSum = 0;
  var PRP = [];

  var mean_dose = 0;
  var total_volume = 0;

  for(var i=data.length-1; i>-1; i--)
  {
      var dose = data[i][0] ;
      var volume = data[i][1] ;
      var expFactor = con + c_d * dose + c_v * volume + c_d2 * Math.pow(dose, 2) + c_v2 * Math.pow(volume, 2) + c_dv * dose*volume;
      PRP[i] = 1 / (1 + Math.log(-1.0*expFactor));
      if(!isNaN(PRP[i]))
        PRPSum += PRP[i];
        mean_dose += dose*volume;
        total_volume += volume;
  }

  var PRP_Value = PRPSum / (1.15 * data.length);
  mean_dose = mean_dose / total_volume;
  //console.log(mean_dose)
  //PRP_Value = mean_dose;
  return PRP_Value * 100;
}

// return the probability or radiation esophagitis in percent
function returnPRE(data)
{
  var con = -2.98;
  var c_d = 0.0356;
  var c_v = 4.13;
  var c_v2 = -5.18;
  var c_d2 = -0.000727;
  var c_dv = 0.221;
  var PRPSum = 0;
  var PRP = [];
  for(var i=data.length-1; i>-1; i--)
  {
      var dose = data[i][0];
      var volume = data[i][1]+1;
      var expFactor = con + c_d * dose + c_v * volume + c_d2 * Math.pow(dose, 2) + c_v2 * Math.pow(volume, 2) + c_dv * dose*volume;
      PRP[i] = 1 / (1 + Math.log(-1.0*expFactor));
      if(!isNaN(PRP[i]))
        PRPSum += PRP[i];
        PRPSum +=  Math.pow(volume,4) ;
  }

  var PRP_Value = Math.pow(PRPSum,1.0) / 8 / (data.length) - 0.2;

  return PRP_Value * 100;
}

// probability of cardiac injury
function returnPRH(data)
{
  // Darby model, 7.5% increase per Gy
  var baseline_rate = 0.03;
  var mean_dose = 0;
  var total_volume = 0;
  for(var i=data.length-1; i>-1; i--)
  {
      var dose = data[i][0];
      var volume = data[i][1];
      var test_val = dose*volume;
      if(!isNaN(test_val))
        total_volume += volume;
        mean_dose += dose*volume;
  }
  mean_dose = mean_dose / total_volume / 100; // dose in Gy
  //console.log(mean_dose)
  var PRH_Value = baseline_rate + mean_dose * baseline_rate * 0.08 ;
  //PRP_Value = mean_dose;
  return PRH_Value * 100;
}

//probability of spinal cord injury
function returnPRS(data)
{
  // quantec model
  var max_dose = 0;
  var min_volume = 0.001;
  var flag_for_max = 0;
  var i = 0;
  while(max_dose == 0)
  {
      var dose = data[i][0];
      var volume = data[i][1];
      if(volume <= min_volume){
        max_dose = dose/100;
        //console.log(volume)
        //console.log(max_dose)
      }
      i = i+1;
  }

  // modeled as linear between 45-60 Gy
  if(max_dose <= 45)
    var PRS_Value = 0
  else {
    var PRS_Value = 0.1 / 15 * max_dose - 0.29;
  }
  return PRS_Value * 100;
}


// ---------------------------------------------------------------------------------------------------------------
// Starting function
function displayInfo(pn){
  $(document).ready(function () {
    //$('#test').load('/scripts/patient_info.txt');
    $.get('../patient_data/qcMCO/Patient_'+pn+'/info.txt',function(testing) {
      var patientcat = testing.split('Description')[0].split(';')[0];
      var patientname = testing.split('Description')[1].split(';')[0];
      var mrncat = testing.split('Description')[0].split(';')[1];
      var mrn = testing.split('Description')[1].split(';')[1];
      var bdcat = testing.split('Description')[0].split(';')[2];
      var bd = testing.split('Description')[1].split(';')[2];
      var dob = bd.split(' ')[1];
      var d = new Date();
      var age = d.getFullYear() - parseInt(dob.split('-')[0]);
      if(parseInt(dob.split('-')[1]) >= d.getMonth()+1){
        if(parseInt(dob.split('-')[1]) != d.getMonth()+1){
          age = age-1;
        }
        else{
          if(parseInt(dob.split('-')[2]) > d.getDate()){
            age = age-1;
          }
        }
      }
      var descat = (testing.split('total days;')[1].split('\n')[0]).slice(0,12);
      var des = testing.split('Description')[1].split(';')[13];
      //$('#patientinfo').remove();
      $('#patientinfo').html('<p style="color:#75acff; font-size: 15px; border: 1px solid #ddd; padding: 5px 8px 5px 8px;">'+patientcat+': '+patientname+
      +'      '+mrncat+':'+mrn+ '      '+bdcat+': ' + dob + '     Age: ' + age + '<br>' + descat+': ' + des );


    });
  });
}

//Re-write document.ready function
//All logic is located here including ajax communication between front-end and back-end
//Contain two ajax function - one is for generating patient lists
//Aother one is for generating ddvh lines and dynamic organ lists

$(document).ready(function () {

var buttonClick = true;
var infodisplayed = 0;

  //patient_button click logic : generate dynamic patient lists
  $("#patient_button").click(function changePatient(){
      if(buttonClick){
        buttonClick = false;
        //begin to generate dynamic patient lists
        $.ajax({
            url: "http://127.0.0.1:8080/patient_list",
            type: "GET",
            dataType: "jsonp",
            success: function(data){
                    //console.log(buttonClick);
                    var dropdown = document.getElementById("myDropdown");
                    //$("myDropdown").attr('disabled', false)
                    //loop for generating buttons for each patient
                    for(var index_1 = 0; index_1 < data.length; index_1++){
                        var button1 = document.createElement("button1");
                        var a_1 = document.createElement("a");
                        var text = document.createTextNode(data[index_1]);
                        a_1.id = "username2";
                        a_1.className = "username";
                        a_1.href = "#pa";
                        a_1.appendChild(text);
                        button1.value = index_1;
                        button1.appendChild(a_1);

                        //---------------------Patient Button Onclick Function Begins----------------------------------
                        button1.onclick = function()
                        {
                          document.getElementById("myDropdown").classList.toggle("show")
                          //button1 click logical
                          //1. get ddvh data from backend
                          //2. get dynamic organ lists from backend

                          //get selected patient information
                          var patient = $(this).attr("value");
                          var patient_number = data[patient]; // "Patient_" + patient;
                          
                          //this ajax extract two data: 1 - dynamic organ list 2 - ddvh data to lines for this patient
                          $.ajax({
                            url: "http://127.0.0.1:8080/data",
                            type: "POST",
                            dataType: "jsonp",
                            data:{'value':patient_number},
                            success: function(data){
                              organs = data.OrganList;
                              //console.log("Entering Data constructor and updating")
                              console.log("organs:", organs)
                              $('#myDropdown option').remove();
                              var organs_check = data.OrganList;
                              //parse data into lines and organ lists
                              var templines = data.DDVHarray;
                              plans = data.PlanList;
                              console.log("Data constructor")
                              console.log("plans:", plans)
                              // data comes across as lines[iorgan][iplan][dose][abs volume]
                              // this code wants this
                              number_organs = templines.length
                              number_plans = templines[0].length
                              console.log("From Data: number_organs, number_plans =", number_organs, number_plans)
                              var lines = [];
                              var cdvh_array = [];
                              for(var i=0; i<number_organs; i++) {
                                lines[i] = [];
                                cdvh_array[i]=[];
                              }
                              for(var ioar=0; ioar < number_organs; ioar++) {
                                for(var iplan=0; iplan < number_plans ; iplan++) {
                                  lines[ioar].push(templines[ioar][iplan]);
                                  for(var i=0; i<lines[ioar].length; i++)
                                    {
                                      cdvh_array[ioar].push(convert(lines[ioar][i]));
                                    }

                                }
                              }
                              
              
                              var plan_organ_list = document.getElementById("plan_organ_list");
                              plan_organ_list.innerHTML = "";
                              var br = document.createElement("br");
                              plan_organ_list.appendChild(br);

                              //loop for generating buttons for each organs
                              for(var index_2 = 0; index_2 < organs.length; index_2++){
                                //create li
                                if(organs_check.includes(organs[index_2])){
                                var li = document.createElement("li");
                                li.className = "init-un-active";
                                li.id = index_2 + 1;
                                //create a tag
                                var a_2 = document.createElement("a");
                                a_2.href = "javascript:void(0)";

                                //connect a tag with corresponding onclick functions
                                a_2.onclick = function(){
                                  var gw_nav1 = $('#plan_organ_list');
                                    gw_nav1.find('li').removeClass('active');
                                    var checkElement = $(this).parent();
                                    var id = checkElement.attr('id');
                                    choice = id - 1
                                    loadGraph(0,patient,organs,lines)
                                
                                };
                                //create span
                                var span = document.createElement("span");
                                span.className = "gw-menu-text";
                                var text = document.createTextNode(organs[index_2]);
                                span.appendChild(text);
                                a_2.appendChild(span);
                                li.appendChild(a_2);
                                plan_organ_list.appendChild(li);
                              }
                              }

                              //get ddvh data for selected patient
                              //show the graph using lines
                              //$("#patientinfo").remove();
                              displayInfo(patient);
                              if(infodisplayed == 0){ //stops from displaying patient info multiple times
                                var infodisplayed = 1;
                                displayInfo(patient);
                              }

                              var treatment = $("#treatment").val();

                              createMinMaxRangeLines(lines);
                              plan_index = 0
                              loadGraph(plan_index,patient,organs, lines);

  


                              //displayInfo();
                              //begin to implement drag effect
                              //--------------------------Drag Begins-------------------------------------------------------------------------------------
                              // Highlight and Click Methods

                              // beginning of the drag
                              $('#intdvh').bind('jqplotDragStart',
                              function (seriesIndex, pointIndex, pixelposition, data) {
                                  /* none of these have the actual data point
                                  console.log('entering drag start with')
                                  console.log('seriesIndex = ', seriesIndex)
                                  console.log('pointIndex = ', pointIndex)
                                  console.log('pixelposition = ', pixelposition)
                                  console.log(data)
                                  console.log('-------------------------')
                                  current = pointIndex; // determine which organ is being adjusted
                                  xClick = data.x;
                                  yClick = data.y;
                                  */
                                  
                                  $("#curr").remove();
                                   //compute_correlations(organ_index, plan_index, selected_point, cdvh_array)
                                  compute_correlations(pointIndex, plan_index, pixelposition, cdvh_array)
                                  //current = pointIndex;
                                  //selected_organ = organs[current]
                                  //console.log("Selected organ = ", selected_organ)

                                  //var converted = [];
                                  // construct the cumulative DVH for the current selected structure
                                  // i = plans
                                  // j = dose points
                                  //for(var i=0; i<lines[current].length; i++)
                                  //  {
                                  //    converted[i] = convert(lines[current][i]);
                                  //  }
                                  //selected_data = converted[current][pixelposition]  
                                  //console.log("Selected data = ", selected_data) 
                                  //selected_data = cdvh_array[current][plan_index][pixelposition]
                                  //console.log("selected_data = ", selected_data)
                                  
                                  // converted[current][pixelposition])
                                  //console.log(converted[pointIndex][seriesIndex][0])
                                  
                                  //for(var i=0; i<converted.length; i++)
                                  //  {
                                  //      for(var j=0; j<converted[i].length; j++) {
                                  //      console.log('(i,j) = ', i, ',', j, ' dose,dvh = ' , converted[i][j][0], ',', converted[i][j][1])
                                        
                                  //      }
                                  //  }
                                  
                                  //console.log(converted[seriesIndex][pointIndex])
                                  
                                  // these are not defined
                                  //console.log(pixelposition.xaxis)
                                  //console.log(pixelposition.yaxis)
                              });

                              // adjust the graph according to the end of the drag
                              $('#intdvh').bind('jqplotDragStop',
                              function (seriesIndex, pointIndex, pixelposition, data) {
                                // convert to cumulative
                                var converted = [];
                                for(var i=0; i<lines[current].length; i++)
                                {
                                  converted[i] = convert(lines[current][i]);
                                }

                                var xDist = []; // the x distance between each plan for the organ and the clicked point
                                for(var i=0; i<lines[current].length; i++)
                                  xDist.push(10000); //initialize the array
                                var xPt = []; // which index the closest x point is
                                for(var i=0; i<lines[current].length; i++)
                                  xPt.push(-1); //initialize the array

                                // gets closest x pt to dragged x pt for each graph
                                for(var i=0; i<converted.length; i++)
                                {
                                  var dist;
                                  for(var j=0; j<converted[i].length; j++)
                                  {
                                    dist = Math.abs(converted[i][j][0] - pixelposition.xaxis);
                                    if(dist < xDist[i])
                                    {
                                      xDist[i] = dist;
                                      xPt[i] = j;
                                    }
                                  }
                                }
                                var minDist = []; // the minimum y distance from each plan
                                for(var i=0; i<lines[current].length; i++)
                                  minDist.push(10000); //initialize the array

                                // gets the y dist for each at that x pt
                                for(var i=0; i<xPt.length; i++)
                                {
                                  minDist[i] = Math.abs(converted[i][xPt[i]][1] - pixelposition.yaxis);
                                }

                                var index = minDist.indexOf(Math.min.apply(Math, minDist)); // chooses the plan with the minimum y distance
                                //alert(xPt.length);

                                loadGraph(index, patient, organs, lines);//add another load function to load images the logic can be first remove an image element and then add new image element
                              });

                            },
                            error: function(err){
                              alert(err)
                            }
                          });
                          //-------------------------Drag Ends-----------------------------------------------------------------------------------

                        //---------------------Patient Button Onclick Function Begins----------------------------------

                        };
                        dropdown.appendChild(button1);
                    }
                    dropdown.classList.toggle("show");
            },
            error: function(error) {
                alert(error)
            }
        });
    }else{
      document.getElementById("myDropdown").classList.toggle("show");
    }
    });

}); // the click methods and navigation bar are wrapped in the document.ready function
