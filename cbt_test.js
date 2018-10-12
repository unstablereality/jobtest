'use strict';

var cbt = require('cbt_tunnels');
var fs = require('fs');
var request = require('request');
var selenium = require('./selenium.js');
var APIUrl = 'https://daniel.soskel@gmail.com:ua01f835227df050@crossbrowsertesting.com/api/v3';

// Start the CBT Tunnel
cbt.start(
    {
        username: "daniel.soskel@gmail.com",
        authkey: "ua01f835227df050",
        kill: "stopserver",
        dir: __dirname + '/'
    },
    function (err) {
        if (!err) {
            // Get the JSON from the API
            var apiResult = JSON.parse(fs.readFileSync('apiResult.json'));

            // Get three random devices and store them in an array
            var testDevices = [];
            testDevices.push(getDevice('mobile', apiResult));
            testDevices.push(getDevice('Windows', apiResult));
            testDevices.push(getDevice('Mac', apiResult));

            // Iterate the array and get what we need for the selenium capabilities list
            var testCaps = [];
            testDevices.forEach(function (testDevice) {
                // Get a random browser from the device
                var browser = getRandom(testDevice.browsers);

                // If the device is mobile, set up the mobile capabilities list
                if (testDevice.device === 'mobile') {
                    testCaps.push(
                        {
                            browserName: browser.caps.browserName,
                            deviceName: testDevice.caps.deviceName,
                            platformName: testDevice.caps.platformName,
                            version: testDevice.caps.platformVersion,
                            deviceOrientation: "portrait",
                            type: "mobile"
                        }
                    )
                }

                // if the device is a desktop, set up the desktop capabilities list
                if (testDevice.device === 'desktop') {
                    var res = getRandom(testDevice.resolutions);
                    testCaps.push(
                        {
                            browserName: browser.caps.browserName,
                            platform: testDevice.caps.platform,
                            version: browser.version,
                            screen_resolution: res.caps.screenResolution,
                            type: "desktop"
                        }
                    )
                }
            });
            selenium.runTest(testCaps);
        }
    },
    // fs.open('stopserver', 'w', function (err) {
    //     if (err) throw err
    // })
);

// Get a random device from the API object.
//
// @param {string}  deviceType  The type of device (desktop or mobile)
// @param {object}   device      The API object
function getDevice(deviceType, devices) {
    // TODO move this out to its own function, then call that as async and use it before starting the tunnel, possibly in a startup function wrapped around cbt.start()
    //request(APIUrl + '/selenium/browsers', {json: true}, (err, res, body) => {
    //     if (err) {
    //         return console.log('Error: ' + err)
    //     }
    if (deviceType === 'mobile') {
        return getRandom(filterByField(devices, 'device', deviceType));
    }
    else {
        return getRandom(getDesktops(devices, deviceType))
    }
    //});
}

// Filter an array and return all objects matching the filter value in a certain field.
//
// @param {object} devices  An JSON object of devices to be filtered
// @param {string} field    The field to to use for filtering
// @param {string} filter   The value to be used for filtering
function filterByField(devices, field, filter) {
    return devices.filter(browser => {
        return browser[field] === filter;
    });
}

// Get a list of desktops matching a certain type (should be Mac or Windows).
//
// @param {object} arrDevices  A JSON object of devices to be filtered
// @param {string} string      The type of desktop to be returned
function getDesktops(arrDevices, type) {
    var desktops = filterByField(arrDevices, 'device', 'desktop');
    return filterByField(desktops, 'type', type);
}

// Return a random object from a given array.
//
// @param {object}  array   An array of JSON objects
function getRandom(array) {
    var arrKeys = Object.keys(array);
    var randKey = arrKeys[Math.floor(Math.random() * arrKeys.length)];
    return array[randKey];
}