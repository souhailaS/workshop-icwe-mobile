'use strict';
const resolution = 4;

exports.convertLocationFrequency = function(locations){

    var locationsConverted=[];


    locations.forEach((disp) => {
        disp.forEach((loc) => {
            locationsConverted.push({"latitude": loc.latitude,"longitude": loc.longitude, "frequency": loc.frequency})
        });
    });

    return locationsConverted

}


exports.convertLocations = function(locations,params){
    
    var locationsConverted=[];

    locations.forEach((disp) => {
        disp.forEach((loc) => {
            locationsConverted.push({"latitude": loc.lat,"longitude": loc.lng})
        });
    });

    return locationsConverted;
   
}

exports.buildHeatMap= function(locations){

    //Generate heatmap
    var hmm = new Map(); // HeatMapMatrix[latitude][longitude]

    locations.map(blurLocation).forEach((location) => {
        
        if (hmm.has(location.latitude)) {
            if (hmm.get(location.latitude).has(location.longitude)) {
                hmm.get(location.latitude).set(location.longitude,
                    hmm.get(location.latitude).get(location.longitude) + location.frequency);
            }
            else {
                hmm.get(location.latitude).set(location.longitude, location.frequency);
            }
        }
        else {
            hmm.set(location.latitude, new Map([
                [location.longitude, location.frequency]
            ]));
        }
    });


    var heatmap = [];

    hmm.forEach((latitudeMap, latitude) => {
        latitudeMap.forEach((frequency, longitude) => {
            heatmap.push({
                "latitude": latitude,
                "longitude": longitude,
                "frequency": frequency
            });
        });
    });

    return heatmap


}

exports.buildHeatMapV2= function(locations){

    //Generate heatmap
    var hmm = new Map(); // HeatMapMatrix[latitude][longitude]

    locations.map(blurLocation).forEach((location) => {
        
        if (hmm.has(location.latitude)) {
            if (hmm.get(location.latitude).has(location.longitude)) {
                hmm.get(location.latitude).set(location.longitude,
                    hmm.get(location.latitude).get(location.longitude) + location.frequency);
            }
            /* else {
                hmm.get(location.latitude).set(location.longitude, location.frequency);
            } */
        }
        else {
            hmm.set(location.latitude, new Map([
                [location.longitude, location.frequency]
            ]));
        }
    });


    var heatmap = [];

    hmm.forEach((latitudeMap, latitude) => {
        latitudeMap.forEach((frequency, longitude) => {
            heatmap.push({
                "latitude": latitude,
                "longitude": longitude,
                "frequency": frequency
            });
        });
    });

    return heatmap


}

exports.aggregateLocations = function (locations){
    var locationFreqs = [];


    locations.forEach((element)=>{
        var location = searchLocation(locationFreqs, element);
        if (location != null) {
            location.frequency = location.frequency+element.frequency

        } else {
            locationFreqs.push(element);
        }
    })


    //console.log(locationFreqs)
    return locationFreqs
}



exports.filterHeatMap = function(result,params){

    
    var latitude=params.latitude;
    var longitude=params.longitude;
    var radius=params.radius;

    var results=[];
        
    var origin = {"x": latitude,"y": longitude}


    var north = calculateDerivedPosition(origin, radius, 0);
    var east = calculateDerivedPosition(origin, radius, 90);
    var south = calculateDerivedPosition(origin, radius, 180);
    var west = calculateDerivedPosition(origin, radius, 270);



    result.forEach((location)=>{
        if(location.latitude>south.x && location.latitude<north.x
            && location.longitude>west.y && location.longitude <east.y){
       
        results.push(location);
    }
    });
    
    
    return results;

}


function searchLocation (locations, location){
    var result;

    locations.forEach((element)=>{
       
        if (element.latitude == location.latitude && element.longitude == location.longitude){
            result = element;
        }
    })
  
    if(result != null)
        return result;
    else
        return null;
     
}



 // Converts from degrees to radians.
 Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
  };
   
  // Converts from radians to degrees.
  Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
  };


/*
* Calculates the end-point from a given source at a given range (meters)
* and bearing (degrees). This methods uses simple geometry equations to
* calculate the end-point.
 */

function calculateDerivedPosition(point, range, bearing){
     var EarthRadius = 6371000; // m

    var latA = Math.radians(point.x);
    var lonA = Math.radians(point.y);
    var angularDistance = range / EarthRadius;
    var trueCourse = Math.radians(bearing);

    var lat = Math.asin(
            Math.sin(latA) * Math.cos(angularDistance) +
                    Math.cos(latA) * Math.sin(angularDistance)
                            * Math.cos(trueCourse));

    var dlon = Math.atan2(
            Math.sin(trueCourse) * Math.sin(angularDistance)
                    * Math.cos(latA),
            Math.cos(angularDistance) - Math.sin(latA) * Math.sin(lat));

    var lon = ((lonA + dlon + Math.PI) % (Math.PI * 2)) - Math.PI;

    lat = Math.degrees(lat);
    lon = Math.degrees(lon);

    var newPoint = {"x": lat,"y": lon}
    

     return newPoint;
 }


function blurLocation(location) {
    return {
        latitude: blur(location.latitude),
        longitude: blur(location.longitude),
        frequency: 1
    }
}

function blur(n, digits) {

    if (!digits)
        digits = resolution;

    var roundFunction = Math.floor;

    if (n < 0)
        roundFunction = Math.ceil;


    return roundFunction(n * Math.pow(10, digits)) / Math.pow(10, digits);

}
