# 857final
mining contract logs for attacks

Run with node .\decode_logs.js
Will need running geth/parity node at localhost:8545

Aims are to detect instances of the known attacks against Solidity in the wild by inspecting log data. 
Current work is developing model for what signals or leaked information present in the logs are actually indicative of abuse.
Basic heuristics under consideration are:
  1. Looking for outliers in terms of gas_consumed/txn, #out_of_gas exceptions, bad instructions, especiallly long transactions, fallback function calls  
  2. Findiing a consistent history in flagged txns for an address
  3. Defining any additional mechanisms needed in events and log data to improve performance.
