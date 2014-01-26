

// accedere alle preferenze
var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch); //preference manager



// aggiornamento del database di md5
function upgradeDB() {
	
	document.getElementById('HSprog').mode = "undetermined";
	
	if(prefManager.getBoolPref("extensions.SecureExt.HSvv")){
		alert("Upgrading DataBase...");
		if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      		writeToLog("\t *** " + getTime() + " Upgrading DataBase...",logfilehs);
	}

	// MODIFICO PER FIREFOX 4
	// ricavo il path della lista dei siti protetti e del database md5 all'interno della directory dell'estensione
	var protectedlistpath;
	var md5dBlistpath;
	if(majorVersion < 4){
		protectedlistpath = getExtPath("protectedlist.txt");
		md5dBlistpath = getExtPath("md5dB.txt");
	}
	else {
		if (nagt.toLowerCase().indexOf("win") != -1)
			{
				protectedlistpath = path + "\\" + protectedlistfile;
				md5dBlistpath = path + "\\" + md5dBlistfile;
			}
		else
		{
			protectedlistpath = path + "/" + protectedlistfile; //getExtPath("protectedlist.txt");
			md5dBlistpath = path + "/" + md5dBlistfile; //getExtPath("md5dB.txt");
		}
		//dump("Path: " + path + "\n");
		//dump("Protectedlistpath: " + protectedlistpath + "\n");
		//dump("Md5listpath: " + md5dBlistpath + "\n");
	}
	
	
	// creazione oggetto nsIFile per accedere alla lista dei siti protetti
	var fileinput = createObjStream(protectedlistpath);
	// creazione dello stream per la lettura riga per riga
	var istream = readStreamLBL(fileinput);
	
	// inizio la lettura riga per riga del file dei siti protetti
	var line = {}, lines = [], hasmore;
	
	var i = 0;
	var md5List = new Array();
	
	//  do-while per ogni riga
	do {
	
		hasmore = istream.readLine(line);
		linevalue = line.value;
		lines.push(linevalue);
		
		
		if(prefManager.getBoolPref("extensions.SecureExt.HSvv")){
      			alert("Trying to do an xmlhttprequest for url: " + linevalue);
      			if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      				writeToLog("\t *** " + getTime() + " Trying to do an xmlhttprequest for url: " + linevalue,logfilehs);
      	}
		
		
		// xmlhttprequest - estrapolo il codice sorgente della pagina (linevalue è un url)
		var req = httpReq(linevalue);
		
  		
  		// controllo status & state
  		if(req.status == 200 && req.readyState == 4){
  			
  			if(prefManager.getBoolPref("extensions.SecureExt.HSvv")){
      				alert("No problem with xmlhttprequest for the url: " + linevalue + " Ready state = 4 and Status = 200");
      				if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      					writeToLog("\t *** " + getTime() + " No problem with xmlhttprequest for the url: " + linevalue + " Ready state = 4 and Status = 200",logfilehs);
      		}
  			
  			
  			var strRc = req.responseText;
  			
  		
  			// parser - dato il codice della pagina in formato stringa, estrapolo tutti i link salvandoli in un array
  			var linkarray = parseLinks(strRc);
  		
  		
  			// ordino alfabeticamente l'array dei link
  			linkarray.sort();
  			
  			/*
  			// stampa lista link
  			var linklist = "";
  			for (var i=0; i<linkarray.length; i++){
  				linklist = linklist + "\n" + linkarray[i];
  			}
  			alert("ecco il linklist: " + linklist);
  			*/
  			
  		
  			// calcolo md5 della lista di link, il join trasforma l'array direttamente in stringa legando i link con una virgola
  			var md5resultdoc = rstr_md5(linkarray.join(","));
			var md5hex = rstr2hex(md5resultdoc);
    	 	
  			
  			if(prefManager.getBoolPref("extensions.SecureExt.HSvv")){
      			alert("MD5 result for url: " + linevalue + " is: " + md5hex);
      			if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      					writeToLog("\t *** " + getTime() + " MD5 result for url: " + linevalue + " is: " + md5hex,logfilehs);
      		}
      			
  		
  		
  			// riempio un array di stringhe in formato (url,md5) quindi con la virgola come delimitatore
  			md5List.push(linevalue + "," + md5hex);
  		} else {
  		
  			alert("Not possible to add the URL: " + linevalue + " . Problems with xmlhttprequest: ready state = "+ req.readyState + " and status = " + req.status);
  			
  			if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      			writeToLog("\t *** " + getTime() + " Not possible to add the URL: " + linevalue + " . Problems with xmlhttprequest: ready state = "+ req.readyState + " and status = " + req.status,logfilehs);
  			
  		}
		
		
	} while (hasmore);
	
	
	
	// chiudo lo stream di lettura
	istream.close();
	
	
	// converto in stringa l'array di (url,md5) ordinandoli in riga
	var md5liststring = md5List.join("\n");
	
	
	if(prefManager.getBoolPref("extensions.SecureExt.HSvv")){
    	alert("Preparing to write DB to file..");
    	if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
			writeToLog("\t *** " + getTime() + " Preparing to write DB to file..",logfilehs);
    }
	
	
	// creazione oggetto nsIFile per accedere al file del database md5
	var fileoutput = createObjStream(md5dBlistpath);
	
	
	// preparazione degli stream per la scrittura
	var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
		createInstance(Components.interfaces.nsIFileOutputStream);
	
	// se il file non esiste viene creato 
	if(!fileoutput.exists()) {   // if it doesn't exist, create
		fileoutput.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
		foStream.init(fileoutput, 0x02 | 0x08 | 0x20, 0666, 0); 
	}else{
	
	// se il file esiste già, in questo caso per semplificare le cose viene rimosso e riscritto
		try{
			fileoutput.remove(true);
		} catch (e) {
			alert(e);
		}
		fileoutput.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
		foStream.init(fileoutput, 0x02 | 0x08 | 0x20, 0666, 0); 
   }
   
   var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
                          createInstance(Components.interfaces.nsIConverterOutputStream);
						  
   converter.init(foStream, "UTF-8", 0, 0);
   converter.writeString(md5liststring);
   converter.close(); // this closes foStream


	document.getElementById('HSprog').mode = "determined";
	alert("Upgrade DB: COMPLETE");
	if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
    	writeToLog("\t *** " + getTime() + " Upgrade DB: COMPLETE",logfilehs);
	
}
	

