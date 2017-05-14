import json
import math

def txnJSON2Dict(JSONstring):
	jdata = json.loads(JSONstring)
	
	contractBlock = jdata.pop(0)
	allowedGas = contractBlock["gas"]
	owner = contractBlock["from"]

	 
	totalGas = []
	uniqueAddresses = []
	addressStats = {}

	#{user:{gasUsed: ; txns: , }
	for txn in jdata:
		user = txn["from"]
		if user == owner: 
			continue
		value = int(txn["value"])
		isError = int(txn["isError"])
		gasUsed = int(txn["gasUsed"])
		outOfGas = 1 if (gasUsed==allowedGas and isError==1) else 0


		uniqueAddresses.append(user)
		totalGas.append(gasUsed)


		if user in addressStats:
			addressStats[user]["numTxns"] = addressStats[user]["numTxns"] + 1
			addressStats[user]["value"] = addressStats[user]["value"] + value
			addressStats[user]["errors"] = addressStats[user]["errors"] + isError
			addressStats[user]["gasUsed"] = addressStats[user]["gasUsed"] + [gasUsed]
			addressStats[user]["outOfGas"] = addressStats[user]["outOfGas"] + outOfGas
		else:
			userStats= {"numTxns" : 1, "value" : value, "errors" : isError, "gasUsed" : [gasUsed], "outOfGas" : outOfGas}
			addressStats[user] = userStats


	uniqueAddresses = list(set(uniqueAddresses))


	
	#Get standard deviation for gas used over all txns on contract from all users
	numTxns = len(totalGas)

	totalAveGasPerTxn = float(sum(totalGas)) / numTxns
	variance = 0
	
	for gas in totalGas:
		variance += math.pow(gas - totalAveGasPerTxn, 2)
		# print variance
	
	variance = variance / numTxns
	stDevGas = math.sqrt(variance)

	print "Average gas used per txn on contract: " + str(totalAveGasPerTxn)
	print "StDev gas used per txn on contract: " + str(stDevGas)
	print "Unique addresses: " + str(len(uniqueAddresses))


	#For each user, get the number stDevs away each gas usage is from the global mean, and number of devs for average usage
	naughtyBoys = []
	for address in addressStats:
		addressStats[address]["totalGas"] = sum(addressStats[address]["gasUsed"])
		addressStats[address]["aveGasPerTxn"] = addressStats[address]["totalGas"] / addressStats[address]["numTxns"]
		addressStats[address]["numDevsGasPerTxn"] = [(i - totalAveGasPerTxn) / stDevGas for i in addressStats[address]["gasUsed"]]
		if any(t > 2.0 for t in addressStats[address]["numDevsGasPerTxn"]):
			naughtyBoys.append(address)
		addressStats[address]["averageNumDevsGasPerTxn"] = (addressStats[address]["aveGasPerTxn"] - totalAveGasPerTxn) / stDevGas

	print "NAUGHTY BOYS: " + str(len(naughtyBoys))



	print
	for address in addressStats:
		print address
		print addressStats[address]
		print ""

files = ["./txndata/EthereumLottery.json", "./txndata/Etheroll.json", "./txndata/HonestDice.json", "./txndata/Rouleth3.5.json", "./txndata/Rouleth4.8.json"]

with open(files[1], 'r') as myfile:
	data=myfile.read()

txnJSON2Dict(data)

