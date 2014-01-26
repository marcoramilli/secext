/*

File: SecureExt.js
The "main" script. It manages the page load, page unload and tab-related
events, adding the listeners. It also calls, for every web page loaded, the
testPage() function (in TestPage.js) which analyzes the page and recognize 
clickjacking attempts, changing the icon and tooltip (Status.js). In case of
more tabs opened, when selecting a tab, would be useless to call testPage every
time; so, we need to remeber what pages are malicious; so a reference to the 
page is manteined in two arrays, one for the "yellow" ones (that may be risky, 
so a yellow icon is displayed) and one for the "red" ones (that are risky for 
sure, so a red icon is displayed).

*/



// nome file lista siti di default
var protectedlistfile = "protectedlist.txt";
var md5dBlistfile = "md5dB.txt";
var logfilehs = "SecureExtHS.log";

// serve per accedere alle preferenze
var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch); //preference manager

// CLICKJACKING SETUP

// listener per gestione pageload e pageunload
window.addEventListener("load",function (){gBrowser.addEventListener("load", OnPageLoad, true);},false); //page loading listener
window.addEventListener("pagehide", OnPageUnload, false); //page unload listener

// listener per uscita da rete P2P
//window.addEventListener("unload", OnUnload, true);
window.addEventListener("load", OnLoad, false);



// creazione array per semaforo
var redPages = new Array(); //list of the bad pages
var yellowPages = new Array(); //list of the possibly bad pages

// HTTPS STRIPPING SETUP
// nella fase di installazione del plugin non ho la possibilità di chiamare funzioni esterne..

// ritorna la location dell'estensione + il file prescelto al suo interno, in questo caso protectedlist.txt
var MY_ID = "{2a955e0c-6914-4816-a95c-f764b672b7c1}";

// Determino la versione di Firefox
var nagt = navigator.userAgent;
var verOffset=nagt.indexOf("Firefox");
var fullVersion = nagt.substring(verOffset+8);
var majorVersion = parseInt(''+fullVersion,10);

var protectedfile;
var path;
var extensionPath;
var extensionUrl;
if (majorVersion < 4)
{
	var em = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);  			
	var file = em.getInstallLocation(MY_ID).getItemFile(MY_ID, protectedlistfile);
	protectedfile = file.path;
	this.extensionPath = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager).getInstallLocation(MY_ID).getItemLocation(MY_ID);
	this.extensionUrl = "file:///" + extensionPath.path.replace(/\\/g,"/");
			// "file:///D:/Developer/FirefoxExtensions/SecureExt"
}
else{
	Components.utils.import("resource://gre/modules/AddonManager.jsm");
	AddonManager.getAddonByID(MY_ID, function(addon) {
		this.path =  addon.getResourceURI("").QueryInterface(Components.interfaces.nsIFileURL).file.path;
		if (nagt.toLowerCase().indexOf("win") != -1)
			{
				protectedfile = path + "\\" + protectedlistfile; }
		else
		//this.path = this.path.replace(/\\/g,"/");
			{ protectedfile = path + "/" + protectedlistfile;}
		this.extensionPath =  addon.getResourceURI("").QueryInterface(Components.interfaces.nsIFileURL).file.path;
		// "D:\\Developer\\FirefoxExtensions\\SecureExt"
		this.extensionUrl = "file:///" + extensionPath.replace(/\\/g,"/");
		// "file:///D:/Developer/FirefoxExtensions/SecureExt"		
	});
}


