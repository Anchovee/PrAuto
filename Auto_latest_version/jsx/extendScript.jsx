alert("What files would you like me trim for you bing bong?");

$.runScript = {


        autoSequence : function (name) {
       
  
var csvFile = File.openDialog ("Target CSV File", "*.csv"); 
var csvFile = csvFile.fsName; //FORMAT CSV FILE PATH TO BE FRIENDLY

app.project.createNewSequence("Auto Seq", ""); //PROMT TO CREATE A NEW SEQUENCE

// var csvFile = "C:\\filepath"
var importCount = 0;
var subCounter = 0;
var clipCounter = 0;
var infoArray = [];

var bufferTime = 2;

//FOLLOWING OPENS THE TESXT FILE AND STORES IT IN VAR CSVFILE
if(csvFile){
    
    var file = File(csvFile)
    file.open("r");
    var fullText = file.read();
    file.close();
    
    infoArray = fullText.split("\n"); 
    
        for(var a=0;a<infoArray.length;a++){
            infoArray[a] = infoArray[a].split(",");
            }
}
alert("Ha ha ha ha.")
if(infoArray[infoArray.length -1] == ""){ //SOMETIMES WHEN SPLITTING UP THE ARRAY THE PROCESS CREATES AN EXTRA EMPTY LINE THIS WILL TEST AND REMOVE IF HAPPENS
       infoArray.splice(infoArray.length-1, 1)
}



app.project.rootItem.createBin("Original Clips"); //CREATES FOLDER FOR OG CLIPS
var importBin = findBinIndex(app.project.rootItem,"Original Clips");//STORE THE INDEX PATH TO THAT BIN

//IMPORTARY TO LOAD FILES THIS IS WHERE YOU ADJUST FILEPATHS IF YOU TO
var importAry = [];

//LOOP THOURGH INFOARRAY
if (infoArray){
    for (var i = 1 ; i <infoArray.length; i++) {//START WITH i1AS 1 BECAUSE THE FIRST LINE OF OUR CSV IS HEADERS
        importAry[0] = infoArray[i][3];// SET importAry ITEM TO THE FILEPATH FORMAT CORRECTLY HERE
            
        app.project.importFiles(importAry,1,importBin,0);  // 1: IMPORT ONE MOVIE AT A TIME INTO THE NEW BIN. 0:CSVINDEX SO WE CAN RENAME IT ACCORDINGLY AS IT COMES IN
        importCount++;
            
            for (var a = 0; a< importBin.children.numItems; a ++){//LOOP THROUGH THE IMPORT BIN
                    if(importBin.children[a].name.indexOf(" - ")==-1){
                        importBin.children[a].name = "  "+ importCount + " - " + importBin.children[a].name; //RENAME WITH A THE NUMBER IF WAS IMPORTED. THIS HOLDS THE ORDER OF THE CSV 
                        infoArray[i][infoArray[i].length] = importBin.children[a].nodeId; //STORE THE ITEMS NODE ID
                        }
            }
        }
    }
         
//~ alert(infoArray)
//~ //==========END CSV EXAMPLE FULL ========

app.project.rootItem.createBin("Subclips");//CREATE BIN FROM OUR SUBCLIPS
var moveTo = findBinIndex(app.project.rootItem,"Subclips"); //STORES INDEX  IN VARIABLE 'MOVE TO' THE BIN WE SEARCH FOR

for (a=0;a<app.project.sequences.numSequences;a++){//LOOP THROUGH ALL SEQS
    if(app.project.sequences[a].name=="Auto Seq"){ //FIND OUR CREATED SEQUENCES
    app.project.activeSequence = app.project.sequences[a];
    }
}


//LOOP THROUGH OUR IMPORT
var numItems = importBin.children.numItems;

for(a=0;a<numItems;a++){
    var currentItem = importBin.children[a];
    for (var i = 1; i<infoArray.length;i++) { //LOOPTHROUGH INFO ARRAY 
        
        if(currentItem.type ==  1 && currentItem.nodeId == infoArray [ i ][infoArray[i].length-1]){ //CHECK THAT ITEM IS A CLIP '&&' AND THAT THE NODEIDS MATCH WITH OUR CSV 'i' represents first livLINE.
            
            var inPoint = timecodeToSeconds(infoArray[i][1]);  //GATHER TIMECODE INFO INTO A FLAT SECONDS NUMBER
            var outPoint = timecodeToSeconds(infoArray[i][2]);
            
            var newSub = currentItem.createSubClip(infoArray[i][0] , inPoint , outPoint , 0 , 1 , 1 ); // infoArray[i][0] refers to CSV INDEX >CREATE THE SUBCLIPS ( NAME , IN  , OUT, BOUNDARIES (BINARY) , TAKE VIDEO , TAKE AUDIO)
            newSub.moveBin(moveTo); //MOVE INTO THE SUBCLIPS BIN
            
            var activeSeq = app.project.activeSequence;
            placeClip(activeSeq, newSub, bufferTime);
            //subCounter++;
        }
    }
}
                                                    
//=======woohoo done========

//FUNCTION LIST.
function findBinIndex(currentItem, nameToFind){
        if(nameToFind){
        for (var j = 0;  j < currentItem.children.numItems;  j++){
                var currentChild = currentItem.children[j];
                
                        if (currentChild.type == ProjectItemType.BIN && currentChild.name.toUpperCase() == nameToFind.toUpperCase() ){
                            globalBind = currentChild;
                            return currentChild;
                        }
                        
                        if (currentChild.type == ProjectItemType.BIN){
                        findBinIndex(currentChild, nameToFind);
                        }
            }
               
    } else {
        alert("No bin was targeted");
        }
    }
function timecodeToSeconds(arrayObject){
    var timeCodearray =[];
    timeCodeArray = arrayObject.split(":");
    var timeCode = (Number(timeCodeArray[0])*60) + (Number(timeCodeArray[1])); //wasn't working until I added '(' after 2nd 'number' 
    return timeCode;
    }

function placeClip(activeSeq , subClip , buffer){
    subClip.setScaleToFrameSize();//SET SCALE TO FRAME SIZE

                    if(activeSeq.videoTracks[0].clips.numItems  == 0){ //IF == clips CLIPS IN the sequence PLACE FIRST CLIP [0] AT TIME ZERO>>
                    activeSeq.videoTracks[0].insertClip(subClip,0) //(insert subClip, TIMECODE 0)
                    //clipCounter++;
                    } else { //IF THERE ARE CLIPS IN THE SEQUENCE, PLACE AT THE TIMECODE OF END OF LAST CLIP +BUFFER TIME
                    var numClips = activeSeq.videoTracks[0].clips .numItems;
                    var insertTime = activeSeq.videoTracks[0].clips[numClips - 1].end.seconds + buffer; // CLIPS.NUMITEMS minus 1 BC START timecode starts at 0 giving you the end of final clip
                    activeSeq.videoTracks[0].insertClip(subClip,insertTime);
                    //clipCounter++;
                    }
                }
alert("Whoa. Living on a prayer.")
	//--------------------------------------------------------------------------------------------------------------------------------------------------
}	
    
}