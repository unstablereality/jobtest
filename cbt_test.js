var cbt = require('cbt_tunnels');
var fs = require('fs');
var request = require('request');
var util = require ('util');
var selenium = require('./selenium.js');
var APIUrl = 'https://daniel.soskel@gmail.com:ua01f835227df050@crossbrowsertesting.com/api/v3';

var mobileDevice = { api_name: 'iPadAir-iOS8Sim',
    device: 'mobile',
    device_type: 'tablet',
    name: 'iPad Air / 8.1 Simulator',
    version: '8.1',
    type: 'iPad',
    icon_class: 'ipad-landscape',
    upload_file_enabled: true,
    sort_order: 1.507,
    is_webrtc_enabled: false,
    caps:
        { deviceName: 'iPad Air Simulator',
            platformName: 'iOS',
            platformVersion: '8.1' },
    browsers:
        [ { name: 'Mobile Safari 8.0',
            type: 'Mobile Safari',
            version: '8.0',
            api_name: 'MblSafari8.0',
            default_live_test_browser: true,
            icon_class: 'safari-mobile',
            major_browser: true,
            device: 'mobile',
            selenium_version: '3.4.0',
            webdriver_type: 'appium',
            webdriver_version: '1.3.4',
            can_mobile_debug: false,
            caps: { browserName: 'Safari' },
            default_config: 'iPadAir-iOS8Sim' } ],
    resolutions:
        [ { width: 1536,
            height: 2048,
            name: '1536x2048',
            desktop_width: 1600,
            desktop_height: 1200,
            default: false,
            orientation: 'portrait',
            caps: { deviceOrientation: 'portrait' } },
            { width: 2048,
                height: 1536,
                name: '2048x1536',
                desktop_width: 1600,
                desktop_height: 1200,
                default: true,
                orientation: 'landscape',
                caps: { deviceOrientation: 'landscape' } } ]
};

cbt.start(
    {
        username: "daniel.soskel@gmail.com",
        authkey: "ua01f835227df050",
        kill: "stopserver",
        dir: __dirname + '/'
    },
    function (err) {
        if (!err) {
            // var devices = ['mobile'];
            // devices.forEach(function (device) {
            //     getDevice(device);
            // });
            browser = mobileDevice.browsers[0];
            resolution = mobileDevice.resolutions[0];
            // console.log('browserName: ' + browser.caps.browserName + ' version: ' + browser.version + ' platform: ' + mobileDevice.caps.platformName + ' screenResolution: ' + resolution.name);
            selenium.runTest(mobileDevice, browser, resolution);
        }
    },
    // fs.open('stopserver', 'w', function (err) {
    //     if (err) throw err
    // })
);

async function getDevice(deviceType) {
    request(APIUrl + '/selenium/browsers', {json: true}, (err, res, body) => {
        if (err) {
            return console.log('Error: ' + err)
        }
        if (deviceType === 'mobile') {
            target = getRandom(filterByField(body, 'device', deviceType));
            console.log(util.inspect(target, {showHidden: false, depth: null}));
        }
        else {
            return getRandom(getDesktops(body, deviceType))
        }
    });
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