"use strict";

exports.runTest = function (device, browser, resolution) {

    var username = 'daniel.soskel@gmail.com';
    var authkey = 'ua01f835227df050';

    var webdriver = require('selenium-webdriver'),
        SeleniumServer = require('selenium-webdriver/remote').SeleniumServer,
        request = require('request');

    var remoteHub = "http://hub.crossbrowsertesting.com:80/wd/hub";

    var browsers = [
        { browserName: 'Firefox', platform: 'Windows 7 64-bit', version: '27', screen_resolution: '1024x768' },
        { browserName: 'Chrome', platform: 'Mac OSX 10.9', version: '40x64', screen_resolution: '1024x768' },
        { browserName: 'Internet Explorer', platform: 'Windows 8.1', version: '11', screen_resolution: '1024x768' }
    ];

    var flows = browsers.map(function(browser) {

        var caps = {
            name : 'Node Parallel Example',
            browserName : browser.browserName,
            version : browser.version,
            platform : browser.platform,
            screen_resolution : browser.screen_resolution,
            username : username,
            password : authkey
        };

        caps.username = username;
        caps.password = authkey;

        var driver = new webdriver.Builder()
            .usingServer(remoteHub)
            .withCapabilities(caps)
            .build();

        driver.getSession().then(function(session){

            var sessionId = session.id_;

            driver.get('http://local/TestPage.html');
            var element = driver.findElement(webdriver.By.name('q'));
            element.sendKeys('cross browser testing');
            element.submit();
            driver.getTitle().then(function(title) {
                if (title !== ('Take Home Test')) {
                    throw Error('Unexpected title: ' + title);
                }
            });
            driver.quit();
        });
    });
    // var webdriver = require("selenium-webdriver"),
    //     SeleniumServer = require("selenium-webdriver/remote").SeleniumServer;
    //
    // var cbtHub = "http://hub.crossbrowsertesting.com:80/wd/hub";
    //
    // var username = 'daniel.soskel@gmail.com';
    // var authkey = 'ua01f835227df050';
    //
    // var caps = {
    //     'name': 'Page Title Test',
    //     'build': '1.0',
    //     'browserName': browser.caps.browserName,
    //     'deviceName': device.caps.device,
    //     'platformVersion': device.caps.platformVersion,
    //     'platformName': device.caps.platformName,
    //     'deviceOrientation': resolution.deviceOrientation
    // };
    //
    // caps.username = username;
    // caps.password = authkey;
    //
    // var driver = new webdriver.Builder()
    //     .usingServer(cbtHub)
    //     .withCapabilities(caps)
    //     .build();
    //
    // function checkTitle() {
    //     driver.getTitle()
    //         .then(function (title) {
    //             console.log("The title is: " + title)
    //         });
    //     return webdriver.until.titleIs('Selenium Test Example Page');
    // }
    //
    // function handleFailure(err) {
    //     console.error('Something went wrong!\n', err.stack, '\n');
    //     quitDriver();
    // }
    //
    // function quitDriver() {
    //     console.log("WebDriver is about to close.");
    //     driver.quit();
    // }
    //
    // driver.get('http://crossbrowsertesting.github.io/selenium_example_page.html');
    // driver.wait(checkTitle, 1000).then(quitDriver, handleFailure);
};