//handles page load; called for every frame loaded by a web page but also for favicons
function OnPageLoad(event){ 

		
	if (event.originalTarget instanceof HTMLDocument) { //to exclude favicons (must be an HTML)
		if (event.originalTarget.defaultView.frameElement) 
			return; //to exclude frame and iframes loaded
		 
		var doc = event.originalTarget;
		
		while (doc.defaultView.frameElement) //to find the root frame
    		doc=doc.defaultView.frameElement.ownerDocument;
		
		var url = doc.URL;
		
		var container = gBrowser.tabContainer;
    	var container2 = gBrowser.mPanelContainer;
    	container.addEventListener("TabClose", OnPageUnload, false); //tab closing listener
    	container.addEventListener("TabOpen", tabOpened, false); //tab opening listener
    	container2.addEventListener("select", tabSelected, false); //tab selection listener
    
    	// clickjacking
    	testPage(doc);

     	
      	// HTTPSSTRIP
      	
      	// ad ogni nuova apertura di pagina lo scopo è quello di controllare se l'url visitato è presente nella lista dei siti protetti
      	// se affermativo calcolare il nuovo md5 e confrontarlo con il vecchio cercando nel database degli md5
  
      	
      	
      	// ricerca dell'url nella lista
      	if(findURL(url,protectedfile)){
      		
      		if(prefManager.getBoolPref("extensions.SecureExt.HSvv")){
      			alert("Trying to do an xmlhttprequest for url: " + url);
      			if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      				writeToLog("\t *** " + getTime() + " Trying to do an xmlhttprequest for url: " + url,logfilehs);
      		}
      		
      		// xmlhttprequest - estrapolo il codice sorgente della pagina 
      		var req = httpReq(url);
 			
 			
 			if(req.readyState == 4 && req.status == 200){
  				
  				if(prefManager.getBoolPref("extensions.SecureExt.HSvv")){
      				alert("No problem with xmlhttprequest for the url: " + url + " Ready state = 4 and Status = 200");
      				if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      					writeToLog("\t *** " + getTime() + " No problem with xmlhttprequest for the url: " + url + " Ready state = 4 and Status = 200",logfilehs);
      			}
  				
  				
  				var strRc = req.responseText;
  				  			
  			
  				var linkarray = parseLinks(strRc);
  				

  				linkarray.sort();
  				
  				
  				/*
  				var linklist = "";
  			
  				for(var i=0; i<linkarray.length; i++){
  				
  				
  					linklist = linklist + linkarray[i] + "\n";
  				
  				}
  				*/
  			
  			
 				// calcolo md5 della lista di link, il join trasforma l'array direttamente in stringa legando i link con una virgola		
  				var md5resultdoc = rstr_md5(linkarray.join(","));
     			var md5hex = rstr2hex(md5resultdoc);
  			
  				// qui ci va la ricerca nel md5dB.txt della riga corrispondente a URL, poi split della stringa e confronto gli md5!!
  				var md5path = getExtPath(md5dBlistfile);
  
      			// ricerca dell'md5 appena calcolato nel database md5 e notifica
      			if(!findMd5(url,md5hex,md5path)){
      			
     				
      				if(prefManager.getBoolPref("extensions.SecureExt.HSalert"))
      					alert("Warning: Possible HTTPSSTRIP attack browsing: " + url);
      				
      				if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      					writeToLog(getTime() + " browsing: " + url + " with MD5: " + md5hex + " doesn't match with the MD5 found in DB: POSSIBLE HTTPSSTRIP ATTACK!",logfilehs);
      					
      				if(prefManager.getBoolPref("extensions.SecureExt.HSvv"))
      					alert("MD5: " + md5hex + " doesn't match with the MD5 found in DB: POSSIBLE HTTPSSTRIP ATTACK");
      				
      			
      			} else {
      			
      				
      				if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      					writeToLog(getTime() + " browsing: " + url + " with MD5: " + md5hex + " is the same found in DB: OK!",logfilehs);
      				
      				if(prefManager.getBoolPref("extensions.SecureExt.HSvv"))
   		  				alert("Matching MD5 in DB: all is OK.");
      			
      			}
      		
      		
      		
      		} else {
      		
      			if(prefManager.getBoolPref("extensions.SecureExt.HSalert"))
      				alert("Problems with xmlhttprequest: ready state = "+ req.readyState + " and status = " + req.status + ". HttpsStripping Attempt not possible.");
      			
      			if(prefManager.getBoolPref("extensions.SecureExt.HSvvv")){
      				alert("Problems with xmlhttprequest: ready state = "+ req.readyState + " and status = " + req.status + ". HttpsStripping Attempt not possible.");
      				if(prefManager.getBoolPref("extensions.SecureExt.HSlog"))
      					writeToLog("",logfilehs);
      			}
      				
      		}
      		
      		
      		
      	} else {
      	
      		if(prefManager.getBoolPref("extensions.SecureExt.HSvv"))
      			alert("Url: " + url + " NOT found in list.");
      		
      	}
      	
     	/*
     	// parte per scrivere qualcosa in out sul desktop, mi serve per le mie stampe più che altro, dopo prob non serve
     	
    	var fileoutput = Components.classes["@mozilla.org/file/directory_service;1"].
			getService(Components.interfaces.nsIProperties).
  			get("Desk", Components.interfaces.nsIFile);
  			
  			//alert("ecco fileoutput: " + fileoutput);
  		
		fileoutput.append("r1.txt");
		var outputstream = fileoutput.path;
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
			createInstance(Components.interfaces.nsIFileOutputStream);
	

		
		if(!fileoutput.exists()) {   // if it doesn't exist, create
			fileoutput.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);

			foStream.init(fileoutput, 0x02 | 0x08 | 0x20, 0666, 0);
	
			var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
				createInstance(Components.interfaces.nsIConverterOutputStream);
			converter.init(foStream, "UTF-8", 0, 0);
			converter.writeString(linklist);
			converter.close();
			
			
		}
		*/
		
     
	}
		 
}




