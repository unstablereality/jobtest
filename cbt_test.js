var cbt = require('cbt_tunnels');
var fs = require('fs');
var request = require('request');
var _ = require('underscore');
var selenium = require('./selenium.js');
var APIUrl = 'https://daniel.soskel@gmail.com:ua01f835227df050@crossbrowsertesting.com/api/v3';

cbt.start(
    {
    username: "daniel.soskel@gmail.com",
    authkey: "ua01f835227df050",
    kill: "stopserver",
    dir: "C:\\Users\\DSOSKEL\\WebstormProjects\\CBT_Test\\"},
    function(err) {
        if (!err) {
            var devices = ["mobile", "Windows", "Mac"];
            devices.forEach(async function(device) {
                var target = await getDevice(device);
                console.log(device);
                // selenium.runTest(target);
            });
            // var mobile = await getDevice('mobile');
            // var windows = await getDevice('Windows');
            // var mac = await getDevice('Mac');
        }
    },
    fs.open('stopserver', 'w', function(err) { if (err) throw err })
);

function getDevice(deviceType) {
    request(APIUrl + '/selenium/browsers', {json: true}, (err, res, body) => {
        if (err) {return console.log('Error: ' + err)}
        if (deviceType === 'mobile') {
            return getRandom(filterByField(body, 'device', deviceType));
        }
        else {
            return getRandom(getDesktops(body, deviceType))
        }
        // var mobile = getRandom(filterByField(body, 'device', 'mobile'));
        // var windows = getRandom(getDesktops(body, 'Windows'));
        // var mac = getRandom(getDesktops(body, 'Mac'));
        // console.log(mobile.api_name);
        // console.log(windows.api_name);
        // console.log(mac.api_name);
    });
}

function filterByField(arrDevices, field, filter) {
    // filtered = arrDevices.filter(({device}) => device === filter);
    return arrDevices.filter( browser => {
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