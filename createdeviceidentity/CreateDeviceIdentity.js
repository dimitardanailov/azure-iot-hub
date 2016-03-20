'use strict';

const iothub = require('azure-iothub');

const connectionString = "HostName=dimitarnodejs.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=Pay9Qxs9AZgkEfCU38Zl0htyLNqy8kIOOsQmiQWarpI=";
const registry = iothub.Registry.fromConnectionString(connectionString);

const device = new iothub.Device(null);
device.deviceId = 'my-nodejs-device';

module.exports = {
	'registry': registry, 
	'device': device
};
