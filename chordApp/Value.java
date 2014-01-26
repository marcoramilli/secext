package chordApp;

import java.io.Serializable;

public class Value implements Serializable{
	private static final long serialVersionUID = 1L;
	
	private String address;
	private String hash;
	
	public Value(String address, String hash){
		this.address = address;
		this.hash = hash;
	}
	public String getAddress(){
		return address;
	}
	public String getHash(){
		return hash;
	}
	public String toString(){
		return ";" + address + ";" + hash + ";";
	}

	public boolean equals(Object o){
		if (o instanceof Value){
			return ((((Value) o).address.equals(this.address)) && (((Value) o).hash.equals(this.hash)));
		}
		return false;
	}
	public byte[] getBytes() {
		return this.address.getBytes();
	}
	public int hashCode(){
		return this.address.hashCode();
	}
}
