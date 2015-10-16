EthEvents = new Mongo.Collection('ethEvents');
EthEvents.attachSchema(new SimpleSchema({
    contractAddress: {
        type: String,
        index: true
    },
    eventName: {
        type: String,
        index: true
    },
    blockNumber: {
        type: Number,
        min: 0
    }
}));
EthEvents.getLastBlock = function (contractInstance, eventName) {
    var previous = EthEvents.findOne({
        contractAddress: contractInstance.address,
        eventName: eventName
    });
    return previous ? previous.blockNumber + 1 : 0;
};

EthEvents.handlers = [];
EthEvents.watchEvent = function (contractInstance, eventName, onEvent) {
    // TODO handle forks
    var fromBlock = EthEvents.getLastBlock(contractInstance, eventName);
    var options = {
        'address': contractInstance.address,
        'fromBlock': fromBlock
    };
    var updateFromBlock = function (err, event) {
        onEvent(err, event);
        EthEvents.upsert({
            contractAddress: contractInstance.address,
            eventName: eventName
        }, {
            $set: {
                blockNumber: event.blockNumber
            }
        });
    };
    EthEvents.handlers[contractInstance.address + eventName] = updateFromBlock;
    if (! EthEvents.isSimulation()) {
        var contractEvent = contractInstance[eventName];
        contractEvent({}, options).watch(Meteor.bindEnvironment(updateFromBlock));
    }
    console.log("init filter event", eventName, "of contract", contractInstance.address, "from block", fromBlock);
};

EthEvents.simulateEvent = function(contractInstance, eventName, args) {
    var handler = EthEvents.handlers[contractInstance.address + eventName];
    var event = EthEvents.simulatedEvent(contractInstance, eventName, args);
    handler(null, event);
};

EthEvents.simulatedEvent = function(contractInstance, eventName, args) {
    var blockNumber = EthEvents.getLastBlock(contractInstance, eventName) + 1;
    return { address: contractInstance.address,
        blockNumber: blockNumber,
        logIndex: 0,
        blockHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        transactionHash: '0xb38794660103dda3984395a8a4e8f0d40cde5773a5313a7f5ec4cc540facc197',
        transactionIndex: 0,
        event: eventName,
        args: args };

};

EthEvents.simulateErrEvent = function(contractInstance, eventName, err) {
    var handler = EthEvents.handlers[contractInstance.address + eventName];
    handler(err, event);
};

EthEvents.isSimulation = function() {
    return process.env.IS_MIRROR === "true" || _.isEmpty(web3.eth.accounts);
};

EthEvents.lastNonce = -1;

//TODO add proper error handling. Do something with success and failure returns in the Ethereum contracts also
EthEvents.handleCall = function (msg, onSuccess) {
    if (! EthEvents.isSimulation()) {
        return Meteor.bindEnvironment(function (e, tx) {
            if (!e) {
                var txData = web3.eth.getTransaction(tx);
                console.log('call', msg, 'tx', tx, 'nonce', txData.nonce);
                if (txData.nonce === EthEvents.lastNonce) {
                    console.error("nonce reuse detected!");
                } else {
                    EthEvents.lastNonce = txData.nonce;
                    onSuccess(tx);
                }
            } else {
                console.log("Failed to call Ethereum", e);
            }
        });
    } else {
        return onSuccess;
    }
};
