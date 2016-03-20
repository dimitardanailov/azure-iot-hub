'use strict';

// amqp10 is a promise-based, AMQP 1.0 compliant node.js client
const AMQPClient = require('amqp10').Client;
const Policy = require('amqp10').Policy;
const translator = require('amqp10').translator;
const Promise = require('bluebird');

const protocol = 'amqps';
const eventHubHost = 'sb://iothub-ns-dimitarnod-24327-58e07f3195.servicebus.windows.net/';
const sasName = 'iothubowner';
const sasKey = 'HostName=dimitarnodejs.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=Pay9Qxs9AZgkEfCU38Zl0htyLNqy8kIOOsQmiQWarpI=';
const eventHubName = 'dimitarnodejs'
const numPartitions = 2;

const filterOffset = new Date().getTime();
let filterOption;

if (filterOffset) {
	filterOption = {
		'attach': {
			'source': { 
				'filter': {
					'apache.org:selector-filter:string': translator([
							'described', 
							['symbol', 'apache.org:selector-filter:string'], 
							['string', "amqp.annotation.x-opt-enqueuedtimeutc > " + filterOffset + ""]
					])
				}
			}
		}
	}
}

const uri = protocol + '://' + encodeURIComponent(sasName) + ':' + encodeURIComponent(sasKey) + '@' + eventHubHost;
const recvAddr = eventHubName + '/ConsumerGroups/$default/Partitions/';

const client = new AMQPClient(Policy.EventHub);

const messageHandler = (partitionId, message) => {
	console.log(`Received ${partitionId} : `, message.body);
};

const errorHandler = (partitionId, err) => {
	console.warn('** Receive error **', err);
};

const createPartitionReceiver = (partitionId, receiveAddress, filterOption) => {
	return client.createReceiver(receiveAddress, filterOption)
		.then((receiver) => {
			console.log(`Listening on partition: ${partitionId}`);
			receiver.on('message', messageHandler.bind(null, partitionId));
			receiver.on('errorReceived', errorHandler.bind(null, partitionId));
		});
};

// Connect to the Event Hub-compatible endpoint and start the receivers
client.connect(uri)
	.then(() => {
		const partitions = [];
		for (let i = 0; i < numPartitions; i++) {
			partitions.push(createPartitionReceiver(i, recvAddr + i, filterOption));
		}

		return Promise.all(partitions);
	})
	.error((e) => {
		console.warn('Connection error: ', e);
	});
