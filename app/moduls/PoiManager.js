/**
 * Created by InSane on 20.06.2017.
 */
var fs = require('fs');
var path = require('path');

var db = require("./databaseManager");
var dbHelper = require("./databaseHelper");

var contentPois = null;
var contentGeo = null;

exports.initData = function (callback) {
    fs.readFile(path.join(__dirname + '/../../resources/pois.json') ,'utf8', function read(err, data) {
        if (err) {
            throw err;
        }
        contentPois = JSON.parse(data);

        fs.readFile(path.join(__dirname + '/../../resources/geoCodingJSON.json'),'utf8', function read(err, data) {
            if (err) {
                throw err;
            }
            contentGeo = JSON.parse(data);

            if (typeof callback == "function"){
                callback();
            }
        });
    });
};

exports.fillData = function (callback) {
    var that = this;
    //Pruefen ob Daten gefuellt, wenn nicht dann einlesen und function ernuet aufrufen
    if (contentGeo == null || contentPois == null){
        that.initData(function () {
            that.fillData(callback);
        });
        return;
    }

    //Koerdinaten ermitteln und in DB speichern
    getCoords(contentGeo, contentPois);

    if (typeof callback == 'function'){
        callback();
    }
};

exports.existsData = function (callback) {
    db.oneOrNone("SELECT EXISTS(SELECT 1 FROM denkmal)")
        .then(function (data) {
            callback(data.exists);
        }).catch(function(error){dbHelper.onError(error); callback(false)});
};

exports.deleteDataWithputName = function (callback) {
    db.none("DELETE FROM denkmal WHERE name = ''")
        .then(function () {
            if (typeof callback == "function"){
                callback();
            }

        }).catch(dbHelper.onError);
};

function getCoords(objGeo, objPois) {
    var all = new Array();
    var len = objPois.length;
	
	
	
	
    for (i in  objPois)
    {
		var name=  JSON.stringify(objPois[i].name);
		
		name=name.split(':')[0];
        name= name.replace('{',"");
        name= name.replace('}',"");
        name= name.replace('[',"");
        name= name.replace(']',"");
        name= name.replace(/\s/g,'');
        name = name.substr(1, name.length-2);
        var coords = new Array();
		
		if (JSON.stringify(objPois[i].adressen).split(':').length>1)
		{
				var poi = new Array();
				var centroidCoords= calcCentroid(JSON.stringify(objPois[i].adressen));
				//console.log("longi "+test.longitude);
				var id = JSON.stringify(objPois[i].id);
                id = id.substring(1,id.length-1);
                var typ = JSON.stringify(objPois[i].typ);
                typ = typ.substring(1,typ.length-1);
                var lat = centroidCoords.latitude;
                var lon = centroidCoords.longitude;
                poi.push(id),poi.push(typ);poi.push(name);poi.push(lat); poi.push(lon);
                if (poi[0]!=null &&poi[1]!=null&& poi[2]!=null &&poi[3]!=null&& poi[4]!=null && coords.length==0)
                {
                    coords.push(poi);
                    all.push (poi);

                }

                if (coords.length==1)
                {
                    //console.log(coords[0]);
					//console.log("added");
                    addToDb(coords[0]);
                }
			
		}
		else (JSON.stringify(objPois[i].adressen).split(':').length==1)
		{
			        var streetPoi=  JSON.stringify(objPois[i].adressen);
        
        streetPoi=streetPoi.split(':')[0];
        streetPoi= streetPoi.replace('{',"");
        streetPoi= streetPoi.replace(/\s/g,'');
        streetPoi = streetPoi.substr(1, streetPoi.length-2);

      
		
	
        for (j in objGeo)
        {
			
            var street=  JSON.stringify(objGeo[j].street);
            street=street.split(':')[0];
            street= street.replace('{',"");
            street= street.replace(/\s/g,'');
            street = street.substr(1, street.length-2);
            var poi = new Array();
			
			

            if (street==streetPoi &&  coords.length==0)
            {
				
				
				
                var id = JSON.stringify(objPois[i].id);
                id = id.substring(1,id.length-1);
                var typ = JSON.stringify(objPois[i].typ);
                typ = typ.substring(1,typ.length-1);
                var lat = JSON.stringify(objGeo[j].lat);
                lat = lat.substring(1,lat.length-1);
                var lon = JSON.stringify(objGeo[j].lon);
                lon = lon.substring(1,lon.length-1);
                poi.push(id),poi.push(typ);poi.push(name);poi.push(lat); poi.push(lon);
                if (poi[0]!=null &&poi[1]!=null&& poi[2]!=null &&poi[3]!=null&& poi[4]!=null && coords.length==0)
                {
                    coords.push(poi);
                    all.push (poi);

                }

                if (coords.length>0)
                {
                    //console.log(coords[0]);
					//console.log("added");
                    addToDb(coords[0]);
                }
				}




			}
		}

    }
    //console.log("All "+ all.length);
}

function calcCentroid(addresses)
{
		var addr=addresses.split(":");
		var sumLon=0;
		var sumLat=0;
		var centroidCoords= new Array();
		for(k in addr)
		{
			addr[k]=addr[k].replace('{',"");
			addr[k]=addr[k].replace('}',"");
			addr[k]=addr[k].replace('[',"");
			addr[k]=addr[k].replace(']',"");
			addr[k]=addr[k].replace(/,/g , "");
			addr[k]=addr[k].replace(/\s/g,'');;
			addr[k]=addr[k].replace('.',"");
			addr[k]=addr[k].replace(/[0-9]/g, '');
			addr[k]=addr[k].substr(1,addr[k].length-2);
			//console.log(addr[k]);
			for (j in contentGeo)
			{
					
					var street=  JSON.stringify(contentGeo[j].street);
					street=street.split(':')[0];
					street= street.replace('{',"");
					street= street.replace(/\s/g,'');
					street = street.substr(1, street.length-2);
					var poi = new Array();
					if(addr[k]==street)
					{
						var lat = JSON.stringify(contentGeo[j].lat);
						lat = lat.substring(1,lat.length-1);
						var lon = JSON.stringify(contentGeo[j].lon);
						lon = lon.substring(1,lon.length-1);
						//console.log("lon" + lon);
						//console.log("lon" + lat);
						poi.push(lon);poi.push(lat);
						centroidCoords.push(poi);
					}
			
						
			}
		}
		//console.log("Centroid " + centroidCoords.length);
		if (centroidCoords.length>0)
		{
			
			for(c in centroidCoords)
			{
				sumLon= sumLon + parseFloat(centroidCoords[c][0]);
				sumLat= sumLat + parseFloat(centroidCoords[c][1]);
			}
			
		}
		//console.log("lon " + sumLon/centroidCoords.length);
		//console.log("lat " + sumLat/centroidCoords.length);
		return {latitude: sumLat/centroidCoords.length, longitude:sumLon/centroidCoords.length};
}

function addToDb(poiObject) {
    db.tx(function (t) {
        var queryPois = t.none("INSERT INTO denkmal(id, typ, name, lon, lat) values($1, $2, $3, $4, $5)", poiObject);
        // returning a promise that determines a successful transaction:
        return t.batch([queryPois]); // all of the queries are to be resolved;
    }).then(function (data) {
        console.log("Denkmal Datenbank erfolgreich gefuellt");
    }).catch(dbHelper.onError);
}


