package chordApp;
import java.util.Map;

import de.uniba.wiai.lspi.chord.service.*;
import de.uniba.wiai.lspi.chord.service.impl.*;

public class NodeCreator extends Node{
	
	// Constructor: creates network
	public NodeCreator(String localAddress, int port){
		super(localAddress, port);	
		
		chord = new ChordImpl();
		try{
			chord.create(localURL);
		}
		catch(ServiceException e){
			throw new RuntimeException("Could not create DHT!", e);
		}
		System.out.println("DHT created with bootstrap address: "+ localAddress);
//		Launcher.logger.log("DHT created with bootstrap address: "+ localAddress);
	}
	
	// Check and print network entries every given interval
	public void run(){
		while(true){
			try{
				Thread.sleep(Launcher.secs);
				Map<String, String> md5network = checkAll();
				UtilsIO.print(md5network, "retrieveAll.txt");
			}
			catch(InterruptedException e){
				leave();
			}
		}
	}
	
}