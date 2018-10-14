'use strict';

var cbt = require('cbt_tunnels');
var request = require('request-promise');
var selenium = require('./selenium.js');
var as = require('async');
var co = require('co');
var APIUrl = 'https://daniel.soskel@gmail.com:ua01f835227df050@crossbrowsertesting.com/api/v3';

// Start the CBT Tunnel
cbt.start(
    {
        username: "daniel.soskel@gmail.com",
        authkey: "ua01f835227df050",
        dir: __dirname + '\\'
    },
    async function (err) {
        if (!err) {
            // Get the JSON from the API
            var apiResult = await queryAPI();

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
            selenium.runTest(testCaps)
            cbt.stop();
        }
    },
);

// Get the API results.
function queryAPI() {
    return new Promise((resolve, reject) => {
        request(APIUrl + '/selenium/browsers', {json: true}, (err, res, body) => {
            if (err) {
                return console.log('Error: ' + err)
            }
            resolve(body);
        });
    });
}

// Get a random device from the API object.
//
// @param {string}  deviceType  The type of device (desktop or mobile)
// @param {object}   device      The API object
function getDevice(deviceType, devices) {
    return (deviceType === 'mobile')
        ? getRandom(filterByField(devices, 'device', deviceType))
        : getRandom(getDesktops(devices, deviceType));
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