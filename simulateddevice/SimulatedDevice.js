'use strict';

const deviceIdentity = require('../createdeviceidentity/CreateDeviceIdentity');

const clientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString;
const Message = require('azure-iot-device').Message;
const hostName = 'dimitarnodejs';

/**
 * Try to create device. The device will be send to Azure.
 *
 * @param {Object} deviceIdentity
 */
deviceIdentity.registry.create(deviceIdentity.device, (err, deviceInfo, res) => {
	if (err) {
		deviceIdentity.registry.get(deviceIdentity.device.deviceId, printDeviceInfo);
	}

	if (deviceInfo) {
		printDeviceInfo(err, deviceInfo, res);
	}
});

function printDeviceInfo(err, deviceInfo, res) {
	if (deviceInfo) {
		console.log(`Device id: ${deviceInfo.deviceId}`);
		console.log(`Device key ${deviceInfo.authentication.SymmetricKey.primaryKey}`);

		// Create client and send message.
		createClient(deviceInfo);
	}
};

function createClient(deviceInfo) {
	const sharedKey = deviceInfo.authentication.SymmetricKey.primaryKey
	const connectionString = `HostName=${hostName}.azure-devices.net;DeviceId=${deviceInfo.deviceId};SharedAccessKey=${sharedKey}`;
	console.log(`Connection string: ${connectionString}`);
	const client = clientFromConnectionString(connectionString);

	client.open(function(err) {
		console.log('Try to Send message to IoT Hub');

		if (err) {
			console.warn(`Could not connect: ${err}`);
		} else {
			console.log('Client connected');
			sendMessage(client, deviceInfo);
		}
	});
}

/**
 * Send message to IoT hub.
 *
 * @param {Object} client
 * @param {deviceInfo} deviceInfo
 */
function sendMessage(client, deviceInfo) {
	// Create a message and send it to the IoT every second.
	setInterval(() => {
		const windSpeed = 10 + (Math.random() * 4);
		const data = JSON.stringify({ 
			'deviceId': deviceInfo.deviceId, 
			'windSpeed': windSpeed
		});
		const message = new Message(data);
		console.log(`Sending message: ${message.getData()}`);
		client.sendEvent(message, printResultFor('send'));
	}, 2000);
}


/**
 * display output from the application
 * @param {Object} op
 */
function printResultFor(op) {
	return function printResult(err, res) {
		if (err) {
			const errToString = err.toString();
			console.warn(`${op} error : ${errToString}`);
		}

		if (res) {

			console.log(`${op} status: ${res.constructor.name}`);
		}
	};
};
