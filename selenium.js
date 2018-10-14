"use strict";

var fs = require('fs');

// Function to run parallel selenium tests and report the result to CBT
//
// @param {object}   testCaps   An object containing the capabilities for the tests
exports.runTest = function (testCaps) {

    return new Promise((resolve, reject) => {

        var username = 'daniel.soskel@gmail.com';
        var authkey = 'ua01f835227df050';

        var webdriver = require('selenium-webdriver'),
            SeleniumServer = require('selenium-webdriver/remote').SeleniumServer,
            request = require('request');

        var remoteHub = "http://hub.crossbrowsertesting.com:80/wd/hub";

        var flows = testCaps.map(async function (testCap) {

            // Initialize the caps object.
            var caps = [];

            // Build the caps object for a mobile device.
            if (testCap.type === "mobile") {
                caps = {
                    name: 'Page Title Verification',
                    browserName: testCap.browserName,
                    deviceName: testCap.deviceName,
                    platformName: testCap.platformName,
                    version: testCap.version,
                    deviceOrientation: testCap.deviceOrientation,
                    username: username,
                    password: authkey
                };
            }

            // Build the caps object for a desktop device.
            if (testCap.type === "desktop") {
                caps = {
                    name: 'Page Title Verification',
                    browserName: testCap.browserName,
                    platform: testCap.platform,
                    version: testCap.version,
                    screen_resolution: testCap.screen_resolution,
                    username: username,
                    password: authkey
                };
            }

            caps.username = username;
            caps.password = authkey;

            var sessionId = null;

            // Register general error handler.
            webdriver.promise.controlFlow().on('uncaughtException', webdriverErrorHandler);

            console.log('Connecting to the CrossBrowserTesting remote server');

            var driver = new webdriver.Builder()
                .usingServer(remoteHub)
                .withCapabilities(caps)
                .build();

            // All driver calls are automatically queued by flow control.
            // Async functions outside of driver can use call() function.
            console.log('Waiting on the ' + caps.browserName + ' browser to be launched and the session to start');

            driver.getSession().then(function (session) {
                sessionId = session.id_; //need for API calls
                console.log('Session ID: ', sessionId);
                console.log('See your test run at: https://app.crossbrowsertesting.com/selenium/' + sessionId)
            });

            // Load the URL.
            driver.get('http://local/TestPage.html');

            // Run the test.
            try {
                var response = await driver
                    .wait(webdriver.until.titleIs('Take Home Test'), 1000)
                    .catch(() => {
                    });

                (response)
                    ? driver.call(setScore, null, 'pass').then(function (result) {
                        console.log('Test score set to pass');
                    })
                    : driver.call(setScore, null, 'fail').then(function (result) {
                        console.log('Test score set to fail');
                    });
            }
            finally {
                await driver.quit();
            }

            // Call API to set the score.
            function setScore(score) {

                //webdriver has built-in promise to use
                var deferred = webdriver.promise.defer();
                var result = {error: false, message: null};

                if (sessionId) {

                    request({
                            method: 'PUT',
                            uri: 'https://crossbrowsertesting.com/api/v3/selenium/' + sessionId,
                            body: {'action': 'set_score', 'score': score},
                            json: true
                        },
                        function (error, response, body) {
                            if (error) {
                                result.error = true;
                                result.message = error;
                            }
                            else if (response.statusCode !== 200) {
                                result.error = true;
                                result.message = body;
                            }
                            else {
                                result.error = false;
                                result.message = 'success';
                            }

                            deferred.fulfill(result);
                        })
                        .auth(username, authkey);
                }
                else {
                    result.error = true;
                    result.message = 'Session Id was not defined';
                    deferred.fulfill(result);
                }

                return deferred.promise;
            }

            // General error catching function.
            function webdriverErrorHandler(err) {

                console.error('There was an unhandled exception! ' + err);

                // If we had a session, end it and mark failed.
                if (driver && sessionId) {
                    driver.quit();
                    setScore('fail').then(function (result) {
                        console.log('set score to fail')
                    })
                }
            }

            resolve();
        });
    });
};