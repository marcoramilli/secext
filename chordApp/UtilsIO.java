package chordApp;
import java.io.*;
import java.util.*;

public class UtilsIO {
		
	public static List<String> readLines(String filename){
		BufferedReader reader = null;
		try {
			reader = new BufferedReader(new FileReader(Launcher.path + "/" + filename));
		}
		catch(FileNotFoundException e){
			System.out.println("File non trovato");
			Launcher.visualize(e.toString());
		}
		String line;			
		List<String> lines = new ArrayList<String>();
		try{
			while((line=reader.readLine())!= null)
			{
				lines.add(line);
				
			}
			reader.close();
		}
		catch(IOException e){
			Launcher.visualize(e.toString());
		}
		return lines;
	}
	
	public static Map<String, String> parseLines(String filename){
		BufferedReader reader = null;
		try {
			reader = new BufferedReader(new FileReader(Launcher.path + "/" + filename));
		}
		catch(FileNotFoundException e){
			System.out.println("File non trovato");
			System.exit(1);
		}
		String line;
		
		Map<String, String> lines = new TreeMap<String, String>();
		String [] parsed = new String[2];
		try{
			while((line=reader.readLine())!= null)
			{
				parsed = line.split(",");
				lines.put(parsed[0], parsed[1]);
				
			}
			reader.close();
		}
		catch(IOException e){
			System.out.println("Errore in lettura");
			Launcher.visualize(e.toString());
		}	
		return lines;
	}
	
	public static void writeLine(String line, String filename){
		PrintWriter linewriter;
		try {
			Writer writer = new FileWriter(Launcher.path + "/" + filename);
			linewriter = new PrintWriter(writer, true);
			linewriter.println(line);
			linewriter.close();
		}
		catch(IOException e){
			Launcher.visualize(e.toString());
		}
	}

	public static void substitute(String page, String md5, String filename) {
		try
        {
			File file = new File(Launcher.path + "/" + filename);
			BufferedReader reader = new BufferedReader(new FileReader(file));
			String line = "", text = "";
			while((line = reader.readLine()) != null)
            {
				if(line.contains(page)){
					text += page+","+md5+"\r\n";
				}
				else{
					text += line + "\r\n";
				}
            }
			reader.close();
        	      
            FileWriter writer = new FileWriter(filename);
            writer.write(text);
            writer.close();
        }
		catch (IOException e)
        {
			e.printStackTrace();
        }
	}
	
	public static void print(Map<String, String> map, String filename){
		try{
			PrintWriter writer = new PrintWriter(new FileWriter(Launcher.path + "/" + filename), true);
			for (String key: map.keySet()){
				writer.println(key+","+map.get(key));
			}
			writer.close();
		}
		catch(IOException e){
			Launcher.visualize(e.toString());
		}
	}
}
