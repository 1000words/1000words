var app = app || {};

app.Cities = (function(){
    var getAllCities = function () {
        var dfd = new $.Deferred();

        app.everlive.data('AppUser').get().then(function (data) {
            dfd.resolve(data);
        });

        return dfd;
    }

    var filterCities = function (userLocation, directionPoint) {
        var dfd = new $.Deferred();
        $.when(getAllCities()).then(function (allCities) {
            var x = userLocation.longitude,
                y = userLocation.latitude,
                x1 = directionPoint.longitude - x,
                y1 = directionPoint.latitude - y,
                a = {
                    x: -1 * y1,
                    y: x1
                },
                b = {
                    x: y1,
                    y: -1 * x1
                },
                c = {
                    x: a.x + x1,
                    y: a.y + y1
                },
                d = {
                    x: b.x + x1,
                    y: b.y + y1
                };

            var result = [];
            for (var i = 0; i < allCities.count; i++) {
                var k = {
                    x: Number(allCities.result[i].Location.longitude) - x,
                    y: Number(allCities.result[i].Location.latitude) - y
                }
                dotLeftLineRelation = dotLineRelation(k, a, c),
                dotRightLineRelation = dotLineRelation(k, b, d),
                dotBottomLineRelation = dotLineRelation(k, a, b);

                if (dotLeftLineRelation < 0 && dotRightLineRelation > 0 && dotBottomLineRelation > 0) {
                    result.push(allCities.result[i]);
                    
                }
            }
            
            dfd.resolve(result);
        });
        return dfd;
    }

    var dotLineRelation = function (cityCoords, a, b) {
        return (b.x - a.x) * (cityCoords.y - a.y) - (b.y - a.y) * (cityCoords.x - a.x);
    }

    return {
        getAllCities: getAllCities,
        filterCities: filterCities
    }
})();