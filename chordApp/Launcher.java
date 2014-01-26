package chordApp;

import java.awt.BorderLayout;
import java.awt.Font;
import java.awt.Insets;
import java.io.File;
import java.lang.reflect.Method;
import java.net.InetAddress;
import java.net.URL;
import java.net.URLClassLoader;
import java.net.UnknownHostException;

import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.JTextArea;

public class Launcher {
	private static Node node;
	
	public static String path = ".";
//	public static Logger logger;
	public static long secs = 300000;
	public static boolean syncAll = true;
	private static String localUrl = null;
	private static int port = 8080;
	private static String bootstrap = null;
	private final static String USAGE = "Usage: chordApp.jar [-path PATH] [-timer TIMER] [-boot BOOT]";
	
	// Method used by creator when launched as jar file
	public static void main(String[] args) {
		// Controllo Parametri: Launcher.main path timer seconds bootURL
		int index=0;
		while(index<args.length){
			// Java switch with String available only from Java SE 7
			if(args[index].equals("-path")){
				try{
					if(!(new File(args[index +1]).isDirectory()))
					{
						System.out.println(args[index +1] + " is not a valid directory");
						System.out.println(USAGE);
						System.exit(1);
					}
					path = args[index+1];}
				catch(Exception e){
						System.out.println("No valid path after keyword -path");
						System.out.println(USAGE);
						System.exit(1);
				}
				
				index+=2;
				System.out.println("Path: " + path);
				continue;
			}
			if(args[index].equals("-timer")){
				try{
					secs = Long.parseLong(args[index+1]);
				}
				catch(NumberFormatException e){
					System.out.println(args[index+1] + " is not a valid number");
					System.out.println(USAGE);
					System.exit(1);
				}
				catch(Exception e){
					System.out.println("No valid number after keyword -timer");
					System.out.println(USAGE);
					System.exit(1);
				}
				index+=2;
				System.out.println("Timer: " + secs + " ms");
				continue;
			}
			if(args[index].equals("-boot")){
				try{
					localUrl = args[index+1];
				}
				catch(Exception e){
					System.out.println("No valid URL after keyword -boot");
					System.out.println(USAGE);
					System.exit(1);
				}
				
				index+=2;
				continue;
			}
			System.out.println(args[index] + " is not a valid parameter");
			System.out.println(USAGE);
			System.exit(1);
		}

		// Se l'indirizzo non è stato specificato, lo calcolo
		if(localUrl == null){
			localUrl = getLocalHost();
		}
		System.out.println("Creator address: " + localUrl);
		// Aggiungo al path la cartella con i file di configurazione
		try{
			addPath(path + "/chrome/content/java/config");
		}
		catch(Exception e){
			e.printStackTrace();
			visualize("Exception: " + e);
		}	
				
		try{	
//			logger = new Logger(path);
			node = new NodeCreator(localUrl, port);
			node.start();
		}
		catch(Exception e){
			e.printStackTrace();
			visualize("Exception: " + e);
		}
	}
	
	// Method used by Firefox when joining
	// Parametro 0: percorso
	// Parametro 1: bootstrap
	// Parametro 2: porta
	// Parametro 3: intervallo in ms
	// Parametro 4: boolean syncAll
	public static void join(String [] args){
		try{
			path = args[0];
			bootstrap = args[1];
			localUrl = getLocalHost();
			port = Integer.parseInt(args[2]);
			secs = Long.parseLong(args[3]);
			syncAll = Boolean.parseBoolean(args[4]);
		}
		catch(Exception e){
			e.printStackTrace();
			visualize("Errors with passing arguments: " + e.toString());
		}
		System.out.println("Join node con boostrap: " + bootstrap);	
		try{
			addPath(path + "/chrome/content/java/config");
//			logger = new Logger(path);
			node = new NodeJoin(localUrl, port, bootstrap);
			node.start();
		}
		catch(Exception e){
			e.printStackTrace();
			visualize("Exception: " + e);
		}
		
	}
	
	// Node leaving the network
	public static void close(){

		try{
			node.interrupt();
		}
		catch(Exception e){
			e.printStackTrace();
			visualize("Exception: " + e);
		}
	}
	
	// Aggiunta dinamica di location al path di esecuzione
	private static void addPath(String s) throws Exception {
		File f = new File(s);
		@SuppressWarnings("deprecation")
		URL u = f.toURL();
		URLClassLoader urlClassLoader = (URLClassLoader) ClassLoader.getSystemClassLoader();
		@SuppressWarnings("rawtypes")
		Class urlClass = URLClassLoader.class;
		@SuppressWarnings("unchecked")
		Method method = urlClass.getDeclaredMethod("addURL", new Class[]{URL.class});
		method.setAccessible(true);
		method.invoke(urlClassLoader, new Object[]{u});
	}
	
	// Visualizzazione messaggi di errore
	public static void visualize(String stringa){
		JPanel panel = new JPanel();
		JFrame frame = new JFrame();
		frame.setTitle("Exception window");
		panel.setLayout(new BorderLayout());
		JTextArea textArea = new JTextArea(stringa);
		textArea.setEditable(false);
		textArea.setAutoscrolls(true);
		textArea.setLineWrap(true);
		textArea.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 14));
		textArea.setMargin(new Insets(5, 8, 5, 5));
		panel.add(textArea);
		frame.add(panel);
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setLocation(400,300);
        frame.setSize(400, 300);
        frame.setVisible(true);
	}
	
	// Recupero indirizzo locale
	public static String getLocalHost(){
		InetAddress address = null;
		try{
			address = InetAddress.getLocalHost(); // Alea_LT/192.168.187.132
		}
		catch(UnknownHostException uhe){
			uhe.printStackTrace();
			visualize("Exception: " + uhe.toString());
		}
		if (! address.isLoopbackAddress()){
			return address.getHostAddress();
		}
		else{
			try{
				java.util.Enumeration<java.net.NetworkInterface> interfaces = java.net.NetworkInterface.getNetworkInterfaces();
				while(interfaces.hasMoreElements()){
					java.util.Enumeration<java.net.InetAddress> addresses = interfaces.nextElement().getInetAddresses();
					while(addresses.hasMoreElements()){
						address = addresses.nextElement();
						if(!address.isLoopbackAddress() && !address.getHostAddress().contains(":")){
							return address.getHostAddress();
						}
					}
				}
			}
			catch(java.net.SocketException e){
				e.printStackTrace();
				visualize(e.toString());
			}
		}
		return address.getHostAddress();
	}		

}
