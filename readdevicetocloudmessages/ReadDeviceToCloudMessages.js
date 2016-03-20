'use strict';

// amqp10 is a promise-based, AMQP 1.0 compliant node.js client
var AMQPClient = require('amqp10').Client;
var Policy = require('amqp10').Policy;
var translator = require('amqp10').translator;
var Promise = require('bluebird');

const protocol = 'amqps';
const sasName = 'iothubowner';
const numPartitions = 2;
// Event hub-compatible namespace
const eventHubHost = 'sb://iothub-ns-dimitarnod-24327-58e07f3195.servicebus.windows.net/';
// IoT hub key
const sasKey = 'Pay9Qxs9AZgkEfCU38Zl0htyLNqy8kIOOsQmiQWarpI='
// Event hub - compatible name
const eventHubName = 'dimitarnodejs'

var filterOffset = new Date().getTime();
var filterOption;
if (filterOffset) {
	filterOption = {
		attach: { source: { filter: {
			'apache.org:selector-filter:string': translator(
					['described', ['symbol', 'apache.org:selector-filter:string'], ['string', "amqp.annotation.x-opt-enqueuedtimeutc > " + filterOffset + ""]])
		} } }
	};
}

var uri = protocol + '://' + encodeURIComponent(sasName) + ':' + encodeURIComponent(sasKey) + '@' + eventHubHost;
console.log(`Uri: ${uri}`);
var recvAddr = eventHubName + '/ConsumerGroups/$default/Partitions/';

var client = new AMQPClient(Policy.EventHub);

console.log("Try to connect");
client.connect(uri)
	.then(function () {
		var partitions = [];
		for (var i = 0; i < numPartitions; ++i) {
			partitions.push(createPartitionReceiver(i, recvAddr + i, filterOption));
		}

		return Promise.all(partitions);
	})
.error(function (e) {
	console.warn('Connection error: ', e);
});

var createPartitionReceiver = function(partitionId, receiveAddress, filterOption) {
	return client.createReceiver(receiveAddress, filterOption)
		.then(function (receiver) {
			console.log('Listening on partition: ' + partitionId);
			receiver.on('message', messageHandler.bind(null, partitionId));
			receiver.on('errorReceived', errorHandler.bind(null, partitionId));
		});
};

var messageHandler = function (partitionId, message) {
	console.log('Received(' + partitionId + '): ', message.body);
};

var errorHandler = function(partitionId, err) {
	console.warn('** Receive error: ', err);
};
