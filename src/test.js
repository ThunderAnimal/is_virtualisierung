fsPois = require('fs');
fsGeo= require('fs');
var contentPois;
var contentGeo;


fsPois.readFile('pois.json','utf8', function read(err, data) {
    if (err) {
        throw err;
    }
    contentPois = data; 
});

fsGeo.readFile('geoCodingJSON.json','utf8', function read(err, data) {
    if (err) {
        throw err;
    }
    contentGeo = data;
	fileProcessing(contentGeo, contentPois);
});
function fileProcessing(contentGeo, contentPois)
{
	objGeo = JSON.parse(contentGeo);
	objPois = JSON.parse(contentPois);
	getCoords();	
}


function getCoords()
{
	var len = objPois.length;
	for (i=0;i<10; i++)
	{
		var streetPoi=  JSON.stringify(objPois[i].adressen);
			streetPoi=streetPoi.split(':')[0];
			streetPoi= streetPoi.replace('{',"");
			streetPoi= streetPoi.replace(/\s/g,'');
			streetPoi = streetPoi.substr(1, streetPoi.length-2);
			console.log(streetPoi);
			
			for (j in objGeo)
				{
					var street=  JSON.stringify(objGeo[j].Straße);
					street=street.split(':')[0];
					street= street.replace('{',"");
					street= street.replace(/\s/g,'');
					street = street.substr(1, street.length-2);
						if (street==streetPoi)
							{
							console.log("Street: "+ streetPoi+ " lat: "+JSON.stringify(objGeo[j].lat)+ " long: "+ JSON.stringify(objGeo[j].lon ));
							}
	
				}
	}	
};