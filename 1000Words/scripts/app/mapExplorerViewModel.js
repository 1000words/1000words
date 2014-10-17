var app = app || {};

app.MapExplorerViewModel = (function(){
    var viewModel = (function(){
        var map,
            lat,
            lng;
        
        var init = function(){
            //alert('init');
            initMap();
            navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError, {enableHighAccuracy: true});
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
            $.when(getCurrentCity()).then(function(city){
                registerAppUserOnBackend(city);
            });
        };
        
        var geolocationError = function(error){
            alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
        };
        
        var loadCurrentPosition = function(){
            var marker = new google.maps.Marker({ position: new google.maps.LatLng(lat, lng)});

            marker.setMap(map);
            
            var latLng = new google.maps.LatLng(lat, lng);
            map.panTo(latLng);  
        };
        
        var getUserCity = function(){
            var dfd = new $.Deffered();
            
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
            var appUserData = el.data('AppUser');
            
            // check if user is already registerd
            var deviceId = device.uuid;
            var filter = {'DeviceId':deviceId};
            
            var appUser = {
                'City': city,
                'DeviceId': deviceId,
                'LatLng': {
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
        
        return {
            init: init,
            show: show
        }
    })();
    
    return viewModel;
})();