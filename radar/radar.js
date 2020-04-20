//computes name for a web using the highest number in the dataset and its corresponding ROI using the index of the highest number
function titleName(datai, labels){
    dose = Math.max.apply(Math, datai);
    index = datai.indexOf(dose);
    roi = labels[index];
    return dose + " " + roi;
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
    DatasetsInfo.push(
        {
        label: titleName(data[i],labels),
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