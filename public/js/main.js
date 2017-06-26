var googleApiKey = "AIzaSyDokUDCoq4oDQbX_s_-U7BXr2OwhQQND0I";

var googleMap = {};
var googleOverlappingMarker = {};
var googleInfoWindow = {};

var typEreignis = {
    zusammengefasst: "ZUSAMMENFASSUNG",
    polizei: "POLIZEI",
    feuerwehr: "FEUERWEHR",
    zeitungsartikel: "ZEITUNGSARTIKEL",
    ensemble: "Ensemble",
    denkmal: "Denkmal",
    bodendenkmal: "Bodendenkmal",
    gesamtanalge: "Gesamtanlage"


};

$(document).ready(function(){
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&key=' + googleApiKey +'&callback=initializeMap';
    document.body.appendChild(script);

    $(".button-collapse").sideNav();
    $('ul.tabs').tabs({ 'swipeable': false });


    $('#googleMap').height($( window ).height() - 112);
    $('#filterContainer').height($( window ).height() - 112);
    $('.tabs-content').height($( window ).height() - 112);

    //TRIGGER EVENTS
    $('.filterInput').change(function() {
        loadMarkers(addMarkers);
    });

});

function initializeMap() {
    googleMap = new google.maps.Map(document.getElementById('googleMap'), {
        center: {lat: 52.520008, lng: 13.404954},
        scrollwheel: true,
        zoom: 12
    });

    googleInfoWindow = new google.maps.InfoWindow();

    googleOverlappingMarker = new OverlappingMarkerSpiderfier(googleMap, {
        markersWontMove: true,
        markersWontHide: true,
        basicFormatEvents: true,
        keepSpiderfied: true
    });

    //using instead of boundce_change, also fired on startup of the map
    google.maps.event.addListener(googleMap, 'idle', function() {
        loadMarkers(addMarkers);
    });

    google.maps.event.addListener(googleInfoWindow, 'domready', function () {
        // Reference to the DIV that wraps the bottom of infowindow
        var iwOuter = $('.gm-style-iw');

        /* Since this div is in a position prior to .gm-div style-iw.
         * We use jQuery and create a iwBackground variable,
         * and took advantage of the existing reference .gm-style-iw for the previous div with .prev().
         */
        var iwBackground = iwOuter.prev();

        // Removes background shadow DIV
        iwBackground.children(':nth-child(2)').css({'display' : 'none'});

        // Removes white background DIV
        iwBackground.children(':nth-child(4)').css({'display' : 'none'});

        // Changes the desired tail shadow color.
        iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(0,0,0,0.12) 0px 1px 6px', 'z-index' : '1'});

        // Reference to the div that groups the close button elements.
        var iwCloseBtn = iwOuter.next();

        // Apply the desired effect to the close button
        iwCloseBtn.css({opacity: '1', right: '31px', top: '16px'});

    });
}

function loadMarkers(callback) {
    var bounds = googleMap.getBounds();

    //Input Parameters for REST-Api
    var minLat = bounds.f.b;
    var maxLat = bounds.f.f;
    var minLon = bounds.b.b;
    var maxLon = bounds.b.f;

    var filterPolizei = $("#filterPolizei").is(":checked");
    var filterFeuerwehr = $("#filterFeuerwehr").is(":checked");
    var filterArtikel = $("#filterArtikel").is(":checked");
    var filterDenkmal = $("#filterDenkmal").is(":checked");

    var filterLatest = $("#filterLateest").is(":checked");
    console.log("LOAD MARKERS:");
    console.log(minLat);
    console.log(maxLat);
    console.log(minLon);
    console.log(maxLon);

    console.log(filterPolizei);
    console.log(filterFeuerwehr);
    console.log(filterArtikel);
    console.log(filterDenkmal);
    console.log(filterLatest);

    $.get('./rest/markers',
        {
            minLat: minLat,
            maxLat: maxLat,
            minLon: minLon,
            maxLon: maxLon,
            filterPolizei: filterPolizei,
            filterFeuerwehr: filterFeuerwehr,
            filterArtikel: filterArtikel,
            filterDenkmal: filterDenkmal,
            filterLatest: filterLatest
        },function (data) {
            if (!data){
                Materialize.toast('Fehler beim laden der Markers', 3000);
                return;
            }
            callback(data.markers);
        }).fail(function (error) {
            console.log(error);
            Materialize.toast('Fehler beim laden der Markers:' + "<br>" + error.statusText + " (" + error.status + ")", 3000);
    });
}

