package chordApp;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Writer;


public class Logger {
	private PrintWriter logwriter = null;
	public Logger(String path){
		try {
			Writer writer = new FileWriter(path + "/P2Plog.txt", true);
			logwriter = new PrintWriter(writer, true);
		}
		catch(IOException e){
			System.out.println("Non sono riuscito a creare il file");
			Launcher.visualize(e.toString());
		}
		catch(Exception e){
			Launcher.visualize(e.toString());
		}
	}	
	public void log(String text){
		try{
			logwriter.println(text);
		}
		catch(Exception e){
			System.out.println("Errore in scrittura");
			Launcher.visualize(e.toString());
		}
		
	}
	public void closeLog(){
		try{
			logwriter.close();
		}
		catch(Exception e)
		{
			System.out.println("Errore in chiusura");
			Launcher.visualize(e.toString());
		}
	}

}
