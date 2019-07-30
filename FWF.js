// Point locations for each forest
var Angeles = '34.31792312,-117.985888';
var Cleveland = '32.74951243,-116.6006926';
var Eldorado = '38.75,-120.45';
var Inyo = '37.81358313,-118.9920405'; 
var Klamath = '41.59725831,-123.1422959';
var LTBMU = '39,-120';
var Lassen = '40.20720482,-120.9076208';
var LosPadres = '34.68357395,-119.2349426';
var Mendocino = '39.62696688,-122.847161';
var Modoc = '41.58677037,-121.0320475';
var Plumas = '40.01518142,-120.4038997';
var SanBernardino = '34.21907989,-117.0753418';
var Sequoia = '35.96815342,-118.4654042';
var ShastaTrinity = '40.92240677,-122.6497201';
var Sierra = '37.25,-119.35';
var SixRivers = '41.72475121,-123.8452398';
var Stanislaus = '38.16837144,-120.0175031';
var Tahoe = '39.39345859,-120.5373965';

// Dispatch areas cover multiple zones
var CaminoECC = {CAZ272:'39,-120', CAZ269:'38.75,-120.45', CAZ267:'38.72,-120.8', CAZ217:'38.66,-121.2'}; 

// API URLs
var point_url = 'https://api.weather.gov/points/';
var office_url = 'https://api.weather.gov/products/types/FWF/locations/';
var alert_url = 'https://api.weather.gov/alerts/active/zone/';

// Function to retrieve the forecast data
function RetrieveFWF(latLong, div) {
    let office, fire_zone
    $.getJSON(point_url + latLong
    ).then(function(data) {
        office = data.properties.cwa;
        var fz = data.properties.fireWeatherZone;
        fire_zone = fz.slice(fz.lastIndexOf('CAZ'))
        return $.getJSON(office_url + office);
    }).then(function(data) {
        forecast_url = data["@graph"][0]["@id"];
        console.log(office, fire_zone);
        return $.get(forecast_url)
    }).then(function(data) {
        var NWSText = data.productText;
        // find the start of fire zone 
        var beginText = NWSText.lastIndexOf('\n', NWSText.indexOf(fire_zone.slice(3))) + 1;
        var endText = NWSText.indexOf("$$", beginText)
        // I've seen 'Extended', 'EXTENDED', and 'FORECAST DAYS 3 THROUGH 7...'
        var extendedStart = NWSText.toLowerCase().indexOf("extended", beginText)
        // Sometimes there is no extended at the very end
        if (extendedStart > 0 && endText < extendedStart) {
            var extendedEnd = NWSText.indexOf("$$", extendedStart)
            var FWF = NWSText.slice(beginText, endText) + NWSText.slice(extendedStart, extendedEnd);
        } else {
            var extendedEnd = NWSText.indexOf("$$", beginText);
            var FWF = NWSText.slice(beginText, endText);
        }
        // Push to page
        $('#' + div).html(function(index, currentContent) {
            return currentContent + FWF.replace(/\n/g, "<br />")
        });
        return $.get(alert_url + fire_zone)
    }).done(function(alertData) {
        var weatherHeader = ''
        if (alertData.features.length > 0) {
            for (var i=0; i < alertData.features.length; i++) {
                weatherHeader += '<div class="tooltip"><mark>' + alertData.features[i].properties.event + '</mark> mouseover to read details<span class="tooltiptext">'+
                    alertData.features[i].properties.headline + '<br><br>' +
                    alertData.features[i].properties.description + '</span></div><br>';
            }
            $('#Alerts').html(function(index, currentContent) {
                    return weatherHeader.replace(/\n/g, "<br />") + currentContent
            })
        }
    })
}

