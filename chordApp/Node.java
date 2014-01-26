package chordApp;
import de.uniba.wiai.lspi.chord.data.URL;
import de.uniba.wiai.lspi.chord.service.*;
import de.uniba.wiai.lspi.chord.service.impl.*;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Serializable;
import java.net.*;
import java.util.Map;
import java.util.Set;
import java.util.List;
import java.util.StringTokenizer;
import java.util.TreeMap;

public abstract class Node extends Thread{
	public final static String listfile = "protectedlist.txt";
	public final static String md5file = "md5dB.txt";
	protected String protocol = URL.KNOWN_PROTOCOLS.get(URL.SOCKET_PROTOCOL); // ocsocket
	protected URL localURL = null;
	protected Chord chord;
	
	// Constructor: load properties, build localURL String
	protected Node(String localAddress, int port){
		try{
			PropertiesLoader.loadPropertyFile();
		}
		catch(IllegalStateException ise){}
		catch(Exception e){
//			Launcher.logger.log("Exception loading properties: " + e);
			Launcher.visualize("Exception loading properties: " + e);
		}
		try {
			localURL = new URL(protocol + "://" + localAddress + ":" + port + "/");
		} catch (MalformedURLException e){
			throw new RuntimeException("Malformed URL", e);
		}
	}

	// Basic functions
	private void insert(String key, String data){
		StringKey myKey = new StringKey(key);
		Value value = new Value(key, data);
		try{
			chord.insert(myKey, value);
		} catch(ServiceException e){
			throw new RuntimeException("Could not insert data");
		}	
		catch(Exception e){
			System.out.println("Eccezione: " + e);
			e.printStackTrace();
		}
	}
	private Set<Serializable> retrieve(String key) {
		StringKey stringkey = new StringKey(key);
		try{
			return chord.retrieve(stringkey);
		} catch(ServiceException e){
//			Launcher.logger.log("Could not retrieve data for key " + key + " : " + e);
			throw new RuntimeException("Could not retrieve data for key " + key + " : " + e);
		}
	}
	private void remove (String key, String data){
		StringKey myKey = new StringKey(key);
		Value value = new Value(key, data);
		try{
			chord.remove(myKey, value);
		} catch(ServiceException e){
			throw new RuntimeException("Could not remove data");
		}	
		catch(Exception e){
			System.out.println("Eccezione: " + e);
			e.printStackTrace();
		}
	} 
	private Map<String, String> retrieveAll(){
		Map<String, String> md5network = new TreeMap<String, String>();
		StringTokenizer tokenizer = new StringTokenizer(((ChordImpl)chord).printEntries(), "\n");
		while(tokenizer.hasMoreTokens()){
			String [] lines = tokenizer.nextToken().split(";");
			if(lines.length > 1){
				md5network.put(lines[1], lines[2]);
			}
		}
		System.out.println(((ChordImpl) chord).printEntries());
		System.out.println(((ChordImpl) chord).printSuccessorList());
		return md5network;
	}	
	
	// Synchronize functions
	protected void synchronize(){
//		Launcher.logger.log("Beginning synchronize");
		String link, md5;
		List<String> listpages = UtilsIO.readLines(listfile);
		Map<String, String> md5pages = UtilsIO.parseLines(md5file);
		
		// Cerco online ogni string della mia protectedlist.txt
		for(int i=0; i< listpages.size(); i++){
			link = listpages.get(i);
			Set<Serializable> recovered = retrieve(link);
			// Key already online
			if(recovered.size() >0){
				md5 = ((Value)recovered.toArray()[0]).getHash();
				System.out.println("Trovato link " + link + " con key " + md5);
//				Launcher.logger.log("Trovato link " + link + " con key " + md5);
				// Se la trovo online cosa faccio? La inserisco nel mio database?
				// Ipotesi: inserimento becero nel database
				UtilsIO.substitute(link, md5, md5file);
			}
			// Key not online, if I have it, I have to insert it
			else{
				md5 = md5pages.get(listpages.get(i));
				if (md5 != null){
					System.out.println("Inserisco: " + listpages.get(i) + "\t"  + md5);
//					Launcher.logger.log("Inserisco: " + listpages.get(i) + "\t" + md5);
					insert(listpages.get(i), md5);
				}
			}
		}
		
		
	}
	protected void synchronizeAll(){
//		Launcher.logger.log("Beginning synchronize all");
		Map<String, String> md5pages = UtilsIO.parseLines(md5file);
		Map<String, String> md5network = retrieveAll();
		// Reperisco tutte le chiavi online
		for(String key: md5pages.keySet())
		{
			if(!md5network.containsKey(key)){
				// Inserisco online le eventuali mancanti
				insert(key, md5pages.get(key));
				// Le aggiungo al mio database
				md5network.put(key, md5pages.get(key));
			}
		}
						
		// Aggiorno il mio database
		UtilsIO.print(md5network, md5file);
			
	}

