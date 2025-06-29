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

const projectFactoryPath = path.join(__dirname, "../artifacts/contracts/ProjectFactory.sol/ProjectFactory.json");
const projectFactoryJson = JSON.parse(fs.readFileSync(projectFactoryPath));

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

  // Deploy ProjectFactory
  const projectFactoryContract = new web3.eth.Contract(projectFactoryJson.abi);
  const projectFactoryDeployTx = projectFactoryContract.deploy({ data: projectFactoryJson.bytecode });

  const projectFactoryGas = await projectFactoryDeployTx.estimateGas();
  const projectFactoryTx = {
    from: account.address,
    gas: Math.floor(Number(projectFactoryGas) * 1.2),
    gasPrice: 0,
    data: projectFactoryDeployTx.encodeABI()
  };

  const projectFactorySignedTx = await web3.eth.accounts.signTransaction(projectFactoryTx, privateKey);
  const projectFactoryReceipt = await web3.eth.sendSignedTransaction(projectFactorySignedTx.rawTransaction);

  console.log("✅ ProjectFactory deployed at:", projectFactoryReceipt.contractAddress);

  // Print summary
  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log(`GroupFactory:         ${groupFactoryReceipt.contractAddress}`);
  console.log(`UserMetadataFactory:  ${userMetadataFactoryReceipt.contractAddress}`);
  console.log(`ProjectFactory:       ${projectFactoryReceipt.contractAddress}`);
  console.log("\n💡 Remember to update your contract addresses in the frontend configuration!");
};

deploy().catch(console.error);
