package chordApp;
import de.uniba.wiai.lspi.chord.data.URL;
import de.uniba.wiai.lspi.chord.service.*;
import de.uniba.wiai.lspi.chord.service.impl.*;

import java.net.*;

// Constructor: set bootstrap address and join network
public class NodeJoin extends Node {
	private URL bootstrapURL = null;
	public NodeJoin(String localAddress, int port, String bootstrapAddress){
		super(localAddress, port);
		try {
			bootstrapURL = new URL(protocol + "://" + bootstrapAddress + ":" + 8080 + "/");
		} catch (MalformedURLException e){
//			Launcher.logger.log("Malformed URL");
			throw new RuntimeException("Malformed URL", e);
		}
		chord = new ChordImpl();
		try{
			chord.join(localURL, bootstrapURL);
//			Launcher.logger.log("Joined with local URL " + localURL + ", boostrap URL " + bootstrapURL);
		} catch(ServiceException e){
//			Launcher.logger.log("Could not join DHT!");
			throw new RuntimeException("Could not join DHT!", e);
		}
		System.out.println("Peer " + localAddress + " has joined Chord network with bootstrap " + bootstrapAddress + " successfully");
//		Launcher.logger.log("Peer " + localAddress + " has joined Chord network with bootstrap " + bootstrapAddress + " successfully");
	}
	
	// Executes sync/syncAll function at constant intervals
	public void run (){
		try{
			while(true){
				if(Launcher.syncAll == true)
					synchronizeAll();
				else
					synchronize();
				Thread.sleep(Launcher.secs);
			}
		}
		catch(InterruptedException e){
			leave();
//			Launcher.logger.log("Thread interrupted");
//			Launcher.logger.closeLog();
		}
	}
}