// permette all'utente di aggiungere un url alla lista dei siti protetti attraverso l'apposito pulsante nella gui delle preferenze
function addURLtoList(){
	/*
	// raccolta del contenuto del field nella gui delle preferenze
	var fieldinput = prefManager.getCharPref("extensions.SecureExt.UrlField");
	*/
	
	var fieldinput = unifURL();
	
	if(prefManager.getBoolPref("extensions.SecureExt.HSvv")){
		alert("Trying to add a new URL: " + fieldinput + " in list...");
		if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      		writeToLog("\t *** " + getTime() + " Trying to add a new URL: " + fieldinput + " in list...",logfilehs);
	}
	
	if(!findURL(fieldinput,protectedfile)){
		if(prefManager.getBoolPref("extensions.SecureExt.HSvv")){
			alert("Trying to do an xmlhttprequest for url: " + fieldinput);
		if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
			writeToLog("\t *** " + getTime() + " Trying to do an xmlhttprequest for url: " + fieldinput,logfilehs);
		}
	
	
		// richiesta xmlhttprequest
		var req = httpReq(fieldinput);
		
		if(req.status == 200 && req.readyState == 4){
	
	
			if(prefManager.getBoolPref("extensions.SecureExt.HSvv")){
      			alert("No problem with xmlhttprequest for the url: " + fieldinput + " Ready state = 4 and Status = 200");
      			if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      				writeToLog("\t *** " + getTime() + " No problem with xmlhttprequest for the url: " + fieldinput + " Ready state = 4 and Status = 200",logfilehs);
      		}
      	
      	
			// CAMBIATO FIREFOX 4
			// ricavo il path della lista dei siti protetti
			if(majorVersion < 4){
				var protectedlistpath = getExtPath("protectedlist.txt");
			}
			else {
				var protectedlistpath = protectedfile; 
			}
			// creazione oggetto nsIFile per accedere alla lista dei siti protetti
			var fileoutput = createObjStream(protectedlistpath);
	
			// preparazione stream per la scrittura
			var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
			
			if(!fileoutput.exists()) {   // if it doesn't exist, create
				// impossibile, deve esserci per forza 
			}else{
				//fileoutput.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
				foStream.init(fileoutput, 0x02 | 0x10, 0666, 0); 
  			}
   
   
 			var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
    			createInstance(Components.interfaces.nsIConverterOutputStream);
						  
   			converter.init(foStream, "UTF-8", 0, 0);
   			converter.writeString(fieldinput + "\n");
   			converter.close(); 
   
			
   			alert("done");
			
			
			// Se l'opzione P2P è settata
			//if(prefManager.getBoolPref("extensions.SecureExt.P2Psync")){
			//	if(prefManager.getBoolPref("extensions.SecureExt.P2PsyncDB")){
			//		synchronizeAll();
			//		alert("synchronizedAll");
			//	}
			//	else {
			//		neosync();
			//		alert("synchronized");
			//	}
			//}
			
			
			
	
		} else {
		
			alert("Not possible to add the URL: " + fieldinput + " . Problems with xmlhttprequest: ready state = "+ req.readyState + " and status = " + req.status);
  			
  			if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      			writeToLog("\t *** " + getTime() + " Not possible to add the URL: " + fieldinput + " . Problems with xmlhttprequest: ready state = "+ req.readyState + " and status = " + req.status,logfilehs);
		
		}
		
	} else {
		alert("Not possibile to add the URL: " + fieldinput + " . URL already in list.");
		
		if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      			writeToLog("\t *** " + getTime() + " Not possibile to add the URL: " + fieldinput + " . URL already in list.");
		
	}
	
}


