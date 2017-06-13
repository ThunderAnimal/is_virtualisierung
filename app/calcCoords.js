fsGeo= require('fs');
var contentGeo;



fsGeo.readFile('../src/geoCodingJSON.json','utf8', function read(err, data) {
    if (err) {
        throw err;
    }
    contentGeo = data;
	
	//Examples
	/*
	console.log("Wartenberg");
	getCoords( "Wartenberg");
	console.log("Falkenberg");
	getCoords( "Falkb");
	console.log("Schillingstraße");
	getCoords( "Schillingstraße, 10179");*/
});


function getCoords(address)
{
	
	address = address.replace(/\s/g,'');
	var addr= address.split(',');
	
	objGeo = JSON.parse(contentGeo);
	
	for (i in  objGeo)
	{
		var street=  JSON.stringify(objGeo[i].Straße);
					street=street.split(':')[0];
					street= street.replace('{',"");
					street= street.replace(/\s/g,'');
					street = street.substr(1, street.length-2);
		var zip =	JSON.stringify(objGeo[i].plz);
					
		
		var coords= new Array(); 
		if (address.length>3)
		{
				
			 if (JSON.stringify(objGeo[i].Straße.length==1) && street==addr[0]  && typeof zip != 'undefined' && coords.length==0)
				{
					zip = zip.substr(1, zip.length-2);
					if (zip ==addr[1])
					{
						var lat = JSON.stringify(objGeo[i].lat);
							lat = lat.substring(1,lat.length-1);
							var lon = JSON.stringify(objGeo[i].lon);
							lon = lon.substring(1,lon.length-1);
							coords.push(lat); coords.push(lon);
							var result = {latitude: coords[0], longitude: coords[1]};
							console.log("lat "+result.latitude);
							return result;
					}
				}
				
				if (JSON.stringify(objGeo[i].Straße.length==1) && street==addr[0]  && typeof zip == 'undefined' && coords.length==0)
				{
					
							var lat = JSON.stringify(objGeo[i].lat);
							lat = lat.substring(1,lat.length-1);
							var lon = JSON.stringify(objGeo[i].lon);
							lon = lon.substring(1,lon.length-1);
							
							coords.push(lat); coords.push(lon);
							var result = {latitude: coords[0], longitude: coords[1]};
							console.log("lat "+result.latitude);
							return result;
					
				}
				 if (objGeo[i].Straße.length>1 && coords.length==0)
				 {
					 for (j=0; j<objGeo[i].Straße.length;j++)
					 {
						var str =JSON.stringify(objGeo[i].Straße[j]);
						str= str.substr(1, str.length-2);
						 if (addr[0]==str)
						 {
							var lat = JSON.stringify(objGeo[i].lat);
							lat = lat.substring(1,lat.length-1);
							var lon = JSON.stringify(objGeo[i].lon);
							lon = lon.substring(1,lon.length-1);
							coords.push(lat); coords.push(lon);
							var result = {latitude: coords[0], longitude: coords[1]};
							console.log("lat "+result.latitude);
							return result;
						 }
					 }
				 }
				
		}
		
	}
	

	
};

