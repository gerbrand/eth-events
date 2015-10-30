# Eth-Events
Ethereum event handling in Meteor.
Events are a very powerfull mechanism to use Ethereum. By using events as the only mean to interact with the Ethereum, you can use the Blockchain as a *Event-store*. Events can be replayed by the standard Ethereum software, thereby reconstructing state.
This package, Eth-Events allows you to use Events more easily in Meteor. Eth-Events is meant to be used server-side. The Ethereum-blockchain is treated as a database, Meteor's is subscribed server-side to the Ethereum-blockchain. The client-side of your application can use the regular publisch/subscribe mechanism of Meteor.

What Eth-Events offers:
* Subcribing to Ethereum events. Eth-Events will keep track of the blockchain-number of the last event that was received, so after a restart of your application you'll only receive new events. During development, just running ```meteor reset``` is enough to replay all events from the start, thereby reconstructing your application's database.
* Simulating Ethereum events, for testing purposes. In unit- or integration-tests there's no need to run Ethereum in the background. You can simulate all Ethereum-events to test your application behaviour. That way you can seperate development of your contracts (which you should test seperately) from the development of your application.

For historic background, see https://forum.ethereum.org/discussion/3243/events-in-solidity-using-blockchain-as-eventstore