//handles page unload (or tab closing)
function OnPageUnload(aEvent) { 

   if (aEvent.originalTarget instanceof HTMLDocument) {

      var doc = aEvent.originalTarget; //reference to the page closed
	  
	  for(var i=0; i<redPages.length; i++){ //looks in the array to know if we are leaving a risky page
	  
	     if(redPages[i]==doc){ //if we're leaving a risky page, 
		    redPages.splice(i,1); //the reference is removed from the array, as it's not a menace any longer
			break;
		 }
		 
      }
	  
	  for(var i=0; i<yellowPages.length; i++){ //same as above
	  
	  	 if(yellowPages[i]==doc){
		    yellowPages.splice(i,1);
			break;
		 }
			
	  }  
   
   }
    
}




//tab opening listener
function tabOpened(event){ 
   if(gBrowser.selectedBrowser != event.target.linkedBrowser) //needed if a tab is opened in background
      testPage(event.target.linkedBrowser.contentDocument);
}



//handles the tab change
function tabSelected(event){ 

   var doc = gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex).contentDocument; //current displayed web page
   var sec = true;
   
   for(var i=0; i<redPages.length; i++){ //checks if the reference of this page is already stored in one of the arrays
      
	  if(redPages[i]==doc){ //if so, change the status; so we can avoid to call every time testPage
	  
	     alt();
		 sec=false;
	     break;
		 
	  }
	  
   }
   
   for(var i=0; i<yellowPages.length; i++){ //as above
      
      if(yellowPages[i]==doc){
	  
	     warn();
		 sec=false;
	     break;
		 
	  }
	  
   }
   
   if(sec) //if the page is secure (its reference isn't in the arrays)
      ok();	  
   
}





function OnLoad(event){
	// Se si tratta delle preferences, registo l'observer
	if (event.originalTarget.title.indexOf("Mozilla Firefox") == -1){
		// Registro il Preference Observer per controllare se le preferenze P2P vengono cambiate
		if(event.originalTarget.title == "SecureExt - Configuration Panel")
{		
		var P2PPrefObserver = {
			register: function() {
				// First we'll need the preference services to look for preferences.
				var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
				// For this._branch we ask that the preferences for extensions.myextension. and children
				this._branch = prefService.getBranch("extensions.SecureExt.P2P");
				// Now we queue the interface called nsIPrefBranch2. This interface is described as: 
				// "nsIPrefBranch2 allows clients to observe changes to pref values."
				this._branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
				// Finally add the observer.
				this._branch.addObserver("", this, false);
			},
			unregister: function() {
				if (!this._branch) return;
				this._branch.removeObserver("", this);
			},
			observe: function(aSubject, aTopic, aData) {
				if(aTopic != "nsPref:changed") return;
				//switch(aData){
				//	case "sync":
				//		if(prefManager.getBoolPref("extensions.SecureExt.P2Psync") == false){
				//			return;
				//		}
				//}
				try{
					// If P2P changed ask to restart Firefox		
					if (confirm("Changes in P2P settings require Firefox restart.\n Do you want to restart Firefox now?")) { 
						var boot = Components.classes["@mozilla.org/toolkit/app-startup;1"].getService(Components.interfaces.nsIAppStartup);
						boot.quit(Components.interfaces.nsIAppStartup.eForceQuit|Components.interfaces.nsIAppStartup.eRestart);
					}
				}
				catch(exception){
					dump("Method invoked twice\n");
				}
			}
		}
		P2PPrefObserver.register();	
		}
		return;
	}
	
	// Preference check
	if(prefManager.getBoolPref("extensions.SecureExt.P2Psync") == false){
		return;
	}
	// Java Loading
	java_load();
	dump("Join P2P network\n");
	join();
}


// Avverto la rete P2P che sto chiudendo Firefox
// Inutile col sistema di threading

//function OnUnload(event){
//	// Preference check
//	if(prefManager.getBoolPref("extensions.SecureExt.P2Psync") == false){
//		return;
//	}
//	// Escludo i panel delle preferences
//	if (event.originalTarget.title.indexOf("Mozilla Firefox") == -1)
//	{
//		if(event.originalTarget.title == "SecureExt - Configuration Panel")
//		{
//			//synchronize();
//			return;
//		}
//		return;
//	}
//	closeP2P();
//	//alert("Closing: " + event.originalTarget.title);
//}

