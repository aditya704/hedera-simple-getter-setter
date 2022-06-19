console.clear();
require("dotenv").config();

const {
    AccountId,
    PrivateKey,
    Client,
    FileCreateTransaction,
    Hbar,
    ContractCreateTransaction,
    ContractFunctionParameters,
    ContractCallQuery,
    ContractExecuteTransaction
} = require("@hashgraph/sdk");

const fs = require("fs");
const { join } = require("path");
const { kill } = require("process");

// Configure accounts and client
const operatorID = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorID, operatorKey);

async function main(){

    // Import the compiled contract bytecode
    const contractBytecode = fs.readFileSync("LookupContract_sol_LookupContract.bin");

    // Create a file on Hedera and store the byte code
    const fileCreateTx = new FileCreateTransaction()
        .setContents(contractBytecode)
        .setKeys([operatorKey])
        .setMaxTransactionFee(new Hbar(1.5))
        .freezeWith(client);
    const fileCreateSign = await fileCreateTx.sign(operatorKey);
    const fileCreateSubmit = await fileCreateSign.execute(client);
    const fileCreateRx = await fileCreateSubmit.getReceipt(client);
    const bytecodeFileId = fileCreateRx.fileId;
    console.log(`- The byte code file Id is: ${bytecodeFileId} \n`);

    // Instantiate the smart contract
    const contractInstantiateTx = new ContractCreateTransaction()
        .setBytecodeFileId(bytecodeFileId)
        .setGas(100000)
        .setConstructorParameters(new ContractFunctionParameters().addString("Aditya").addUint256(111111));
    const contractInstantiateSubmit = await contractInstantiateTx.execute(client);
    const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(client);
    const contractId = contractInstantiateRx.contractId;
    const contractAddress = contractId.toSolidityAddress();
    console.log(`- The smart contract Id is: ${contractId} \n`);
    console.log(`- The smart contract Id in solidity format is: ${contractAddress} \n`);

    // Query the contract to check changes in the instantiated contract

    const contractQueryTx = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("getMobileNumber", new ContractFunctionParameters().addString("Aditya"))
        .setMaxQueryPayment(new Hbar(0.1));
    const contractQuerySubmit  = await contractQueryTx.execute(client);
    const contractQueryResult = contractQuerySubmit.getUint256();
    console.log(`- Here's is the phone number that you asked for: ${contractQueryResult} \n`);

    // Call the contract to set a new variable in the contract

    const contractExecuteTx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("setMobileNumber", new ContractFunctionParameters().addString("Abhishek").addUint256(222222))
        .setMaxTransactionFee(new Hbar(0.75));
    const contractExecuteSubmit = await contractExecuteTx.execute(client);
    const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
    console.log(`- Contract function call status is: ${contractExecuteRx.status} \n`);

    // Query the contract to check the new changes done to the contract

    const contractQueryTx1 = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("getMobileNumber", new ContractFunctionParameters().addString("Abhishek"))
        .setMaxQueryPayment(new Hbar(0.1));
    const contractQuerySubmit1  = await contractQueryTx1.execute(client);
    const contractQueryResult1 = contractQuerySubmit1.getUint256();
    console.log(`- Here's is the next phone number that you asked for: ${contractQueryResult1} \n`);


}

main();



