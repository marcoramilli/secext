/*

File: TestPage.js
Implements a function that marks a web page as bad if uses invisible iframes 
(function findInvisibleIFrames) and z-index tag in css; marks it as possibly
bad if uses z-index tag and active objects (flash and java). Alerts the user 
only if alerting is enabled in the config panel. It also writes on text file 
(function writeToLog) URL and status separed by a tab (if logging is enabled).

*/

var logfilecj = "SecureExtCJ.log";

var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch); //preference manager
		
function testPage(doc){

   var zIndexFound=false;
   var objectsFound=false;
   var invisibleIFrames=false;   
   var a=findCss(doc, "z-index"); //looks for z-index in the css; an array containig all the occurence is given
   
   if(a.length != 0) //if the array is not empty
      zIndexFound=true;
	  
   objectsFound=findObjects(doc); //looks for objects
   
   invisibleIFrames=findInvisibleIFrames(doc); //looks for invisible iframes
	  
   if(zIndexFound && invisibleIFrames){
   
      alt(); //change the status
	  if(prefManager.getBoolPref("extensions.SecureExt.CJalert")) ////if user wants to be alerted
	     alert("ClickJacking Attempt!");
	  redPages.push(doc); //and remember this page!
	  if(prefManager.getBoolPref("extensions.SecureExt.CJlog")) ////if user enables logging
	     writeToLog("[CLICKJACKING ATTEMPT] on " + doc.URL + "\t red \n",logfilecj);
	  
   }else if(zIndexFound && objectsFound){
   
      warn(); //as above
	  if(prefManager.getBoolPref("extensions.SecureExt.CJwarn")) //if user wants to be warned
	     alert("Possible ClickJacking Attempt!");
	  yellowPages.push(doc);
	  if(prefManager.getBoolPref("extensions.SecureExt.CJlog")) ////if user enables logging
	     writeToLog("[CLICKJACKING ATTEMPT] on " + doc.URL + "\t yellow \n",logfilecj);
   
   }else{
      
	  ok();
	  if(prefManager.getBoolPref("extensions.SecureExt.CJlog")) ////if user enables logging
	     writeToLog("[CLICKJACKING ATTEMPT] on " + doc.URL + "\t green \n",logfilecj);
	 
   }

}

function findCss(doc, regex){ //calls the nav function on every css of the given document
   
   var a = new Array();
   var sheets = doc.styleSheets;
   
   for(var i=0; i<sheets.length; i++)
      nav(sheets[i], regex, a);	  
	 
   return a;

}

function nav(sheet, regex, a){ //recursive function that explores all the external css tree (in case there are @import-ed css that @import others)

   var rules = sheet.cssRules; //array of rules
	  
   for(var i=0; i<rules.length; i++){
	  
	     if(rules[i].cssText.search("@import") > -1){ //if the rule is an @import, call nav on the imported css
	        nav(rules[i].styleSheet, regex, a);
         
         }else{		 
		    if(rules[i].cssText.search(regex) > -1) //else, look for the goven regex
	           a.push(rules[i].cssText); //push the matching rule in the array
		 }
			
   }
		 
}

function findObjects(doc){ //looks for the presence of objects 

   var found=false;   
   
   var objects = doc.getElementsByTagName("embed"); //looks for embed nodes in the DOM
   var applets = doc.getElementsByTagName("applet");
   
   try{
      
	  for(var i=0; i<objects.length; i++)
         if(objects[i].getAttribute("type") == "application/x-shockwave-flash") //if the type attribute of this node is "flash"
	        found=true;
		
   }catch(e){} ////if type is not defined, an exception is trown; to avoid alert messages, we surround this part of code with try/catch
		 
   if(applets.length != 0)
      found=true;
   
   /* 
   to add more object types (e.g. to add a MS Excel file) just do this:
   if(objects[i].getAttribute("type") == "application/x-shockwave-flash") ||
      objects[i].getAttribute("type") == "application/vnd.ms-excel") ||
	  objects[i].getAttribute("type") == "...")){
   look at http://en.wikipedia.org/wiki/Internet_media_type for more info on MIME
   */
   
   return found;

}

function findInvisibleIFrames(doc){

   var iframes = doc.getElementsByTagName("iframe"); //looks for iframe nodes in the DOM
   var found = false;
   
   for(var i=0; i<iframes.length; i++){ //for every iframe...
    
	  try{
	  
	     var idRules=findCss(doc, RegExp("#"+iframes[i].getAttribute("id"))); //...looks if its style properties are defined by a css id (#id_name{....})...
	     var classRules=findCss(doc, RegExp("\."+iframes[i].getAttribute("class"))); //...or by a css class (.class_name{....}); arrays are given;
		  
	     for(var j=0; j<idRules.length; j++) //if the array contains a rule for invisibility (note that length should be <=1, as id names are unique in css)..
	        if(idRules[j].search(/opacity( )*:( )*0( )*;/) > -1)
		       found=true; //...the page contains an invisible iframe
			
	     for(var j=0; j<classRules.length; j++) //as above, but for class
	        if(classRules[j].search(/opacity( )*:( )*0( )*;/) > -1)
		       found=true;
			   
      }catch(e){} //if id and/or class are not defined, an exception is trown; to avoid alert messages, we surround this part of code with try/catch
			   
			
   }

   return found;	

}


