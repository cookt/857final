logger = require('./logger');
request = require("request");
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    var Web3 = require('web3');
    var web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
    logger.info("Coinbase: "+web3.eth.coinbase);
}
var SolidityCoder = require("web3/lib/solidity/coder.js");
var API_URL = "http://api.etherscan.io/api?module=account&action=txlist";
var API_TOKEN = "&apikey=CCT1MY4RTXUIYV6BXF5W1TKW4J3E71W3PG";


//Contract object to gather data and analzye
function ContractHistory(name, address, abi) {
    this.name = name;
    this.address = address;
    this.abi = abi;
    this.txns = []; //just gets the 
    this.parsed_txns = [];  
    var self = this;
    //display txns
    this.show = function(txns){
        logger.info("#EventsOfInterest:"+this.txns.length);

        for (var i = 0; i < this.txns.length; i++){
            logger.info(this.txns[i]);
        }
    };

    // Adapted from https://ethereum.stackexchange.com/questions/1381/how-do-i-parse-the-transaction-receipt-log-with-web3-js
    // You might want to put the following in a loop to handle all logs in this receipt.
    // O( nlogs * abi.legnth)
    this.parseTxReceipt = function(txReceipt) {
        log_events = [];
        logger.info("Gas used: "+txReceipt.gas_used)
        for (var i = 0; i < txReceipt.logs.length; i++) {
            var log = txReceipt.logs[i];
            var event = null;
            for (var j = 0; j < this.abi.length; j++) {
                var item = this.abi[j];
                if (item.type != "event") continue;
                var signature = item.name + "(" + item.inputs.map(function(input) {
                    return input.type;
                }).join(",") + ")";
                var hash = web3.sha3(signature);
                for ( var topic_i = 0; topic_i < log.topics.length; topic_i++){
                    if (hash == log.topics[i]) {
                        logger.info("Topic: ");
                        logger.info(item);
                        event = item;
                    }
                }
            }
            //Decode inputs
            if (event != null) {
                var inputs = event.inputs.map(function(input) {
                    return input.type;
                });
                var data = SolidityCoder.decodeParams(inputs, log.data.replace("0x", ""));
                // Do something with the data. Depends on the log and what you're using the data for.
                result = {};
                result["data"] = data;
                result["inputs"] = inputs;
                result["event"] = event.name;
                log_events.push(result);
            }
        }
        return log_events;
    };

    //users globals to request normal txn data from etherscan
    this.getTxns = function() {
        // tnxs = { "normal": [], "internal": []};
        request
        .get(API_URL+"&address="+this.address+API_TOKEN)
        .on("response",function(res){
            var body = '';
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', function() {
                txn_data  = JSON.parse(body);
                self.txns = txn_data['result'];
                self.show();
            });
        });
    };
} 

function AddressHistory(address) {
    this.txns = [];
    this.type = 0; // 0 for rando , other id for known entities
}
ethereum_lottery_address = "0x9473BC8BB575Ffc15CB2179cd9398Bdf5730BF55";
ethereum_lottery_abi = require("./abis/TheEthereumLottery.json");
var eth_lottery = new ContractHistory("Ethereum Lottery", ethereum_lottery_address, ethereum_lottery_abi);

eth_lottery.getTxns();