function addMarkers(markers) {
    googleOverlappingMarker.removeAllMarkers();
    for (var i = 0; i < markers.length; i++) {
        var lat = parseFloat(markers[i].lat).toFixed(7);
        var lon = parseFloat(markers[i].lon).toFixed(7);

        if (markers[i].typ == typEreignis.zusammengefasst) {
            addMarkerZusammenfassung(markers[i], lat, lon);
            continue;
        }

        switch (markers[i].typ) {
            case typEreignis.polizei:
                var icon = '../img/GooglePin-Polizei.png';
                break;
            case typEreignis.feuerwehr:
                var icon = '../img/GooglePin-Feuerwehr.png';
                break;
            case typEreignis.zeitungsartikel:
                var icon = '../img/GooglePin-Zeitungsartikel.png';
                break;
            case typEreignis.ensemble:
            case typEreignis.denkmal:
            case typEreignis.bodendenkmal:
            case typEreignis.gesamtanalge:
                var icon = '../img/GooglePin-PoI.png';
                break;
        }

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lon),
            icon: icon,
            ereignisid: markers[i].id,
            type: markers[i].typ
        });

        google.maps.event.addListener(marker, 'spider_click', function (event) {
            var that = this;
            loadMarkerDetail(that.ereignisid, that.type, function (data) {
                if(data){
                    if (data.length == 1){
                        googleInfoWindow.setContent(getInfoWindowContent(data[0], that.type));
                        googleInfoWindow.open(googleMap, that);
                    }
                }

            });
        });
        googleOverlappingMarker.addMarker(marker);
    }
}

function addMarkerZusammenfassung(markerData, lat, lon) {
    generateLargeIconNumber(markerData.anzahl, function (icon) {
        var marker = new google.maps.Marker({
            position:  new google.maps.LatLng(lat, lon),
            icon: icon,
            type: markerData.typ
        });
        googleOverlappingMarker.addMarker(marker);
    });
}

function loadMarkerDetail(ereignisId, typ, callback) {
    if(typ == typEreignis.ensemble ||
        typ == typEreignis.denkmal ||
        typ == typEreignis.bodendenkmal ||
        typ == typEreignis.gesamtanalge
    ){
        var uri = './rest/denkmal/';
    }else{
        var uri = './rest/ereignis/';
    }

    $.get(uri + ereignisId,function (data) {
        if (!data){
            Materialize.toast('Fehler beim laden des Inhaltes', 3000);
            return;
        }
        if (data.length == 0){
            Materialize.toast('Fehler beim laden des Inhaltes: <br> ID nicht vorhanden.', 3000);
            return;
        }

        callback(data);
    }).fail(function (error) {
        console.log(error);
        Materialize.toast('Fehler beim laden des Inhaltes' + "<br>" + error.statusText + " (" + error.status + ")", 3000);
    });
}

