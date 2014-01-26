
// Per accedere alle preferenze
//var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch); //preference manager

// Java Loading var
var classLoaderJarpath;
var chordApppath;
var urlArray = []; // Build a regular JavaScript array (LiveConnect will auto-convert to a Java array)
var cl;

// Joining var
var launcherClass;
var stringCls;
var reflect = java.lang.reflect;
var path;

// Java Policy Setup
function policyAdd (loader, urls) {
	try {
		//If have trouble with the policy try changing it to
		//edu.mit.simile.javaFirefoxExtensionUtils.URLSetPolicy
		var str = 'edu.mit.simile.javaFirefoxExtensionUtils.URLSetPolicy';
		var policyClass = java.lang.Class.forName(str, true, loader);
		var policy = policyClass.newInstance();
		policy.setOuterPolicy(java.security.Policy.getPolicy());
		java.security.Policy.setPolicy(policy);
		policy.addPermission(new java.security.AllPermission());
		for (var j=0; j < urls.length; j++) {
			policy.addURL(urls[j]);
		}
	}
	catch(e) {
	       alert(e+'::'+e.lineNumber);
	}
}


// Loading jar libraries
function java_load(){
    this.classLoaderJarpath = extensionUrl + "/chrome/content/java/javaFirefoxExtensionUtils.jar";
    this.chordApppath = extensionUrl + "/chrome/content/java/ChordApp.jar";

    this.urlArray[0] = new java.net.URL(classLoaderJarpath);
    this.urlArray[1] = new java.net.URL(chordApppath);

    this.cl = java.net.URLClassLoader.newInstance(urlArray);

    //Set security policies using the above policyAdd() function
    policyAdd(cl, urlArray);
}

// Join P2P Network
function join(){
	launcherClass = java.lang.Class.forName("chordApp.Launcher", true, cl);
	dump("Launcher class: " + launcherClass + "\n");
	stringCls = java.lang.Class.forName("java.lang.String");
	//classCls = java.lang.Class.forName("java.lang.Class");
	//objectCls = java.lang.Class.forName("java.lang.Object");
	if(majorVersion < 4) {
		path = extensionPath.path.replace(/\\/g,"/");
	}
	else{
		path = extensionPath.replace(/\\/g, "/");
	}
	dump("Path: " + path + "\n");
	try{
		var args = java.lang.reflect.Array.newInstance(stringCls, 5);
		var joinMethod = launcherClass.getMethod("join", [args.getClass()]);
		dump("DNS: " + prefManager.getCharPref("extensions.SecureExt.P2PDnsField") + "\n");
		args[0] = path; // Percorso
		args[1] = prefManager.getCharPref("extensions.SecureExt.P2PDnsField"); // Bootstrap
		args[2] = prefManager.getCharPref("extensions.SecureExt.P2PPort"); // Port
		args[3] = prefManager.getCharPref("extensions.SecureExt.P2PTime"); // Sync Time
		args[4] = prefManager.getBoolPref("extensions.SecureExt.P2PsyncDB");
		dump("Invoking join method\n");
		joinMethod.invoke(null, [args]);
	}
	catch(exception){
		dump("Exception: " + exception + "\n");
	}
}

// Closing P2P network
function closeP2P(){
    var closeMethod = launcherClass.getMethod("close", []);
    dump("Static method: " + closeMethod + "\n");
    try{
	closeMethod.invoke(null, []);
    }
    catch(exception){
        dump("Exception: " + exception + "\n");
    }
}