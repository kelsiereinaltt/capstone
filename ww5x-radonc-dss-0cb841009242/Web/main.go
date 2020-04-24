/**********Radiation Oncology****************/
// Date: Dec 2018
// Author: Jeff
// Authorized by Prof.Watkins
/**********Radiation Oncology****************/

package main

import (
	//"database/sql"
	"encoding/json"
	"fmt"
    "io/ioutil"
	"log"
	"net/http"
	"strconv"
	"strings"
    //"./onco_connector"
	//_ "github.com/denisenkom/go-mssqldb"
)


type Data struct {
	OrganList []string
	PlanList []string
	DDVHarray [][][][]float64
}
/*dosepoint struct is used by OVHDVH function*/
type dosepoint struct{
	x,y float64
}

const MaxFloat64 = 1.797693134862315708145274237317043567981e+308

var filterMap = make(map[string]string)

func main() {
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./client"))))

	//patient_list is for generating dynamic patient lists and send to front-end
	http.HandleFunc("/patient_list", generatePatientListHandler)

	//data is after selecting button, sending OrganList, PlanList, and ddvh lines for front-end
	http.HandleFunc("/data", generateLinesOrgansHandler)

	http.ListenAndServe(":8080", nil)
}

/*----------------------------------------------Dynamic patient list------------------------------------------*/
//this handler can generate dynamic patient lists according to the patient folder
func generatePatientListHandler(w http.ResponseWriter, r *http.Request) {
	//get callback parameter for ajax communication
	callback := r.FormValue("callback")

	//traverse into the patient data folder to generate dynamic patient lists
	filenames := []string{}
	files, err := ioutil.ReadDir("./client/patient_data/qcMCO/")
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {
		if strings.HasPrefix(file.Name(), "Patient") {
			filenames = append(filenames, file.Name())
		}
	}

	//encode to json format for ajax communication
	jsonFileNames, _ := json.Marshal(filenames)

	fmt.Fprintln(w, callback+"("+string(jsonFileNames)+")")
}

/*----------------------------------------------Dynamic patient list------------------------------------------*/

/*--------------------transfer dynamic organs and ddvh lines data to front-end--------------------------------*/
//using ajax to communicate with front-end
//this handler can generate ddvh lines and dynamic organs for selected patient
//rely on two functions - generateLines and generateOrganLists
func generateLinesOrgansHandler(w http.ResponseWriter, r *http.Request) {
	//get callback parameter for ajax communication
	callback := r.FormValue("callback")

	//get patient information from ajax communication
	patient := r.FormValue("value")

	// plans
	plans := generatePlanList(patient)
	//fmt.Printf("%v", plans)
	//2 - generate dynamic organ list
	organs := generateOrgansList(patient)
	//fmt.Printf("%v", organs)
	// - generate lines
	lines := generateLines(patient,plans,organs)
	//fmt.Printf("%v",lines)
	// Makes a call to "Generate Lines Past" which returns the DVH data for both the risk structure and target "PTV" for previous patients who have a similar OVH to the patient in question
	//rsklines,tgtlines := onco_connector.GenerateLinesPast(patient, organs[1])

	//combine 1 and 2 into a struct
	//res := Data{OrganList: organ, DDVHarray: lines, RiskMaxLines: max_lines_risk, RiskMinLines: min_lines_risk,TargetMaxLines: max_lines_tgt, TargetMinLines: min_lines_tgt}
	res := Data{OrganList: organs, PlanList: plans, DDVHarray: lines}

	resJson, _ := json.Marshal(res)

	fmt.Fprintln(w, callback+"("+string(resJson)+")")
}

/*--------------------transfer dynamic organs and ddvh lines data to front-end--------------------------------*/

