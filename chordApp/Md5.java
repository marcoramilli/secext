package chordApp;
import java.io.UnsupportedEncodingException; 
import java.security.MessageDigest; 
import java.security.NoSuchAlgorithmException; 

public class Md5 { 
	 
    private static String convertToHex(byte[] data) { 
        StringBuffer buf = new StringBuffer();
        for (int i = 0; i < data.length; i++) { 
            int halfbyte = (data[i] >>> 4) & 0x0F;
            int two_halfs = 0;
            do { 
                if ((0 <= halfbyte) && (halfbyte <= 9)) 
                    buf.append((char) ('0' + halfbyte));
                else 
                    buf.append((char) ('a' + (halfbyte - 10)));
                halfbyte = data[i] & 0x0F;
            } while(two_halfs++ < 1);
        } 
        return buf.toString();
    } 
 
    public static String createMD5(String text) 
    throws NoSuchAlgorithmException, UnsupportedEncodingException  { 
        MessageDigest md;
        md = MessageDigest.getInstance("MD5");
        byte[] md5hash = new byte[32];
        md.update(text.getBytes("iso-8859-1"), 0, text.length());
        md5hash = md.digest();
        return convertToHex(md5hash);
    } 
    
    public static String getLinks(String webstring){
		try{	
			
			java.net.URL url = new java.net.URL(webstring);
			int responseCode = ((java.net.HttpURLConnection) url.openConnection()).getResponseCode();
//			System.out.println(webstring + ": " + responseCode);
			
			if(responseCode == 200){
				java.io.BufferedReader in = new java.io.BufferedReader(new java.io.InputStreamReader(url
						.openStream()));
				String inputLine;
				StringBuffer buffer = new StringBuffer();
				while ((inputLine = in.readLine()) != null) {
					// Process each line.
					buffer.append(inputLine);
				}
				in.close();
				String content = buffer.toString();
				
				java.util.ArrayList<String> links = new java.util.ArrayList<String>();

			  	for(int i=0; i<content.length(); i++){
//			  		System.out.println("parto da indice: " + i);
			  		int loc = content.indexOf("\"http",i);
			  		
			  		if(loc != -1){
//			  			System.out.println("Trovato un http in posizione: " + loc);
			  			i = loc + 1;
			  			int subloc = content.indexOf("\"",i+1);
			  			
			  			String link = content.substring(i,subloc);  	
			  			if(link.indexOf("://") != -1){
			  				// link escape character function
			  				link = link.replace("/[ \n\r\t]/g","");
			  			  	links.add(link);
						}	 				
					} 
			  		else break;
				}
			  	java.util.Collections.sort(links);
//			  	for(int i=0; i<links.size(); i++){
//			  		System.out.println(links.get(i));
//			  	}
				return join(links, ",");
			  }
		}
		catch(Exception e){
			e.printStackTrace();
		}
		return null;
    }
    private static String join(java.util.Collection<String> s, String delimiter) {
        StringBuffer buffer = new StringBuffer();
        java.util.Iterator<String> iter = s.iterator();
        while (iter.hasNext()) {
            buffer.append(iter.next());
            if (iter.hasNext()) {
                buffer.append(delimiter);
            }
        }
        return buffer.toString();
    }

}