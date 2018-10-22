/*
Author: Daniel Soskel
Date: October 16, 2018

Application to pull a list of devices and browsers from the Cross Browser Testing API, randomly
select 3 devices, randomly select a browser and resolution for each device. The application will then
open a local tunnel to the CBT testing server and run a test on each browser against a local page to
check that the page title is correct, mark the test as pass or fail, and close the tunnel after
all tests have run.

Usage: node cbt_test.js
 */

'use strict';

const cbt = require('cbt_tunnels');
const request = require('request-promise');
const seleniumTest = require('./seleniumTest.js');
const APIUrl = 'https://daniel.soskel@gmail.com:ua01f835227df050@crossbrowsertesting.com/api/v3';

// Start the CBT Tunnel
cbt.start(
    {
        username: "daniel.soskel@gmail.com",
        authkey: "ua01f835227df050",
        dir: __dirname + '\\'
    },
    async function (err) {
        if (!err) {
            // Request the JSON from the API, and wait for it to be returned before continuing.
            let apiResult = await queryAPI();

            // Get three random devices and store them in an array.
            let testDevices = [];
            testDevices.push(getDevice('Windows', apiResult));
            testDevices.push(getDevice('Mac', apiResult));
            testDevices.push(getDevice('mobile', apiResult));

            // Initialize an array to hold the capabilities for the tests.
            let testCaps = [];

            // Iterate the array of devices and get what we need for the selenium capabilities list.
            testDevices.forEach(function (testDevice) {

                // Get a random browser from the device.
                let browser = getRandom(testDevice.browsers);

                // Set up the capabilities objects and push them to the testCaps array.
                // We'll need to set them up differently dpeneding on mobile vs desktop devices.

                // If the device is mobile, set up the mobile capabilities list.
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

                // If the device is a desktop, set up the desktop capabilities list.
                if (testDevice.device === 'desktop') {
                    let res = getRandom(testDevice.resolutions);
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

            // Run the tests and wait for them to complete, then close the tunnel
            await seleniumTest.runTest(testCaps);
            cbt.stop();
        }
    },
);

// Get the list of devices and browsers from the CBT API, returned as a JSON object.
function queryAPI() {
    return new Promise((resolve) => {
        request(`${APIUrl}/selenium/browsers`, {json: true}, (err, res, body) => {
            if (err) {
                return console.log('Error: ' + err)
            }
            resolve(body);
        });
    });
}

// Get a random device from the API object using the getRandom() function.
//
// @param {string}  deviceType  The type of device (desktop or mobile)
// @param {object}   device      The API object
function getDevice(deviceType, devices) {
    return (deviceType === 'mobile')
        ? getRandom(filterByField(devices, 'device', deviceType))
        : getRandom(getDesktops(devices, deviceType));
}

// Filter an array of devices and return all objects matching the filter value in a certain field.
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
// Utilizes filterByField() to sort the list twice, once to get all desktops,
// and again to get a list of desktops of the specified type.
//
// @param {object} arrDevices  A JSON object of devices to be filtered
// @param {string} string      The type of desktop to be returned
function getDesktops(arrDevices, type) {
    let desktops = filterByField(arrDevices, 'device', 'desktop');
    return filterByField(desktops, 'type', type);
}

// Return a random object from a given array.
//
// @param {object}  array   An array of JSON objects
function getRandom(array) {
    let arrKeys = Object.keys(array);
    let randKey = arrKeys[Math.floor(Math.random() * arrKeys.length)];
    return array[randKey];
}