function getInfoWindowContent(data, typ) {
    switch (typ){
        case typEreignis.polizei: var img = '../img/polizei.png';
            break;
        case typEreignis.feuerwehr: var img = '../img/feuerwehr.png';
            break;
        case typEreignis.zeitungsartikel: var img = '../img/zeitungsartikel.png';
            break;
        case typEreignis.ensemble:
        case typEreignis.bodendenkmal:
        case typEreignis.gesamtanalge:
        case typEreignis.denkmal: var img = '../img/poi.png';
            break;
    }
    if (typ == typEreignis.ensemble ||
        typ == typEreignis.denkmal ||
        typ == typEreignis.bodendenkmal ||
        typ == typEreignis.gesamtanalge){
        var formStr =  '<div id="iw-container">' +
            '<div class="card horizontal" style="margin:0;box-shadow: 0">' +
                '<div class="card-image">' +
                    '<img src="' + img + '">' +
                '</div>' +
                '<div class="card-stacked">' +
                    '<div class="card-content">' +
                        '<div class="card-title">' + data.name + '</div>' +
                        '<p>' + typ +'</p>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    }
    else{
        var formStr =  '<div id="iw-container">' +
            '<div class="card horizontal" style="margin:0;box-shadow: 0">' +
                '<div class="card-image">' +
                    '<img src="' + img + '">' +
                '</div>' +
                '<div class="card-stacked">' +
                    '<div class="card-content">' +
                        '<div class="card-title">' + data.titel + '</div>' +
                        '<div class="card-metadata valign-wrapper"><i class="material-icons">my_location</i>' + data.adresse +'<i class="material-icons">today</i>' + data.zeitpunkt +'</div> ' +
                        '<p>' + data.shortdescription +'</p>' +
                    '</div>' +
                '<div class="card-action">' +
                    '<a href="'+ data.url +'" target="_blank">Artikel</a>' +
                '</div>' +
            '</div>' +
            '</div>';
    }
    return formStr;
}

//Alternative Option for Standard Marker
//Source: https://stackoverflow.com/questions/2890670/google-maps-place-number-in-marker
var generateIconCache = {};
function generateLargeIconNumber(number, callback) {
    if (generateIconCache[number] !== undefined) {
        callback(generateIconCache[number]);
    }

    var fontSize = 16,
        imageWidth = imageHeight = 30;

    if (number >= 6000) {
        fontSize = 10;
        imageWidth = imageHeight = 70;
    } else if (number < 1000 && number > 500) {
        fontSize = 14;
        imageWidth = imageHeight = 40;
    } else if (number < 2000 && number >= 1000) {
        fontSize = 14;
        imageWidth = imageHeight = 45;
    }else if (number < 3000 && number >= 2000) {
        fontSize = 14;
        imageWidth = imageHeight = 50;
    }else if (number < 4000 && number >= 3000) {
        fontSize = 14;
        imageWidth = imageHeight = 55;
    }else if (number < 5000 && number >= 4000) {
        fontSize = 14;
        imageWidth = imageHeight = 60;
    }else if (number < 6000 && number >= 5000) {
        fontSize = 14;
        imageWidth = imageHeight = 65;
    }

    var svg = d3.select(document.createElement('div')).append('svg')
        .attr('viewBox', '0 0 54.4 54.4')
        .append('g')

    var circles = svg.append('circle')
        .attr('cx', '27.2')
        .attr('cy', '27.2')
        .attr('r', '21.2')
        .style('fill', '#2063C6');

    var path = svg.append('path')
        .attr('d', 'M27.2,0C12.2,0,0,12.2,0,27.2s12.2,27.2,27.2,27.2s27.2-12.2,27.2-27.2S42.2,0,27.2,0z M6,27.2 C6,15.5,15.5,6,27.2,6s21.2,9.5,21.2,21.2c0,11.7-9.5,21.2-21.2,21.2S6,38.9,6,27.2z')
        .attr('fill', '#FFFFFF');

    var text = svg.append('text')
        .attr('dx', 27)
        .attr('dy', 32)
        .attr('text-anchor', 'middle')
        .attr('style', 'font-size:' + fontSize + 'px; fill: #FFFFFF; font-family: Arial, Verdana; font-weight: bold')
        .text(number);

    var svgNode = svg.node().parentNode.cloneNode(true),
        image = new Image();

    d3.select(svgNode).select('clippath').remove();

    var xmlSource = (new XMLSerializer()).serializeToString(svgNode);

    image.onload = (function(imageWidth, imageHeight) {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            dataURL;

        d3.select(canvas)
            .attr('width', imageWidth)
            .attr('height', imageHeight);

        context.drawImage(image, 0, 0, imageWidth, imageHeight);

        dataURL = canvas.toDataURL();
        generateIconCache[number] = dataURL;

        callback(dataURL);
    }).bind(this, imageWidth, imageHeight);

    image.src = 'data:image/svg+xml;base64,' + btoa(encodeURIComponent(xmlSource).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

	   



	  