	// Check function for bootstrap node
	protected Map<String, String> checkAll(){
		System.out.println(((ChordImpl) chord).printEntries());
		System.out.println(((ChordImpl) chord).printSuccessorList());
		Map<String, String> md5network = new TreeMap<String, String>();
		StringTokenizer tokenizer = new StringTokenizer(((ChordImpl)chord).printEntries(), "\n");
//		Launcher.logger.log("Reading entries");
		while(tokenizer.hasMoreTokens()){
			String [] lines = tokenizer.nextToken().split(";");
			if(lines.length > 1){
				md5network.put(lines[1], lines[2]);
//				Launcher.logger.log("Found entry: " + lines[1] + "\t" +  lines[2]);
				try{
					String links = Md5.getLinks(lines[1]);
					if (links != null){
						System.out.println("Inserting: " + lines[1] +  "," + Md5.createMD5(links));
						try{
							remove(lines[1], lines[2]);
							insert(lines[1], Md5.createMD5(links));
						}
						catch(Exception e){
							System.out.println("Exception while substituting: " + lines[1]);
							e.printStackTrace();
						}
					}
					else{
						System.out.println("Not possible calculating hash md5 for " + lines[1]);
					}
				}
				catch(Exception e){
					e.printStackTrace();
					Launcher.visualize("Exception: "+ e);
				}
			}
		}
		
		return md5network;
	}
	
	// Leaving function
	protected void leave(){
		try{
			chord.leave();
//			Launcher.logger.log("Node leaving");
		} catch(ServiceException e){
			throw new RuntimeException("Error while leaving DHT", e);
		}
		catch(Exception e){
//			Launcher.logger.log("Exception: " + e + " while leaving");
		}
	}

	// Alternative synchronize function with smaller number of file accesses 
	protected void synchronize2(){
		BufferedReader listreader = null;
		try {
			listreader = new BufferedReader(new FileReader(Launcher.path + "/" + listfile));
		}
		catch(FileNotFoundException e){
			System.out.println("File non trovato");
			Launcher.visualize(e.toString());
		}
		String line;
		String text="";
		try{
			while((line=listreader.readLine())!= null)
			{
				Set<Serializable> recovered = retrieve(line);
				String md5;
				if(recovered.size() >0){
					md5 = (String)recovered.toArray()[0];
					text += line+","+md5+"\r\n";
					System.out.println("Trovata key: " + md5);
					// Se la trovo online cosa faccio? La inserisco nel mio database?
					// Ipotesi: inserimento becero nel database
					UtilsIO.substitute(line, md5, md5file);
				}
				// Key not online, if I have it, I have to insert it
				else{
					BufferedReader md5reader = null;
					try {
						md5reader = new BufferedReader(new FileReader(Launcher.path + "/" + md5file));
					}
					catch(FileNotFoundException e){
						System.out.println("File non trovato");
						Launcher.visualize(e.toString());
					}
					String mdline;
					String [] mdparsed = new String[2];
					while((mdline=md5reader.readLine()) != null ){
						mdparsed = mdline.split(",");
						if(mdparsed[0].equals(line)){
							System.out.println("Inserisco: " + mdparsed[1]);
							insert(line, mdparsed[1]);
							text += line+","+mdparsed[1]+"\r\n";
							break;
						}
					}
					md5reader.close();
				}
			}
			listreader.close();
			PrintWriter writer = new PrintWriter(Launcher.path + "/" + md5file);
			writer.write(text);
			writer.close();
		}
		catch(IOException e){
			Launcher.visualize(e.toString());
		}
	}
	
}