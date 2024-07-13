var geolocation;
var latitude;
var longitude;
var map;
var dictListDisco = [];

let data = {
    lat: 0,
    lon: 0,
}


fetch('../jsonFiles/discoList.json')
    .then(response => response.json())
        .then(data => {
            data.forEach(locals => {
                dictListDisco.push([locals.title, locals.gps_coordinates.latitude, locals.gps_coordinates.longitude, locals.website, locals.thumbnail, locals.address, locals.rating]);
            });
        })
        .catch(error => {
            console.error('Error Verified:', error);
        });   





async function initMap() {
    console.log("inizializzo la mappa");
    if (geoLoc = navigator.geolocation) {
        watchID = await geoLoc.watchPosition(showLocation);
    } else {
        alert("Sorry, browser does not support geolocation!");
    }
} 


function showLocation(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

    $.ajax({
        url: '/map-data',
        type: 'GET',
        data: `lt=${latitude}&lg=${longitude}`,
        success: function(data) {
        }
      });
      var map_options = {
        zoom: 14,
        center: new google.maps.LatLng(latitude, longitude),
        mapId: "5dc32fb313452c7e",
    }
    map = new google.maps.Map(document.getElementById('map'), map_options);

    // fetchingLocal();

    new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map,
        title: "Sei qui!",
        icon: '/iconpng/rsz_person_marker.png',
    });

    var markers = [];
    // var marker;   

    for (var i = 0; i < dictListDisco.length; i++){
        disco = dictListDisco[i];
        if (getDistanceFromLatLonInKm(latitude,longitude,disco[1],disco[2]) > 7) continue;
        var marker = new google.maps.Marker({
            position: {lat: disco[1], lng: disco[2]},
            url: disco[3],
            title: disco[0],
            // map: map,
            icon: '/iconpng/disco_marker2.png',
        });

        // Creazione infoWindow
        var iw = new google.maps.InfoWindow({
            content: '<div style="text-align: center;">' +
                    '<h3>' + disco[0] + '</h3><br/>' +
                    (disco[4] ? '<div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;"><img src="' + disco[4] +  '"style="width: 200px; height: 200px;"></div>' : '') +
                    '<p style="text-align: center;">' + disco[5] + '</p><br/>' +
                    (disco[6] ? '<p style="text-align: center;">Rating: '+ disco[6] + '</p></div>' : '</div>'),
            maxWidth: 400
        });

        attachInfoWindow(marker, iw);
        markers.push(marker);
    }
    
    markers.forEach(function(marker) {
        marker.addListener('click', function() {
            if (typeof marker.url != "undefined")
                    {window.open(marker.url);}
        });
    });
    var markerCluster = new MarkerClusterer(map, markers,
        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
}


function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);    
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function attachInfoWindow(marker, iw) {
    marker.addListener('mouseover', function() {
        iw.open(map, marker);
    });
    marker.addListener('mouseout', function() {
        iw.close();
    });
}