// ricerca di un md5 all'intero del database
function findMd5(url,md5,md5dbpath){
	
	if(prefManager.getBoolPref("extensions.SecureExt.HSvv")){
    	alert("Comparing MD5 result: " + md5 + " for url: " + url);
    	if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
			writeToLog("\t *** " + getTime() + " Comparing MD5 result: " + md5 + " for url: " + url,logfilehs);
    }
	
	var check;
	
	// creazione oggetto nsIFile per accedere al database
	var input = createObjStream(md5dbpath);
	
	// creazione dello stream per la lettura riga per riga
	var istream = readStreamLBL(input);
	
	var md5found;
	
	var line = {}, lines = [], hasmore;
	
	// do-while riga per riga
	do {
		hasmore = istream.readLine(line);
		var lval = line.value;
		lines.push(lval);
		
		// ricerca di una occorrenza in lista
		if(lval.search(url) != -1){

			var arsplit = new Array();
			
			// split della stringa (url,md5) e salvataggio del corrispondente md5
			arsplit = lval.split(",");
			md5found = arsplit[1];
			
			// controllo match md5
			if(md5found == md5){
				
				if(prefManager.getBoolPref("extensions.SecureExt.HSvv")){
      				alert("Found a match for MD5: " + md5 + " for url: " + url);
      				if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      					writeToLog("\t *** " + getTime() + " Found a match for MD5: " + md5 + " for url: " + url,logfilehs);
      			}
			
				check = true;
			} else {
			
				
				if(prefManager.getBoolPref("extensions.SecureExt.HSvv")){
      				alert("MD5 result: " + md5 + " for url: " + url + " doesn't match with the MD5 in database: " + md5found);
      				if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      					writeToLog("\t *** " + getTime() + " MD5 result: " + md5 + " for url: " + url + " doesn't match with the MD5 in database: " + md5found,logfilehs);
      			}
				
				check = false;
			}
			break;
			
			
		} else {
		
			//alert("non ho trovato un cazzo ma non e possibile");
			//alert("errore in protectedlist.txt");
			
		}
	
	} while(hasmore);
	
	istream.close();
	
	return check;
	
	
	
}


