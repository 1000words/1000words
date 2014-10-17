var app = app || {};

app.MapExplorerViewModel = (function(){
    var viewModel = (function(){
        var map,
            lat,
            lng,
            watchID,
            flightPath,
            previousCompassAngle;
        
        var init = function(){
            //alert('init');
            initMap();
            navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError, {enableHighAccuracy: true});
            watchID = navigator.compass.watchHeading(compassSuccess, compassError, {frequency: 100});
        };
        
        var show = function(){
            //alert('show');
        };
        
        var initMap = function(){
            var mapProp = {
                center: new google.maps.LatLng(0,0),
                zoom: 2,
                mapTypeId: google.maps.MapTypeId.ROADMAP};
            
            map = new google.maps.Map(document.getElementById("googleMapView"), mapProp);  
        };
        
        var geolocationSuccess = function(position){
            lat = position.coords.latitude;
            lng = position.coords.longitude;
            loadCurrentPosition();
            $.when(getUserCity()).then(function(city){
                registerAppUserOnBackend(city);
            });
        };
        
        var geolocationError = function(error){
            alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
        };
        
        var loadCurrentPosition = function(){
            //var marker = new google.maps.Marker({ position: new google.maps.LatLng(lat, lng)});

            //marker.setMap(map);
            
            var latLng = new google.maps.LatLng(lat, lng);
            map.panTo(latLng);  
        };
        
        var getUserCity = function(){
            var dfd = new $.Deferred();
            
            var latLng = new google.maps.LatLng(lat, lng);
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({'latLng': latLng}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results.length > 0) {
                        // get result with type "locality"
                        var location = _.find(results, function(value) { return value.types[0] === 'locality'});
                        if (location === undefined) {
                            location = results[0];
                        }
                        
                        dfd.resolve(location.formatted_address);
                        //registerAppUserOnBackend(location.formatted_address);
                    } else {
                        alert('No results found');
                    }
                } else {
                    alert('Geocoder failed due to: ' + status);
                }
            });
            
            return dfd.promise();
        };
        
        var registerAppUserOnBackend = function(city){
            var appUserData = app.everlive.data('AppUser');
            
            // check if user is already registerd
            var deviceId = device.uuid;
            var filter = {'DeviceId':deviceId};
            
            var appUser = {
                'City': city,
                'DeviceId': deviceId,
                'Location': {
                    'longitude': lng,
                    'latitude': lat
                }
            };
            
            appUserData.get(filter, function(data){
                if (data.count === 0){
                    // first time register, create
                    appUserData.create(appUser);
                } else {
                    // already registerd, update
                    appUser.Id = data.result[0].Id;
                    appUserData.updateSingle(appUser);
                }
            }, function(error){
                alert('notfound');
            });
        };
        
        var compassSuccess = function(heading){
            if (!previousCompassAngle){
                previousCompassAngle = 0;
            }
            
            if (Math.abs(previousCompassAngle - heading.magneticHeading) > 5){
                previousCompassAngle = heading.magneticHeading;
        
                drawLine(previousCompassAngle);
            }
        };
        
        var compassError = function(compassError){
            alert('Compass error: ' + compassError.code);
        };
        
        var drawLine = function(angle){
            var angleInRad = (360-angle) * Math.PI / 180;
            var px = lng;
            var py = lat + 1000;
            
            // rotate px and py around destination
            var descX = Math.cos(angleInRad)*(px-lat) - Math.sin(angleInRad)*(py-lng)+lat;
            var descY = Math.sin(angleInRad)*(px-lat) + Math.cos(angleInRad)*(py-lng)+lng;
            
            // check if new line is out of bounds
            var inter1 = checkLineIntersection(-170, 80, 170, 80, lng, lat, descX, descY);
            var inter2 = checkLineIntersection(170, 80, 170, -80, lng, lat, descX, descY);
            var inter3 = checkLineIntersection(170, -80, -170, -80, lng, lat, descX, descY);
            var inter4 = checkLineIntersection(-170, -80, -170, 80, lng, lat, descX, descY);
            
            if (inter1.onLine1 === true && inter1.onLine2 === true) {
                descX = inter1.x;
                descY = inter1.y;
            } else if (inter2.onLine1 === true && inter2.onLine2 === true){
                descX = inter2.x;
                descY = inter2.y;
            } else if (inter3.onLine1 === true && inter3.onLine2 === true){
                descX = inter3.x;
                descY = inter3.y;
            } else if (inter4.onLine1 === true && inter4.onLine2 === true){
                descX = inter4.x;
                descY = inter4.y;
            }
            
            var flightPlanCoordinates = [
                new google.maps.LatLng(lat, lng),
                new google.maps.LatLng(descY, descX)
            ];
          
            if (flightPath){
                flightPath.setMap(null);
            }
            
            flightPath = new google.maps.Polyline({
                path: flightPlanCoordinates,
                geodesic: false,
                strokeColor: '#333333',
                strokeOpacity: 0.5,
                strokeWeight: 200
            });
            
            flightPath.setMap(map);
        };
        
        var checkLineIntersection = function(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
            // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
            var denominator, a, b, numerator1, numerator2, result = {
                x: null,
                y: null,
                onLine1: false,
                onLine2: false
            };
            denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
            if (denominator == 0) {
                return result;
            }
            a = line1StartY - line2StartY;
            b = line1StartX - line2StartX;
            numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
            numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
            a = numerator1 / denominator;
            b = numerator2 / denominator;
        
            // if we cast these lines infinitely in both directions, they intersect here:
            result.x = line1StartX + (a * (line1EndX - line1StartX));
            result.y = line1StartY + (a * (line1EndY - line1StartY));
        /*
                // it is worth noting that this should be the same as:
                x = line2StartX + (b * (line2EndX - line2StartX));
                y = line2StartX + (b * (line2EndY - line2StartY));
                */
            // if line1 is a segment and line2 is infinite, they intersect if:
            if (a > 0 && a < 1) {
                result.onLine1 = true;
            }
            // if line2 is a segment and line1 is infinite, they intersect if:
            if (b > 0 && b < 1) {
                result.onLine2 = true;
            }
            // if line1 and line2 are segments, they intersect if both of the above are true
            return result;
        };
        
        return {
            init: init,
            show: show
        }
    })();
    
    return viewModel;
})();