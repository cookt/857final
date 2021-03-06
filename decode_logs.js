const logger = require('./logger');
const fs = require('fs');
const request = require('request');
const Web3 = require('web3');

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    var web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
    logger.info("Coinbase: "+web3.eth.coinbase);
}
const SolidityCoder = require("web3/lib/solidity/coder.js");
var API_URL = "http://api.etherscan.io/api?module=account&action=txlist";//mainnet
var API_TOKEN = "&apikey=CCT1MY4RTXUIYV6BXF5W1TKW4J3E71W3PG";
//var API_URL = "http://ropsten.etherscan.io/api?module=account&action=txlist";

//Contract object to gather data and analzye
function ContractHistory(name, address, abi) {
    this.name = name;
    this.address = address;
    this.abi = abi;
    this.txns = []; //just gets the hashes and txn metadata
    this.txnTraces = [];
    this.logEvents = [];
    var self = this;   //for in event callbacks, to be able to reference the right 'this'
    
    //display txns and write to file
    this.showTxns = function(txnFilename){
        logger.info("#Transactions:"+this.txns.length);
        fs.writeFile(txnFilename,JSON.stringify(this.txns),(err) => {
            if (err) {
                logger.error(err);
                return;
            };
            logger.info(this.name+" txn.json file has been created");
        });
        for (var i = 0; i < this.txns.length; i++){
            //logger.info("TXN");
            //logger.info(this.txns[i]);
        }
    };

    //stores file to jso
    this.showLogs = function(index) {
        logger.info("#EventsOfInterest:"+this.logEvents.length);
        if (this.logEvents.length > 0) {
            var logFilename = "./txnlogs/"+this.name+index+"log.json";
            fs.writeFile(logFilename,JSON.stringify(this.logEvents),(err) => {
                if (err) {
                    logger.error(err);
                    return;
                };
                logger.info(this.name+".json log file has been created");
            });
            for (var i = 0; i < this.logEvents.length; i++){
                // logger.info("LOG EVENT");
                // logger.info(this.logEvents[i]);
            }
        }
        
    };
    // Adapted from https://ethereum.stackexchange.com/questions/1381/how-do-i-parse-the-transaction-receipt-log-with-web3-js
    // You might want to put the following in a loop to handle all logs in this receipt.
    // O( nlogs * abi.legnth)
    this.parseTxnReceipt = function(txReceipt) {
        logger.info("Gas used: "+txReceipt.gasUsed)
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
                        //logger.info("Topic: ");
                        //logger.info(item);
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
                result["rawlogdata"] = log.data;
                result["data"] = data;
                result["inputs"] = event.inputs;
                result["event"] = event.name;
                result["txhash"] = log.transactionHash;
                this.logEvents.push(result);
            }
        }
    };

    //users globals to request normal txn data from etherscan
    //only gets normal txns
    this.getTxns = function() {
        // tnxs = { "normal": [], "internal": []};
        var txnFilename = "./txndata/"+this.name+".json";
        if (fs.existsSync(txnFilename)){
            this.txns = JSON.parse(require(txnFilename));
            this.getLogs();
        }
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
                self.showTxns(txnFilename);
                self.getLogs();
            });
        });
    };

    //retrieves and parses logs using web3
    this.getLogs = function(){
        for (var i = 0; i < this.txns.length; i++){
            txnReceipt = web3.eth.getTransactionReceipt(this.txns[i].hash);
            logger.info(txnReceipt);
            this.parseTxnReceipt(txnReceipt);
            this.showLogs(i);
        }
        this.getTxnTraces();
    };

    //gets the traces for all available transactions for the contract and stores result
    this.getTxnTraces = function() {
        for (var i = 0; i < this.txns.length; i+=1){
            this.traceTxn(this.txns[i].hash, i);
        }
        var traceFileName = "./txntraces/"+self.name+"trace.json";
        fs.writeFile(traceFileName, JSON.stringify(this.txnTraces),(err) => {
            if (err) {
                logger.error(err);
                return;
            };
            logger.info(this.name+"trace.json log file has been created");
        });
    };

    //Using parity jsonrpc to replay txn by hash
    this.traceTxn = function(txnHash, index) {
        web3.currentProvider.sendAsync({
            method: "trace_replayTransaction",
            params: [txnHash, ['trace', 'vmTrace', 'stateDiff']],
            id : "1.0",
            jsonrpc:"2.0"
        }, 
        function(err, result){
            if (err) {
                logger.error(err);
                return;
            } else {
                var data = JSON.parse(result['result']);
                self.txnTraces.push(data);
            }
        });
    }

} 
// ethereum_lottery_address = "0x9473BC8BB575Ffc15CB2179cd9398Bdf5730BF55";
// ethereum_lottery_abi = require("./abis/TheEthereumLottery.json");
// var eth_lottery = new ContractHistory("EthereumLottery", ethereum_lottery_address, ethereum_lottery_abi);

// eth_lottery.getTxns();

// honest_dice_address = "0xD79B4C6791784184e2755B2fC1659eaaB0f80456";
// honest_dice_abi = require("./abis/HonestDice.json");
// var honest_dice = new ContractHistory("HonestDice", honest_dice_address, honest_dice_abi);

// honest_dice.getTxns();

// etheroll_address = "0x8F3d6447a647Ecf3c185ecbB165D2e6C41FAd547";
// etheroll_abi = require("./abis/Etherroll.json");
// var etheroll = new ContractHistory("Etheroll",etheroll_address, etheroll_abi);

// etheroll.getTxns();

rouleth_35_address = "0x18a672E11D637fffADccc99B152F4895Da069601";
rouleth_35_abi = require("./abis/Rouleth3.5.json");
var rouleth_35 = new ContractHistory("Rouleth3.5",rouleth_35_address,rouleth_35_abi);

rouleth_35.getTxns();

// rouleth_48_address = "0x908c41461Cddefb9F7B4d90C03B66c1C52Ab6093";
// rouleth_48_abi = require("./abis/Rouleth4.8.json");
// var rouleth_48 = new ContractHistory("Rouleth4.8", rouleth_48_address, rouleth_48_abi);

// rouleth_48.getTxns();
//On ropsten

// simple_dao_test_address = "0x6e41c6ab279b57cbc813fa60b66a64910834c5b826f72034ef30e92e6c8fa336";
// simple_dao_abi = [{"constant":false,"inputs":[{"name":"to","type":"address"}],"name":"donate","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"}],"name":"queryCredit","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"credit","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"}];
// simple_dao = new ContractHistory("SimpleDao", simple_dao_test_address, simple_dao_abi);

// simple_dao.getTxns();