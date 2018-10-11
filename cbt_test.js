var cbt = require('cbt_tunnels');
var fs = require('fs');
var request = require('request');
var selenium = require('./selenium.js');
var util = require('util');
var rqAsync = util.promisify(request);
var APIUrl = 'https://daniel.soskel@gmail.com:ua01f835227df050@crossbrowsertesting.com/api/v3';

cbt.start(
    {
        username: "daniel.soskel@gmail.com",
        authkey: "ua01f835227df050",
        kill: "stopserver",
        dir: __dirname + '/'
    },
    function (err) {
        if (!err) {
            var devices = ['mobile'];
            devices.forEach(function (device) {
                var target = getDevice(device);
                target.then(function(result) {
                    console.log("Result :" + result)
                })
            });
        }
    },
    fs.open('stopserver', 'w', function (err) {
        if (err) throw err
    })
);

async function getDevice(deviceType) {
    var response = await rqAsync(APIUrl + '/selenium/browsers', {json: true}, (err, res, body) => {
        if (err) {
            return console.log('Error: ' + err)
        }
        return body
    });

    if (deviceType === 'mobile') {
        return getRandom(filterByField(response, 'device', deviceType));
    }
    else {
        return getRandom(getDesktops(response, deviceType))
    }
}

function filterByField(arrDevices, field, filter) {
    // filtered = arrDevices.filter(({device}) => device === filter);
    return arrDevices.filter(browser => {
        return browser[field] === filter;
    });
}

function getDesktops(arrDevices, type) {
    var desktops = filterByField(arrDevices, 'device', 'desktop');
    return filterByField(desktops, 'type', type);
}

function getRandom(array) {
    var arrKeys = Object.keys(array);
    var randKey = arrKeys[Math.floor(Math.random() * arrKeys.length)];
    return array[randKey];
}