// cerca l'url dato nel file dato
function findURL(url,userlistfilepath) {
	
	if(prefManager.getBoolPref("extensions.SecureExt.HSvv")){
		alert("Searching url: " + url + " in directory: " + userlistfilepath);
		if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
 			writeToLog("\t *** " + getTime() + " Searching url: " + url + " in directory: " + userlistfilepath,logfilehs);
	}

	// creazione oggetto nsIFile per accedere al database
	var input = createObjStream(userlistfilepath);
	
	// creazione dello stream per la lettura riga per riga
	var istream = readStreamLBL(input);
	var check;
	var line = {}, lines = [], hasmore;

	// do-while riga per riga
	do {
		hasmore = istream.readLine(line);
		lines.push(line.value);
		
			
		// ricerca corrispondenza url
		if(line.value == url){
			
			if(prefManager.getBoolPref("extensions.SecureExt.HSvv")){
      			alert("Found url: " + url + " in list");
      			if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      					writeToLog("\t *** " + getTime() + " Found url: " + url + " in list",logfilehs);
      		}
			
			check = true;
			break;
		} else {
			//alert("non ci sono corrispondenze tra " + line.value + " e " + url);
		}
 		
	} while(hasmore);
	
	istream.close();
	
	
	return check;
	
}


// parser
function parseLinks(str){
	
	
	if(prefManager.getBoolPref("extensions.SecureExt.HSvv")){
    	alert("Parsing the xmlhttprequest response in string format...");
    	if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      					writeToLog("\t *** " + getTime() + " Parsing the xmlhttprequest response in string format...",logfilehs);
    }
	
  	var links = new Array();
  		
  	// parser - dato il codice della pagina in formato stringa, estrapolo tutti i link salvandoli in un array
  	for(var i=0; i<str.length; i++){
  		
  		//alert("parto da indice: " + i);
  		var loc = str.indexOf("\"http",i);
  		
  		if(loc != -1){
  			//alert("trovato un http in posizione: " + loc);
  			i = loc + 1;
  			
  			
  			var subloc = str.indexOf("\"",i+1);
  			//alert("virgoletta si trova in posizione: " + subloc);
  			
  			
  			var lun = subloc - i;
  			
  			var link = str.substr(i,lun);
  			
  			
  			if(link.search("://") != -1){
  			
  				// link escape character function
  				
  				link = link.replace(/[ \n\r\t]/g,"");
  				
  				
  				links.push(link);
  				//alert("ecco il link trovato: " + link);
			}
 				
 				
		} 
  			
	}
  	
  	
  	return links;
	
}


// richiesta xmlhttprequest
function httpReq(url){
	
	try{
		var xmlhttp = new XMLHttpRequest();
  		xmlhttp.open("GET",url,false);
  		xmlhttp.setRequestHeader("Content-type","text");
  		xmlhttp.send(null);
  	} catch(e) {
  		alert("xmlhttprequest problem!!! Not possible to request the page source code.");
  	}
 
	return xmlhttp;	

}


// ritorna il tempo totale corrente (data, ora)
function getTime(){
	
	var time = new Date();
	return time
	
}


// uniforma URL scritto nel textfield
function unifURL(){
	
	var pref = "http://";
	var str = "";
	var inputmod = "";
	
	// raccolta del contenuto del field nella gui delle preferenze
	var fieldinput = prefManager.getCharPref("extensions.SecureExt.UrlField");
	
	// depurazione degli https://, il controllo va effettuato su eventuali https strippati, quindi http
	if(fieldinput.search("https://") != -1){
		fieldinput = fieldinput.replace("https://","http://");
	}
	
	// controllo della presenza di prefissi "http://" o "https://"
	if(fieldinput.search("http://") == -1){
		fieldinput = str.concat(pref,fieldinput);
	}
	
	// controllo della presenza di slash finali
	var tot = fieldinput.length;
	if(fieldinput.charAt(tot-1) != "/"){
		inputmod = fieldinput.concat("/");
	} 
	
	// check url esistente, in caso si tratta di altro (es. index.jsp)
	var testurl = httpReq(inputmod);
	
	if(testurl.status == 200 && testurl.readyState == 4){
		return inputmod;
	} else {
		return fieldinput;
	}
	
}

