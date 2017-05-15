import json
import math

def txnJSON2Dict(JSONstring):
	jdata = json.loads(JSONstring)
	
	contractBlock = jdata.pop(0)
	allowedGas = contractBlock["gas"]
	owner = contractBlock["from"]

	 
	totalGas = []
	uniqueAddresses = []
	totalValues = []
	addressStats = {}

	#{user:{gasUsed: ; txns: , }... construct dictionary of user statistics
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
		totalValues.append(value)


		if user in addressStats:
			addressStats[user]["numTxns"] = addressStats[user]["numTxns"] + 1
			addressStats[user]["value"] = addressStats[user]["value"] + value
			addressStats[user]["errors"] = addressStats[user]["errors"] + isError
			addressStats[user]["gasUsed"] = addressStats[user]["gasUsed"] + [gasUsed]
			addressStats[user]["outOfGas"] = addressStats[user]["outOfGas"] + outOfGas
			if (isError==1):
				addressStats[user]["badTxns"].append(txn["hash"])
		else:
			userStats= {"numTxns" : 1, "value" : value, "errors" : isError, "gasUsed" : [gasUsed], "outOfGas" : outOfGas, "badTxns" : []}
			if (isError):
				userStats["badTxns"].append(txn["hash"])
			addressStats[user] = userStats


	uniqueAddresses = list(set(uniqueAddresses))


	
	#Get standard deviation for gas used over all txns on contract from all users
	numTxns = len(jdata)

	totalAveGasPerTxn = float(sum(totalGas)) / numTxns
	variance = 0
	
	for gas in totalGas:
		variance += math.pow(gas - totalAveGasPerTxn, 2)
	
	variance = variance / numTxns
	stDevGas = math.sqrt(variance)

	print "Average gas used per txn on contract: " + str(totalAveGasPerTxn)
	print "StDev gas used per txn on contract: " + str(stDevGas)
	print "Unique addresses: " + str(len(uniqueAddresses))
	print "total NumTxns: " + str(numTxns)


	#For each user, get the number stDevs away each gas usage is from the global mean, and number of devs for average usage
	naughtyBoys = []
	for address in addressStats:
		addressStats[address]["totalGas"] = sum(addressStats[address]["gasUsed"])
		addressStats[address]["aveGasPerTxn"] = addressStats[address]["totalGas"] / addressStats[address]["numTxns"]
		addressStats[address]["numDevsGasPerTxn"] = [(i - totalAveGasPerTxn) / stDevGas for i in addressStats[address]["gasUsed"]]
		if any(t > 1.5 for t in addressStats[address]["numDevsGasPerTxn"]):
			naughtyBoys.append(address)
			addressStats[address]["NAUGHTYBOY"] = "NAUGHTYBOY"
		addressStats[address]["averageNumDevsGasPerTxn"] = (addressStats[address]["aveGasPerTxn"] - totalAveGasPerTxn) / stDevGas

	print "NAUGHTY BOYS: " + str(len(naughtyBoys))

	

	# Compute histograms of average gas/value per txn per user

	numBuckets = 100.

	gasHistogram = [[] for i in range(0,100)]
	bucketSize = max(totalGas) / numBuckets

	valHistogram = [[] for i in range(0,100)]
	valBucketSize = max(totalValues) / numBuckets

	
	print "===========USERS BAD TXNS=========="
	for address in addressStats:
		
		avgUserGas = int(addressStats[address]["totalGas"] / float(addressStats[address]["numTxns"]))
		bucket = 0
		val = avgUserGas
		while (val >= bucketSize):
			val -= bucketSize
			val = val
			bucket += 1
		if bucket == numBuckets:
			bucket -= 1
		gasHistogram[bucket].append(address)


		avgUserVal = int(addressStats[address]["value"] / float(addressStats[address]["numTxns"]))
		bucket = 0
		val = avgUserVal
		while (val >= valBucketSize):
			val -= valBucketSize
			val = val
			bucket += 1
		if bucket == numBuckets:
			bucket -= 1
		valHistogram[bucket].append(address)

	
		#While we're at it, print erroneous txns
		
		if (addressStats[address]["errors"] > 0):
			print address
			print "Number tnxs: " + str(addressStats[address]["numTxns"])
			print "Num errors: " + str(addressStats[address]["errors"])
			print "averageNumDevsGasPerTxn: " + str(addressStats[address]["averageNumDevsGasPerTxn"])
			print "aveGasPerTxn: " + str(addressStats[address]["aveGasPerTxn"])
			print "Erroneous txns: " + str(addressStats[address]["badTxns"])
			print "==================================================================="

	print "===========END USERS WITH BAD TXNS=========="

	#######Print Histograms of average gas/value per user
	print "\n\n\n"
	print "=====GAS HISTOGRAM====="
	print [len(j) for j in gasHistogram]
	print "======================="
	print "~~~~VALUE HISTOGRAM~~~~"
	print [len(j) for j in valHistogram]
	print "======================="
	


files = ["./txndata/EthereumLottery.json", "./txndata/Etheroll.json", "./txndata/HonestDice.json", "./txndata/Rouleth3.5.json", "./txndata/Rouleth4.8.json"]

with open(files[1], 'r') as myfile:
	data=myfile.read()

txnJSON2Dict(data)