/*--------------------------------------------Read DDVH data file----------------------------------------------*/
//function to read ddvh file for a selected patient
//func generateLines(patient string, plans []string, organs []string) [len(organs)][][][]float64 {
func generateLines(patient string, plans []string, organs []string) [][][][]float64 {

	path := "./client/patient_data/qcMCO/" + patient + "/"
	ftype := ".ddvh"
 
	lines := make([][][][]float64,len(organs))
	// get the first dvh file to verify number of elements
	//fmt.Println(plans[0],organs[0])

	//fmt.Printf('Reading organ, plan = %v', organ0)
	num_elem := int(200)
	filename := path + plans[0] + "." + organs[0] + ftype
	//fmt.Println(filename)
	content, err := ioutil.ReadFile(filename)
	if err != nil {
		fmt.Println(err)
		fmt.Printf("\n\nERROR !!! COULDNT FIND %s",filename)
	
	} else {
		str := strings.Split(string(content), "\n")
		num, _ := strconv.Atoi(str[0])
		//num, _ := strconv.ParseInt(str[0], 10, 64)
		//fmt.Printf("\n Found datapoints: %d \n", num)
		num_elem = int(num)
	}
	//fmt.Println(num_elem)
	// construct final slice based on number
	for i,_ := range organs {
		lines[i]= make([][][]float64,len(plans))
		for j,_ := range plans {
			lines[i][j] = make([][]float64,int(num_elem))
		}
	}
	//fmt.Printf("Done Constructing Array")
	for i,organ := range organs {
		//fmt.Printf("\nConstructing organ %v", i)
		for j,plan := range plans {
			//fmt.Printf("\nConstructing plan %v", j)
			filename := path + plan + "." + organ + ftype
			content, err := ioutil.ReadFile(filename)
			if err != nil {
				fmt.Printf("\n\nERROR !!! COULDNT FIND %s",filename)
				continue
			} else {
				str := strings.Split(string(content), "\n")
				//num := str[0]
				//fmt.Printf("Content is: %v", str[0])
				num, _ := strconv.Atoi(str[0])
				if int(num) != num_elem {
					fmt.Printf("\n Need to handle interpolated data")
				}
				//fmt.Printf(", reading number of elements is %d", num)
				
			for k := 0; k < int(num); k++ { 
				dataPoint := strings.Split(str[k+1], " ")
				value1, _ := strconv.ParseFloat(dataPoint[0], 64)
				value2, _ := strconv.ParseFloat(dataPoint[1], 64)
				lines[i][j][k]=make([]float64,2)
				lines[i][j][k][0] = value1
				lines[i][j][k][1] = value2
			}
			}
		}
	}

	return lines
}



/*---------------------------------------Database Connector API-------------------------------------*/

/*-------------------Dynamic Organ lists and Plan lists------------------------------*/
//function to generate dynamic plan for selected patient
func generatePlanList(patient string) []string {
	path := "./client/patient_data/qcMCO/" + patient + "/"
	// path := "./client/patient_data/qcMCO/Patient_5/"
	
	files, err := ioutil.ReadDir(path)
	if err != nil {
		log.Fatal(err)
	}

	plansMap := map[string]bool{}

	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".ddvh") {
			stringCol := strings.Split(file.Name(), ".")
			_, ok := plansMap[stringCol[0]]
			if !ok {
				plansMap[stringCol[0]] = true
			}
		}
	}

	plansList := []string{}
	for plan, _ := range plansMap {
		plansList = append(plansList, plan)

	}

	return plansList
}


/*-------------------Dynamic Organ lists and Plan lists------------------------------*/
//function to generate dynamic organ for selected patient
func generateOrgansList(patient string) []string {
	//read directory for a selected patient
	// files, err := ioutil.ReadDir("./client/patient_data/qcMCO/Patient_5/")
	path := "./client/patient_data/qcMCO/" + patient + "/"
	files, err := ioutil.ReadDir(path)
	if err != nil {
		log.Fatal(err)
	}

	organsMap := map[string]bool{}

	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".ddvh") {
			stringCol := strings.Split(file.Name(), ".")
			_, ok := organsMap[stringCol[1]]
			if !ok {
				organsMap[stringCol[1]] = true
			}
		}
	}

	organsList := []string{}
	for organ, _ := range organsMap {
		organsList = append(organsList, organ)

	}

	return organsList
}

