require("dotenv").config();
const { Web3 } = require("web3");
const fs = require("fs");
const path = require("path");

const rpcURL = process.env.RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
const web3 = new Web3(rpcURL);

const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);

const groupFactoryPath = path.join(__dirname, "../artifacts/contracts/GroupFactory.sol/GroupFactory.json");
const groupFactoryJson = JSON.parse(fs.readFileSync(groupFactoryPath));

const deploy = async () => {
  const contract = new web3.eth.Contract(groupFactoryJson.abi);
  const deployTx = contract.deploy({ data: groupFactoryJson.bytecode });

  const gas = await deployTx.estimateGas();
  const gasPrice = 0;
  const tx = {
    from: account.address,
    gas: Math.floor(Number(gas) * 1.2), // Add 20% buffer to estimated gas
    gasPrice,
    data: deployTx.encodeABI()
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  console.log("✅ Contract deployed at:", receipt.contractAddress);
};

deploy().catch(console.error);
