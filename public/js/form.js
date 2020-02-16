(function () {
    var myNav = document.getElementById("navbarSupportedContent").getElementsByTagName("li");
    var myURL = document.location.href;

    for (var i = 1; i < myNav.length; i++) {
        var a = myNav[i].getElementsByTagName("a");
        var links = a[0].getAttribute("href");
        if (myURL.indexOf(links) != -1) {
            myNav[i].className = "active";
            myNav[0].className = "";
        }

    }

    let lat = document.getElementById("lat_val").innerHTML;
    let lon = document.getElementById("lon_val").innerHTML;
    let ip = document.getElementById("ip_val").innerHTML;
    var myCenter = new google.maps.LatLng(lat, lon);
    function initialize() {
        var mapProp = {
            center: myCenter,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

        var marker = new google.maps.Marker({
            position: myCenter,
        });
        marker.setMap(map);

        var infowindow = new google.maps.InfoWindow({
            content: "ip: " + ip
        });
        infowindow.open(map, marker);
    }
    var myURL = document.location.href;
    if (myURL.indexOf("/map") != -1) {
        google.maps.event.addDomListener(window, 'load', initialize);
    }
})();