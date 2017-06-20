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
    fs.readFile(path.join(__dirname + '/../../src/pois.json') ,'utf8', function read(err, data) {
        if (err) {
            throw err;
        }
        contentPois = data;

        fs.readFile(path.join(__dirname + '/../../src/geoCodingJSON.json'),'utf8', function read(err, data) {
            if (err) {
                throw err;
            }
            contentGeo = data;

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

    var objGeo = JSON.parse(contentGeo);
    var objPois = JSON.parse(contentPois);

    //Koerdinaten ermitteln und in DB speichern
    getCoords(objGeo, objPois);

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

function getCoords(objGeo, objPois) {
    var all = new Array();
    var len = objPois.length;
    for (i in  objPois)
    {
        var streetPoi=  JSON.stringify(objPois[i].adressen);
        var name=  JSON.stringify(objPois[i].name);
        streetPoi=streetPoi.split(':')[0];
        streetPoi= streetPoi.replace('{',"");
        streetPoi= streetPoi.replace(/\s/g,'');
        streetPoi = streetPoi.substr(1, streetPoi.length-2);

        name=name.split(':')[0];
        name= name.replace('{',"");
        name= name.replace('}',"");
        name= name.replace('[',"");
        name= name.replace(']',"");
        name= name.replace(/\s/g,'');
        name = name.substr(1, name.length-2);
        //console.log(name);
        var coords = new Array();
        for (j in objGeo)
        {
            var street=  JSON.stringify(objGeo[j].Straße);
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
                    addToDb(coords[0]);
                }
            }




        }
    }
    console.log("All "+ all.length);
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
