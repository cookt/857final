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
    this.logEvents = [];
    var self = this;   //for in event callbacks, to be able to reference the right 'this'
    //display txns
    this.showTxns = function(){
        logger.info("#Transactions:"+this.txns.length);

        for (var i = 0; i < this.txns.length; i++){
            logger.info(this.txns[i]);
        }
    };

    this.showLogs = function(){
        logger.info("#EventsOfInterest:"+this.logEvents.length);

        for (var i = 0; i < this.logEvents.length; i++){
            logger.info(this.logEvents[i]);
        }
    };
    // Adapted from https://ethereum.stackexchange.com/questions/1381/how-do-i-parse-the-transaction-receipt-log-with-web3-js
    // You might want to put the following in a loop to handle all logs in this receipt.
    // O( nlogs * abi.legnth)
    this.parseTxnReceipt = function(txReceipt) {
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
                this.logEvents.push(result);
            }
        }
    };

    //users globals to request normal txn data from etherscan
    //only gets normal txns
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
                self.showTxns();
                self.getLogs(); //ordering dependence
            });
        });
    };

    this.getLogs = function(){
        for (var i = 0; i < this.txns.length; i++){
            logger.info(this.txns[i]);
            txnReceipt = web3.eth.getTransactionReceipt(this.txns[i].hash);
            this.parseTxnReceipt(txnReceipt);
            this.showLogs();
        }
    }


} 

function AddressHistory(address) {
    this.txns = [];
    this.type = 0; // 0 for rando , other id for known entities
}
ethereum_lottery_address = "0x9473BC8BB575Ffc15CB2179cd9398Bdf5730BF55";
ethereum_lottery_abi = require("./abis/TheEthereumLottery.json");
var eth_lottery = new ContractHistory("Ethereum Lottery", ethereum_lottery_address, ethereum_lottery_abi);

//eth_lottery.getTxns();

honest_dice_address = "0xD79B4C6791784184e2755B2fC1659eaaB0f80456";
honest_dice_abi = require("./abis/HonestDice.json");
var honest_dice = new ContractHistory("HonestDice",honest_dice_address, honest_dice_abi);

etheroll_address = "0x8F3d6447a647Ecf3c185ecbB165D2e6C41FAd547";
etheroll_abi = require("./abis/Etherroll.json");
var etheroll = new ContractHistory("Etheroll",etheroll_address, etheroll_abi);

rouleth_35_address = "0x18a672E11D637fffADccc99B152F4895Da069601";
rouleth_35_abi = require("./abis/Rouleth3.5.json");
var rouleth_35 = new ContractHistory("Rouleth3.5",rouleth_35_address,rouleth_35_abi);

rouleth_48_address = "0x908c41461Cddefb9F7B4d90C03B66c1C52Ab6093";
rouleth_48_abi = require("./abis/Rouleth4.8.json");
var rouleth_48 = new ContractHistory("Rouleth4.8", rouleth_48_address, rouleth_48_abi);