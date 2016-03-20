'use strict';

const iothub = require('azure-iothub');

const connectionString = "HostName=dimitarnodejs.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=Pay9Qxs9AZgkEfCU38Zl0htyLNqy8kIOOsQmiQWarpI=";
const registry = iothub.Registry.fromConnectionString(connectionString);

const device = new iothub.Device(null);
device.deviceId = 'my-nodejs-device';
registry.create(device, (err, deviceInfo, res) => {
	if (err) {
		registry.get(device.deviceId, printDeviceInfo);
	}

	if (deviceInfo) {
		printDeviceInfo(err, deviceInfo, res);
	}
});

function printDeviceInfo(err, deviceInfo, res) {
	if (deviceInfo) {
		console.log(`Device id: ${deviceInfo.deviceId}`);
		console.log(`Device key ${deviceInfo.authentication.SymmetricKey.primaryKey}`);
	}
};
