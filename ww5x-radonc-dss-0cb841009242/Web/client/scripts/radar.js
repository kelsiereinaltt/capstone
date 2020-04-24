function topX(x){
  tempData = JSON.parse(JSON.stringify(data));
  //tempData = data;
  titles = [];
  indicies = [];
  maxes = [];
  for(i=0; i < x; i++){
    rowMaxes = []; //100, 201, 60
    rowIndicies = []; //0 2 0 - index for the actual number
    for(j=0; j < dalen; j++){
      tempArray = tempData[j];
      maxInSet = Math.max.apply(Math, tempData[j]);
      rowMaxes.push(maxInSet);

      inSetIndex = tempArray.indexOf(maxInSet);
      rowIndicies.push(inSetIndex)
      //document.write(maxInSet + " " + index + "<br>");
    }
    //document.write(rowMaxes + " " + rowIndicies + "<br>");
    max = Math.max.apply(Math, rowMaxes); //201
    
    translatingIndex = rowMaxes.indexOf(max); //1 //index of which dataset
    index = rowIndicies[translatingIndex]; //2
    doseNum = dose[translatingIndex];
    
    roi = labels[index];
    titles.push(doseNum + " gy " + roi);
    maxes.push(max);

    identifySet = tempData[translatingIndex];
    identifySet[index] = max * -1;

  }
  //document.write(titles)
  plottedData = maxes;

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

function web(dalen){  
    number = 1;
    DatasetsInfo.push(
        {
        label: "Plan " + number,
        data: plottedData,
        backgroundColor: dynamicColor(),
        borderWidth: 3
        }
      )
}

//computes name for a web using the highest number in the dataset and its corresponding ROI using the index of the highest number
/*function titleName(datai, labels){
    dose = Math.max.apply(Math, datai);
    index = datai.indexOf(dose);
    roi = labels[index];
    return dose + " haha" + roi;
}*/


/*how to fully copy data array locally (. was getting errors: TempData not defined when did console.log(tempData)  ): https://medium.com/javascript-in-plain-english/how-to-deep-copy-objects-and-arrays-in-javascript-7c911359b089*/
/*function topX(x){
  tempData = JSON.parse(JSON.stringify(data));
  //tempData = data;
  titles = [];
  indicies = []
  for(i=0; i < x; i++){
    rowMaxes = []; //100, 201, 60
    rowIndicies = []; //0 2 0 - index for the actual number
    for(j=0; j < dalen; j++){
      tempArray = tempData[j];
      maxInSet = Math.max.apply(Math, tempData[j]);
      rowMaxes.push(maxInSet);

      inSetIndex = tempArray.indexOf(maxInSet);
      rowIndicies.push(inSetIndex)
      //document.write(maxInSet + " " + index + "<br>");
    }
    //document.write(rowMaxes + " " + rowIndicies + "<br>");
    max = Math.max.apply(Math, rowMaxes); //201
    
    translatingIndex = rowMaxes.indexOf(max); //1 //index of which dataset
    index = rowIndicies[translatingIndex]; //2
    //console.log(titles);
    
    roi = labels[index];
    titles.push(max + " " + roi);

    identifySet = tempData[translatingIndex];
    identifySet[index] = max * -1;

  }
  return titles;
}*/

//for each index in the dataset, the variables for each we are pushed on to an array. This will populate the chart.
/*function web(dalen){  
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
}*/