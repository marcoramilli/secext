

// NON VALIDO IN FIREFOX 4
// ritorna la location dell'estensione + il file prescelto al suo interno
function getExtPath(filetarget){

	var MY_ID = "{2a955e0c-6914-4816-a95c-f764b672b7c1}";
	var em = Components.classes["@mozilla.org/extensions/manager;1"].
		getService(Components.interfaces.nsIExtensionManager);  			
	var file = em.getInstallLocation(MY_ID).getItemFile(MY_ID, filetarget);
	
	return file.path;

}


// creazione oggetto nsIFile
function createObjStream(extfolderpath) {
	var filestream = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	filestream.initWithPath(extfolderpath);
	return filestream;
}


// creazione oggetto nsIFile, getting special files
function createObjStreamSp(location,file) {
	
	var filestream = Components.classes["@mozilla.org/file/directory_service;1"].
		getService(Components.interfaces.nsIProperties).
  		get(location, Components.interfaces.nsIFile);
	filestream.append(file);
	
	return filestream;
	
}


// lettura semplice di un file
function readSimple(obj) {
	
	var data = "";
	var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].
		createInstance(Components.interfaces.nsIFileInputStream);
	var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
		createInstance(Components.interfaces.nsIConverterInputStream);
	fstream.init(obj, -1, 0, 0);
	cstream.init(fstream, "UTF-8", 0, 0);

	let (str = {}) {
		let read = 0;
		do {
			read = cstream.readString(0xffffffff, str);
			data += str.value;
		} while (read !=0);
	}
	cstream.close();
	
	return data;
	
}


function initStream(obj) {
	
	//var data = "";
	var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].
		createInstance(Components.interfaces.nsIFileInputStream);
	var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
		createInstance(Components.interfaces.nsIConverterInputStream);
	fstream.init(obj, -1, 0, 0);
	cstream.init(fstream, "UTF-8", 0, 0);
	
	return cstream;
	
}



// prepara lo stream per la lettura line by line
function readStreamLBL(obj){
	
	// open an input stream from file
	var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
	istream.init(obj, 0x01, 0444, 0);
	istream.QueryInterface(Components.interfaces.nsILineInputStream);
	
	return istream;
	

}




// scrive sullo stream

function writeStream(obj) {
	
	var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
		createInstance(Components.interfaces.nsIFileOutputStream);
	
	foStream.init(obj, 0x02 | 0x08 | 0x20, 0666, 0);
	
	var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
		createInstance(Components.interfaces.nsIConverterOutputStream);
	converter.init(foStream, "UTF-8", 0, 0);
	converter.writeString(data);
	converter.close();
	
	
}



//writes a string in [User_Desktop]
function writeToLog(data,filepath){ 

   // more info at: https://developer.mozilla.org/index.php?title=en/Code_snippets/File_I%2F%2FO
   var file = Components.classes["@mozilla.org/file/directory_service;1"].
                     getService(Components.interfaces.nsIProperties).
                     get("Desk", Components.interfaces.nsIFile);
					 
   file.append(filepath);
   
   // file is nsIFile, data is a string
   var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
                         createInstance(Components.interfaces.nsIFileOutputStream);
						 
  if(!file.exists()) {   // if it doesn't exist, create
      file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
	  foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0); 
   }else{
      foStream.init(file, 0x02 | 0x10, 0666, 0);
   }
   
   var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
                          createInstance(Components.interfaces.nsIConverterOutputStream);
						  
   converter.init(foStream, "UTF-8", 0, 0);
   converter.writeString(data + "\n");
   converter.close(); // this closes foStream
  
}




