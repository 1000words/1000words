var app = app || {};

app.MapExplorerViewModel = (function(){
    var viewModel = (function(){
        var map,
            lat,
            lng,
            userLocationCity,
            watchID,
            flightPath,
            previousCompassAngle,
            cityMarkers = [],
            currentZoom = 2,
            offsetLimit = 0;
        
        var searchOffset = [7, 7, 5, 3.8, 2.8, 2.4, 1.8, 1.2, 0.7, 0.2, 0.09, 0.02, 0.009, 0.001, 0.0009, 0.00001];
        
        var init = function(){
            initMap();
            navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError, {enableHighAccuracy: true});
        };
        
        var show = function() {
            kendo.bind($('#notificationDiv'), notifications.NotificationsViewModel);
            kendo.bind($('#notificationListContainer'), notifications.NotificationsViewModel);
            
            setTimeout(function() {
                var notification = {
                    payload: {
                        message: {
                            Message: 'You received a photo from Novi Sad!',
                            Sender: '123456',
                            ImageName: '8a5e1050-572e-11e4-bccd-0bfc49e32ef9',
                            CityCoords:{
                                Latitude: 20,
                                Longitude: 20
                            }
                        }
                    }
                };
                var notification1 = {
                    payload: {
                        message: {
                            Message: 'You received a photo request from Sofia!',
                            Sender: '321654',
                            CityCoords:{
                                Latitude: 20,
                                Longitude: 20
                            }
                        }
                    }
                };
                
               notifications.NotificationsViewModel.onNotificationReceived(notification);
               // notifications.NotificationsViewModel.onNotificationReceived(notification1);
            }, 200);
        };
        
        var initMap = function() {
            var mapProp = {
                center: new google.maps.LatLng(0,0),
                zoom: currentZoom,
                mapTypeId: google.maps.MapTypeId.ROADMAP};
            
            map = new google.maps.Map(document.getElementById("googleMapView"), mapProp);  
            
            google.maps.event.addListener(map, 'zoom_changed', function() {
                    currentZoom = map.getZoom();
                    showVisibleCities(360 - previousCompassAngle);
            });
        };
        
        var geolocationSuccess = function(position){
            lat = position.coords.latitude;
            lng = position.coords.longitude;
            loadCurrentPosition();
            
            $.when(getUserCity()).then(function(city){
                userLocationCity = city;
                registerAppUserOnBackend(city);
            });
            
            //navigator.compass.getCurrentHeading(compassFirstSuccess, compassError);
            watchID = navigator.compass.watchHeading(compassSuccess, compassError, {frequency: 100});
        };
        
        var geolocationError = function(error){
            alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
        };
        
        var loadCurrentPosition = function(){
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
            userInfoViewModel.set('location', city);
            
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
                    // already registered, update
                    appUser.Id = data.result[0].Id;
                    appUserData.updateSingle(appUser);
                }
            }, function(error){
                alert('notfound');
            });
        };
        
        var compassError = function(error){
            alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
        };
        
        var compassFirstSuccess = function (heading){
            previousCompassAngle = heading.magneticHeading;           
            drawLine(360 - previousCompassAngle);
            showVisibleCities(360 - previousCompassAngle);
            
            watchID = navigator.compass.watchHeading(compassSuccess, compassError, {frequency: 100});
        };
        
        var compassSuccess = function(heading){
            if (offsetLimit == 0){
                previousCompassAngle = heading.magneticHeading;           
                drawLine(360 - previousCompassAngle);
                showVisibleCities(360 - previousCompassAngle);
                offsetLimit = 5;
            }
            else
            {
                var limit = offsetLimit;
                
                if (currentZoom < 5)
                {
                    limit = 2;
                }
                
                if (Math.abs(previousCompassAngle - heading.magneticHeading) > limit){
                    previousCompassAngle = heading.magneticHeading;
            
                    drawLine(360 - previousCompassAngle);
                    showVisibleCities(360 - previousCompassAngle);
                }
            }
        };
        
        var compassError = function(compassError){
            alert('Compass error: ' + compassError.code);
        };
        
        var drawLine = function(angle){
            var px = lng;
            var py = 90;
            
            var rotatedPoint = rotatePoint({longitude:px, latitude:py},{longitude:lng, latitude:lat}, angle);
            
            var flightPlanCoordinates = [
                new google.maps.LatLng(lat, lng),
                new google.maps.LatLng(rotatedPoint.y, rotatedPoint.x)
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
        
        var rotatePoint = function(point, origion, degree) {
            var x =  origion.longitude + Math.cos(toRadians(degree)) * (point.longitude - origion.longitude) - Math.sin(toRadians(degree))  * (point.latitude - origion.latitude) / Math.abs(Math.cos(toRadians(origion.latitude)));
            var y = origion.latitude + (Math.sin(toRadians(degree)) * (point.longitude - origion.longitude) * Math.abs(Math.cos(toRadians(origion.latitude))) + Math.cos(toRadians(degree))   * (point.latitude - origion.latitude));
           
            return {
                x:x,
                y:y
            };
        };
        
        function toRadians(Value) {
            /** Converts numeric degrees to radians */
            return Value * Math.PI / 180;
        }
        
        var showVisibleCities = function(angle){
            var px = lng;
            var py = lat + searchOffset[currentZoom + 1];
            
            var rotatedPoint = rotatePoint({longitude:px, latitude:py},{longitude:lng, latitude:lat}, angle);
            
            var userLocation = {
                longitude: lng,
                latitude: lat,
                city: userLocationCity
            };  
            
            var directionPoint = {
                longitude: rotatedPoint.x,
                latitude: rotatedPoint.y
            };
            
            $.when(app.Cities.filterCities(userLocation, directionPoint)).then(function(result){
                drawVisibleCities(result);
            });
        };
        
        var drawVisibleCities = function(cities){
            for (i = 0; i < cityMarkers.length; i++){
                cityMarkers[i].label.setMap(null);
                cityMarkers[i].setMap(null);
            }
            
            cityMarkers = [];
            
            kendo.bind($("#sendRequestPopup"), infoWindowViewModel);
            
            
            
            for (i = 0; i < cities.length; i++){
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(cities[i].Location.latitude, cities[i].Location.longitude),
                    map: map,
                    icon: {url: 'styles/images/cityPoint.png', size:new google.maps.Size(20, 20)}
                });
                
                var label = new Label({
                    map: map
                });
                label.bindTo('position', marker);
                //label.bindTo('text', cities[i].City);
                label.set('text', cities[i].City);
                label.bindTo('visible', marker);
                label.bindTo('clickable', marker);
                label.bindTo('zIndex', marker);
                marker.label = label;
                
                cityMarkers.push(marker);
                
                google.maps.event.addListener(marker,'click', (function(marker,cityName){ 
                    return function() {
                        infoWindowViewModel.set('cityName', cityName);
                        infoWindowViewModel.set('showPopup', true);
                    };
                })(marker, cities[i].City));  
            }
        };
        
        var infoWindowViewModel = kendo.observable({
            cityName: 'name',
            showPopup: false,
            sendRequest: function(){
                $.get('http://api.everlive.com/v1/' + settings.Settings.everlive.apiKey + '/functions/pingUsersInCity?city=' + this.cityName + '&senderId=' + device.uuid + '&senderCity=' + userLocationCity + '&cityLatitude=' + lat + '&cityLongitude=' + lng);
                
                this.set('showPopup', false);
            },
            cancel: function(){
                this.set('showPopup', false);
            }
        });
        
        var userInfoViewModel = kendo.observable({
            location: ''
        });
        
        var markerClicked = function(sender, e){
            
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
            show: show,
            whatchId: watchID,
            userInfoViewModel: userInfoViewModel,
            userLocation: {
                longitude: lng,
                latitude: lat,
                city: userLocationCity
            }
        }
    })();
    
    return viewModel;
})();
