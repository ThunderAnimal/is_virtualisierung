var googleApiKey = "AIzaSyDokUDCoq4oDQbX_s_-U7BXr2OwhQQND0I";

var googleMap = {};
var googleOverlappingMarker = {};

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
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&key=' + googleApiKey +'&callback=initializeMap&libraries=places';
    document.body.appendChild(script);

    $(".button-collapse").sideNav();
    $('ul.tabs').tabs({ 'swipeable': false });
    $('ul.tabs').tabs({onShow: function(tab){
        if(tab.selector=="#statistik"){
            initStatisitk();
        }
    }});
    $('.modal').modal();

    //TRIGGER EVENTS
    $('.filterInput').change(function() {
        loadMarkers(addMarkers);
    });

    $(window).resize(function () {
        rezieUI();
    });
    rezieUI();
});
function rezieUI() {
    $('#googleMap').height($( window ).height() - 112 - 64);
    $('#filterContainer').height($( window ).height() - 112);
    $('.tabs-content').height($( window ).height() - 112);
}

function initializeMap() {
    googleMap = new google.maps.Map(document.getElementById('googleMap'), {
        center: {lat: 52.520008, lng: 13.404954},
        scrollwheel: true,
        zoom: 12
    });

    googleOverlappingMarker = new OverlappingMarkerSpiderfier(googleMap, {
        markersWontMove: true,
        markersWontHide: true,
        basicFormatEvents: true,
        keepSpiderfied: true
    });

    var googleSearchBox = new google.maps.places.SearchBox(document.getElementById('search'));

    //using instead of boundce_change, also fired on startup of the map
    google.maps.event.addListener(googleMap, 'idle', function() {
        loadMarkers(addMarkers);
    });

    googleSearchBox.addListener('places_changed', function() {
        var places = googleSearchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        googleMap.fitBounds(bounds);
    });
}

function initStatisitk(){
    $('#datatable').hide();
    $('.chartview').hide();
    $('.chartloader').show();

    loadStatistikData(function(data){
        $('.chartloader').hide();
        $('.chartview').show();
        Highcharts.chart('container1', {
            chart: {
                type: 'column'
            },
            title: {
                text:"<h5 class='header'>Denkmal nach Bezirke</h5>",
                useHTML:true
            },
            xAxis:{
                categories: data.poiBezirke.categories
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Anzahl'
                }
            },
            series: data.poiBezirke.series,
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        this.point.y;
                }
            }
        });
        Highcharts.chart('container2', {
            chart: {
                type: 'column'
            },
            title: {
                text:"<h5 class='header'>Artikel/Reports nach Bezirke</h5>",
                useHTML:true
            },
            xAxis:{
                categories: data.reportsArticleBezirke.categories
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Anzahl'
                }
            },
            series: data.reportsArticleBezirke.series,
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        this.point.y;
                }
            }
        });
        Highcharts.chart('container3', {
            chart: {
                type: 'areaspline'
            },
            title: {
                text:"<h5 class='header'>Artikel/Reports Timeline</h5>",
                useHTML:true
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    month: '%b \'%y',
                    year: '%Y'
                },
                title: {
                    text: 'Datum'
                }
            },
            yAxis: {
                title: {
                    text: 'Anzahl'
                },
                min: 0
            },
            tooltip: {
                headerFormat: '<b>{series.name}</b><br>',
                pointFormat: '{point.x:%e. %b}: {point.y}'
            },

            plotOptions: {
                spline: {
                    marker: {
                        enabled: true
                    }
                }
            },

            series: data.reportsArticleTime.series
        });
    });

}

function loadStatistikData(callback){
    $.get('./rest/statistic',function (data) {
        callback(data);
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
                    $('#modalInfoContent .modal-content').empty().html(getModalInfoContent(data, that.type));
                    $('#modalInfoContent').modal('open');
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

function getModalInfoContent(data, typ){
    var func_getCardContent = function (dataItem) {
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

        var formStr = "";
        if (typ == typEreignis.ensemble ||
            typ == typEreignis.denkmal ||
            typ == typEreignis.bodendenkmal ||
            typ == typEreignis.gesamtanalge){
            console.log(dataItem)
            formStr =
                '<div class="card horizontal">' +
                    '<div class="card-image">' +
                        '<img src="' + img + '">' +
                    '</div>' +
                    '<div class="card-stacked">' +
                        '<div class="card-content">' +
                            '<div class="card-title">' + dataItem.name + '</div>' +
                            '<p class=""">' + typ +'</p>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }
        else{
            var time = new Date(dataItem.zeitpunkt);
            var timeFormatted = time.getDate() + "." + (time.getMonth() + 1) + "." + time.getFullYear() + ' ' + time.getHours() + ':' + time.getMinutes();
            formStr =
                '<div class="card horizontal">' +
                    '<div class="card-image">' +
                        '<img src="' + img + '">' +
                    '</div>' +
                    '<div class="card-stacked">' +
                        '<div class="card-content">' +
                            '<div class="card-title">' + dataItem.titel + '</div>' +
                            '<div class="grey-text valign-wrapper" style="padding-bottom: 10px"><i class="material-icons">today</i>' + timeFormatted +'</div> ' +
                            '<p class="">' + dataItem.shortdescription +'</p>' +
                        '</div>' +
                        '<div class="card-action">' +
                            '<a href="'+ dataItem.url +'" target="_blank">zum Artikel</a>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }
        return formStr;
    };
    if (typ == typEreignis.ensemble ||
        typ == typEreignis.denkmal ||
        typ == typEreignis.bodendenkmal ||
        typ == typEreignis.gesamtanalge) {
        var html = "";
    }else{
        var html  = '<h5 class="header"><i class="material-icons" style="padding-right: 20px">my_location</i>' + data[0].adresse +'</h5>';
    }

    html += '<div class="row"><div class="col s12">';
    for(var i = 0; i < data.length; i++){
        html += func_getCardContent(data[0]);
    }
    html += '</div></div>';
    return html;
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