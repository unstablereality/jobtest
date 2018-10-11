"use strict";

exports.runTest = function () {
    var webdriver = require("selenium-webdriver"),
        SeleniumServer = require("selenium-webdriver/remote").SeleniumServer;

    var cbtHub = "http://hub.crossbrowsertesting.com:80/wd/hub";

    var username = 'daniel.soskel@gmail.com';
    var authkey = 'ua01f835227df050';

    var caps = {
        'name': 'Page Title Test',
        'build': '1.0',
        'browserName': 'Internet Explorer',
        'version': '10',
        'platform': 'Windows 7 64-Bit',
        'screenResolution': '1366x768'
    };

    caps.username = username;
    caps.password = authkey;

    var driver = new webdriver.Builder()
        .usingServer(cbtHub)
        .withCapabilities(caps)
        .build();

    function checkTitle() {
        driver.getTitle()
            .then(function (title) {
                console.log("The title is: " + title)
            });
        return webdriver.until.titleIs('Take Home Test');
    }

    function handleFailure(err) {
        console.error('Something went wrong!\n', err.stack, '\n');
        quitDriver();
    }

    function quitDriver() {
        console.log("WebDriver is about to close.");
        driver.quit();
    }

    driver.get('http://local/TestPage.html');
    return driver.wait(checkTitle, 1000).then(quitDriver, handleFailure);
};