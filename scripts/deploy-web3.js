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

const userMetadataFactoryPath = path.join(__dirname, "../artifacts/contracts/UserMetadataFactory.sol/UserMetadataFactory.json");
const userMetadataFactoryJson = JSON.parse(fs.readFileSync(userMetadataFactoryPath));

const deploy = async () => {
  // Deploy GroupFactory
  const groupFactoryContract = new web3.eth.Contract(groupFactoryJson.abi);
  const groupFactoryDeployTx = groupFactoryContract.deploy({ data: groupFactoryJson.bytecode });

  const groupFactoryGas = await groupFactoryDeployTx.estimateGas();
  const groupFactoryTx = {
    from: account.address,
    gas: Math.floor(Number(groupFactoryGas) * 1.2),
    gasPrice: 0,
    data: groupFactoryDeployTx.encodeABI()
  };

  const groupFactorySignedTx = await web3.eth.accounts.signTransaction(groupFactoryTx, privateKey);
  const groupFactoryReceipt = await web3.eth.sendSignedTransaction(groupFactorySignedTx.rawTransaction);

  console.log("✅ GroupFactory deployed at:", groupFactoryReceipt.contractAddress);

  // Deploy UserMetadataFactory
  const userMetadataFactoryContract = new web3.eth.Contract(userMetadataFactoryJson.abi);
  const userMetadataFactoryDeployTx = userMetadataFactoryContract.deploy({ data: userMetadataFactoryJson.bytecode });

  const userMetadataFactoryGas = await userMetadataFactoryDeployTx.estimateGas();
  const userMetadataFactoryTx = {
    from: account.address,
    gas: Math.floor(Number(userMetadataFactoryGas) * 1.2),
    gasPrice: 0,
    data: userMetadataFactoryDeployTx.encodeABI()
  };

  const userMetadataFactorySignedTx = await web3.eth.accounts.signTransaction(userMetadataFactoryTx, privateKey);
  const userMetadataFactoryReceipt = await web3.eth.sendSignedTransaction(userMetadataFactorySignedTx.rawTransaction);

  console.log("✅ UserMetadataFactory deployed at:", userMetadataFactoryReceipt.contractAddress);
};

deploy().catch(console.error);
