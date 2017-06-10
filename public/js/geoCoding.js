//var text = '{"geo":[' +
//'{"lat": "52.48027","lon": "13.31845","plz": "10713","Straße": "AachenerStrasse" },{"lat": "52.48027","lon": "13.31845","Straße": "BachenerStrasse" },{"lat": "55.48027","lon": "13.31845","plz": "12345","Straße": "AachenerStrasse" },{"lat": "62.48027","lon": "11.31845","plz": "10713","Straße": "BonnerStraße" }]}';

obj = JSON.parse(text);
function getCoordsByStreet(street)

{
	for ( i in obj.geo){
	if (obj.geo[i].Straße==street)
 	{
	alert(obj.geo[i].lat + " " + obj.geo[i].lon);
	}

}
};


function getCoordsByStreetZip(address)
{
	for ( i in obj.geo){
	address= address.replace(/\s/g,'');
	alert(address);
	address= address.split(",")
	alert(address[0]);
	alert(address[1]);
	if (obj.geo[i].Straße==address[0] && obj.geo[i].plz==address[1] )
 	{
	alert(obj.geo[i].lat + " " + obj.geo[i].lon);
	}
}
};

function getCoords(address)
{
	
	address= address.replace(/\s/g,'');
	var addr= address.split(",")
	alert(addr[0]);
	alert(obj.geo[2].Straße);
	for ( i in obj.geo){
		if (addr.length>1)
		{
		if (obj.geo[i].Straße==addr[0] && obj.geo[i].plz==addr[1] )
			{
				alert(obj.geo[i].lat + " " + obj.geo[i].lon);
			}
			
		}
		if (addr.length==1)
		{
		if(obj.geo[i].Straße==addr[0])
		{
			alert(obj.geo[i].lat + " " + obj.geo[i].lon);
		}
		
		}
	}
};


//getCoords("BachenerStrasse");
//getCoordsByStreet("AachenerStraße");
//getCoordsByStreetZip("Aachener Strasse, 10713");
