//computes name for a web using the highest number in the dataset and its corresponding ROI using the index of the highest number
/*function titleName(datai, labels){
    dose = Math.max.apply(Math, datai);
    index = datai.indexOf(dose);
    roi = labels[index];
    return dose + " haha" + roi;
}*/

function topX(x){
/*how to fully copy data array locally (. was getting errors: TempData not defined when did console.log(tempData)  ): https://medium.com/javascript-in-plain-english/how-to-deep-copy-objects-and-arrays-in-javascript-7c911359b089*/
  tempData = JSON.parse(JSON.stringify(data));
  //tempData = data;
  titles = [];
  indicies = []
  for(i=0; i < x; i++){
    rowMaxes = [];
    rowIndicies = [];
    for(j=0; j < dalen; j++){
      tempArray = tempData[j];
      maxInSet = Math.max.apply(Math, tempData[j]);
      rowMaxes.push(maxInSet);

      inSetIndex = tempArray.indexOf(maxInSet);
      rowIndicies.push(inSetIndex)
      //document.write(maxInSet + " " + index + "<br>");
    }
    //document.write(rowMaxes + " " + rowIndicies + "<br>");
    max = Math.max.apply(Math, rowMaxes);
    
    translatingIndex = rowMaxes.indexOf(max);
    index = rowIndicies[translatingIndex];
    //console.log(titles);
    
    roi = labels[index];
    titles.push(max + " " + roi);

    identifySet = tempData[translatingIndex];
    identifySet[index] = max * -1;

  }
  return titles;
}

//generates a random color (used to color each web)
function dynamicColor(){
  r = Math.floor(Math.random() * 255);
  g = Math.floor(Math.random() * 255);
  b = Math.floor(Math.random() * 255);
  color = "rgba(" + r + ", " + g + ", "+ b + ", 0.4)";
  return color;
}

//for each index in the dataset, the variables for each we are pushed on to an array. This will populate the chart.
function web(dalen){  
  for(i=0; i < dalen; i++){
    number = i + 1;
    DatasetsInfo.push(
        {
        label: "Plan " + number,
        data: data[i],
        backgroundColor: dynamicColor(),
        borderWidth: 3
        }
      )
  }
}


//new task: export PYTHON data as JSON file. Have function pull from that.

//export Pandas DataFrame to JSON File in Python:
//https://www.youtube.com/watch?v=Qs7Ozc5sq6s