var fs = require('fs');
var path = require('path');
var RestApi = require("./restApiManager");

var contentGeo = null;

exports.initData = function (callback) {
    if (contentGeo != null){
        callback();
        return;
    }

    fs.readFile(path.join(__dirname + '/../../resources/geoCodingJSON.json'),'utf8', function read(err, data) {
        if (err) {
            throw err;
        }
        contentGeo = JSON.parse(data);

        if (typeof callback == "function"){
            callback();
        }
    });
};

exports.getCoords = function (adresse, callback) {
    var that = this;

    var arryAdrss = adresse.split(',', 2);
    if (arryAdrss[1]){
        adresse = arryAdrss[0] + ',' + arryAdrss[1];
    }else{
        adresse = arryAdrss[0];
    }

    var coords = getCoordsFromJson(arryAdrss[0], arryAdrss[1]);
    if(coords){
        callback(coords);
        return
    }

    //Sicherstellen das Objekt in Berlin liegt
    var adresseBerlin = adresse + " Berlin";
    getCoordsFromMapsApi(adresseBerlin, function (coords) {
        if (coords){
            callback(coords);
            return;
        }
        getCoordsFromMapsApi(adresse, function (coords) {
            if (coords){
                callback(coords);
            }else{
                callback(undefined);
            }
        })
    });
};

/**
 * Valide Input: Name (OPTINAL PLZ)
 *      "Schillingstraße"
 *      "Schillingstraße, 10179"
 * Examples
 *   console.log("Wartenberg");
     getCoords( "Wartenberg");
     console.log("Falkenberg");
     getCoords( "Falkb");
     console.log("Schillingstraße");
     getCoords( "Schillingstraße, 10179");
 * @param address
 * @returns {{latitude: *, longitude: *}}
 */
/**
 * @param street
 * @param plz (Optional)
 * @returns {{lat: number, lon: number}}
 */
var getCoordsFromJson = function (street, plz) {
    if (contentGeo == null){
        console.error("GeoDaten sind nicht geladen!!!");
        return undefined;
    }
    street = street.replace(/\s/g,'');
    for(var i = 0; i < contentGeo.length; i++){
        if(street && plz){
            if (Array.isArray(contentGeo[i].street)){
                for (var j = 0; j<contentGeo[i].street.length; j++){
                    if (plz == contentGeo[i].plz && street.toLowerCase() == contentGeo[i].street[j].toLowerCase()){
                        return {lat: contentGeo[i].lat, lon: contentGeo[i].lon};
                    }
                }
            }else{
                if (plz == contentGeo[i].plz && street.toLowerCase() == contentGeo[i].street.toLowerCase()){
                    return {lat: contentGeo[i].lat, lon: contentGeo[i].lon};
                }
            }

        }else {
            if (Array.isArray(contentGeo[i].street)) {
                for (var j = 0; j < contentGeo[i].street.length; j++) {
                    if (street.toLowerCase() == contentGeo[i].street[j].toLowerCase()) {
                        return {lat: contentGeo[i].lat, lon: contentGeo[i].lon};
                    }
                }
            }
            else {
                if (street.toLowerCase() == contentGeo[i].street.toLowerCase()){
                    return {lat: contentGeo[i].lat, lon: contentGeo[i].lon};
                }
            }
        }
    }

};

/**
 *
 * @param adresse
 * @param callback
 */
var getCoordsFromMapsApi = function (adresse, callback) {
    RestApi.getGeoCoords(adresse, function (data) {
        if(!data){
            callback(undefined);
            return
        }

        if (data.length == 0){
            callback(undefined);
            return;
        }
        if (data[0].address.state != "Berlin") {
            callback(undefined);
            return;
        }

        callback({lat: data[0].lat, lon: data[0].lon});
    })
};