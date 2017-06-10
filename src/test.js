fsPois = require('fs');
fsGeo= require('fs');
var contentPois;
var contentGeo;
var objPois;
var objGeo;

fsPois.readFile('pois.json','utf8', function read(err, data) {
    if (err) {
        throw err;
    }
    contentPois = data;
    processFilePois(); 
});

fsGeo.readFile('geoCodingJSON.json','utf8', function read(err, data) {
    if (err) {
        throw err;
    }
    contentGeo = data;
	//console.log(contentGeo);
    processFileGeo(); 
	
	
});


function processFileGeo()
{
	//objGeo = JSON.parse(contentGeo);
	//console.log(objGeo.geo[2].Straße);
	//calcCoords();
	/*for (i in objGeo)
	{
		var street=  JSON.stringify(objGeo[i].Straße);
			street=street.split(':')[0];
			street= street.replace('{',"");
			street= street.replace(/\s/g,'');
			street = street.substr(1, street.length-2);
			console.log(street);
			/*street= street.replace('[','');
			street= street.replace(']','');
			street= street.split(",")	*/
			//getCoords(street);
			//console.log(street);
			
	//}
	getCoords();
};

function processFilePois() {
	objPois = JSON.parse(contentPois);
	var test=  JSON.stringify(objPois[0].adressen);
	test=test.split(':')[0];
	test= test.replace('{',"");
   // console.log(test);
   for (i in objPois)
	{
		var street=  JSON.stringify(objPois[i].adressen);
			street=street.split(':')[0];
			street= street.replace('{',"");
			street= street.replace(/\s/g,'');
			street = street.substr(1, street.length-2);
			/*street= street.replace('[','');
			street= street.replace(']','');
			street= street.split(",")	*/
			//getCoords(street);
			
			
	}
	
};


function getCoords()
{
	objGeo = JSON.parse(contentGeo);
	
	for (i in objPois)
	{
		var streetPoi=  JSON.stringify(objPois[i].adressen);
			streetPoi=streetPoi.split(':')[0];
			streetPoi= streetPoi.replace('{',"");
			streetPoi= streetPoi.replace(/\s/g,'');
			streetPoi = streetPoi.substr(1, streetPoi.length-2);
			
			
			for (j in objGeo)
				{
					var street=  JSON.stringify(objGeo[j].Straße);
					street=street.split(':')[0];
					street= street.replace('{',"");
					street= street.replace(/\s/g,'');
					street = street.substr(1, street.length-2);
						if (street.includes(streetPoi))
							{
							console.log("Street: "+ streetPoi+ " lat: "+JSON.stringify(objGeo[j].lat)+ " long: "+ JSON.stringify(objGeo[j].lon ));
							}
	
				}
	}
	
	//console.log(test);
	
	
	
	
	/*for (i in objPois)
	{
		var street=  JSON.stringify(objPois[i].adressen);
			street=street.split(':')[0];
			street= street.replace('{',"");
			street= street.replace(/\s/g,'');
			street = street.substr(1, street.length-2);
			//console.log(street);
		for (j in objGeo)
		{
			var streetGeo=  JSON.stringify(objGeo[j].Straße);
			streetGeo= streetGeo.replace(/\s/g,'');
			streetGeo = streetGeo.substr(1, street.length-2);
			//console.log(streetGeo);
			if (street.localeCompare(streetGeo))
			{
				//console.log("Straße " + street + " lon"+JSON.stringify(objGeo[j].lon)+ " lat "+JSON.stringify(objGeo[j].lat) );
			}
		}
	}*/
	/*
	for ( i in objGeo.geo){
		if (addr.length>1)
		{
		for(j in objGeo.geo[i].Straße){
		if (objGeo.geo[i].Straße[j]==addr[0] && objGeo.geo[i].plz==addr[1] )
			{
				console.log(objGeo.geo[i].lat + " " + objGeo.geo[i].lon);
			}
			
		}
		}
		if (addr.length==1)
		{
		for (j in objGeo.geo[i].Straße){
		
		if(objGeo.geo[i].Straße[j]==addr[0])
		{
			console.log(objGeo.geo[i].lat + " " + objGeo.geo[i].lon);
		}
		
		}
		}
	}
	*/
};