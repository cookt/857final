if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    var Web3 = require('web3');
    var web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
}
ethereum_lottery_address = "0x9473BC8BB575Ffc15CB2179cd9398Bdf5730BF55";
ethereum_lottery_abi = [{
    "constant": true,
    "inputs": [{
        "name": "",
        "type": "uint256"
    }],
    "name": "ledger",
    "outputs": [{
        "name": "WinningNum1",
        "type": "uint8"
    }, {
        "name": "WinningNum2",
        "type": "uint8"
    }, {
        "name": "WinningNum3",
        "type": "uint8"
    }, {
        "name": "WinningNum4",
        "type": "uint8"
    }, {
        "name": "ClosingHash",
        "type": "bytes32"
    }, {
        "name": "OpeningHash",
        "type": "bytes32"
    }, {
        "name": "Guess4OutOf4",
        "type": "uint256"
    }, {
        "name": "Guess3OutOf4",
        "type": "uint256"
    }, {
        "name": "Guess2OutOf4",
        "type": "uint256"
    }, {
        "name": "Guess1OutOf4",
        "type": "uint256"
    }, {
        "name": "PriceOfTicket",
        "type": "uint256"
    }, {
        "name": "ExpirationTime",
        "type": "uint256"
    }],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "TheRand",
        "type": "bytes32"
    }],
    "name": "CheckHash",
    "outputs": [{
        "name": "OpeningHash",
        "type": "bytes32"
    }],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "MyNum1",
        "type": "uint8"
    }, {
        "name": "MyNum2",
        "type": "uint8"
    }, {
        "name": "MyNum3",
        "type": "uint8"
    }, {
        "name": "MyNum4",
        "type": "uint8"
    }],
    "name": "Play",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "",
        "type": "address"
    }],
    "name": "referral_ledger",
    "outputs": [{
        "name": "",
        "type": "uint256"
    }],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "DrawIndex",
        "type": "uint32"
    }],
    "name": "Withdraw",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "Announcements",
    "outputs": [{
        "name": "",
        "type": "string"
    }],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "new_hash",
        "type": "bytes32"
    }, {
        "name": "priceofticket",
        "type": "uint256"
    }, {
        "name": "guess4outof4",
        "type": "uint256"
    }, {
        "name": "guess3outof4",
        "type": "uint256"
    }, {
        "name": "guess2outof4",
        "type": "uint256"
    }, {
        "name": "guess1outof4",
        "type": "uint256"
    }],
    "name": "next_draw",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "DrawIndex",
        "type": "uint32"
    }],
    "name": "Refund",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "Withdraw_referral",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "new_fee",
        "type": "uint8"
    }],
    "name": "set_referral_fee",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "Deposit_referral",
    "outputs": [],
    "payable": true,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "IndexOfCurrentDraw",
    "outputs": [{
        "name": "",
        "type": "uint256"
    }],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "DrawIndex",
        "type": "uint8"
    }, {
        "name": "PlayerAddress",
        "type": "address"
    }],
    "name": "MyBet",
    "outputs": [{
        "name": "Nums",
        "type": "uint8[4]"
    }],
    "payable": false,
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "referral_fee",
    "outputs": [{
        "name": "",
        "type": "uint8"
    }],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "MyNum1",
        "type": "uint8"
    }, {
        "name": "MyNum2",
        "type": "uint8"
    }, {
        "name": "MyNum3",
        "type": "uint8"
    }, {
        "name": "MyNum4",
        "type": "uint8"
    }, {
        "name": "ref",
        "type": "address"
    }],
    "name": "PlayReferred",
    "outputs": [],
    "payable": true,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "MSG",
        "type": "string"
    }],
    "name": "announce",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "index",
        "type": "uint32"
    }, {
        "name": "the_rand",
        "type": "bytes32"
    }],
    "name": "announce_therand",
    "outputs": [],
    "payable": false,
    "type": "function"
}, {
    "inputs": [],
    "payable": false,
    "type": "constructor"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "name": "IndexOfDraw",
        "type": "uint256"
    }, {
        "indexed": false,
        "name": "OpeningHash",
        "type": "bytes32"
    }, {
        "indexed": false,
        "name": "PriceOfTicketInWei",
        "type": "uint256"
    }, {
        "indexed": false,
        "name": "WeiToWin",
        "type": "uint256"
    }],
    "name": "NewDrawReadyToPlay",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "name": "IndexOfDraw",
        "type": "uint32"
    }, {
        "indexed": false,
        "name": "WinningNumber1",
        "type": "uint8"
    }, {
        "indexed": false,
        "name": "WinningNumber2",
        "type": "uint8"
    }, {
        "indexed": false,
        "name": "WinningNumber3",
        "type": "uint8"
    }, {
        "indexed": false,
        "name": "WinningNumber4",
        "type": "uint8"
    }, {
        "indexed": false,
        "name": "TheRand",
        "type": "bytes32"
    }],
    "name": "DrawReadyToPayout",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": false,
        "name": "Wei",
        "type": "uint256"
    }],
    "name": "PlayerWon",
    "type": "event"
}];
sample_txHash = "0x5b119e00e759e5f5731b11bde1d0acd56591a4bb2f2183b4c877a69e1ff366f1";
var SolidityCoder = require("web3/lib/solidity/coder.js");


// Adapted from https://ethereum.stackexchange.com/questions/1381/how-do-i-parse-the-transaction-receipt-log-with-web3-js

// You might want to put the following in a loop to handle all logs in this receipt.
// O( nlogs * abi.legnth)
var parseTxReceipt = function(txReceipt) {
    log_data = [];
    for (var i = 0; i < txReceipt.logs.length; i++) {
        var log = txReceipt.logs[i];
        console.log(log);
        var event = null;
        for (var j = 0; j < ethereum_lottery_abi.length; j++) {
            var item = ethereum_lottery_abi[j];
            if (item.type != "event") continue;
            var signature = item.name + "(" + item.inputs.map(function(input) {
                return input.type;
            }).join(",") + ")";
            var hash = web3.sha3(signature);
            for ( var topic_i = 0; topic_i < log.topics.length; topic_i++){
            	if (hash == log.topics[i]) {
            		console.log(item)
                	event = item;
            	}
            }
            
        }
        if (event != null) {
            var inputs = event.inputs.map(function(input) {
                return input.type;
            });
            var data = SolidityCoder.decodeParams(inputs, log.data.replace("0x", ""));
            //console.log(data)
            // Do something with the data. Depends on the log and what you're using the data for.
            log_data.push(data);
        }
    }
    return log_data;
}

txnReceipt = web3.eth.getTransactionReceipt(sample_txHash);
parsed_txn_log = parseTxReceipt(txnReceipt);
for (var i = 0; i < parsed_txn_log.length; i++) {
	console.log(parsed_txn_log[i]);
}