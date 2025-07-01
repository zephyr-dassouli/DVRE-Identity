require("dotenv").config();
const { Web3 } = require("web3");
const fs = require("fs");
const path = require("path");
const { registerMultipleFactories } = require("./registryHook");

const rpcURL = process.env.RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
const web3 = new Web3(rpcURL);

const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);

const userMetadataFactoryPath = path.join(__dirname, "../artifacts/contracts/UserMetadataFactory.sol/UserMetadataFactory.json");
const userMetadataFactoryJson = JSON.parse(fs.readFileSync(userMetadataFactoryPath));

const projectFactoryPath = path.join(__dirname, "../artifacts/contracts/ProjectFactory.sol/ProjectFactory.json");
const projectFactoryJson = JSON.parse(fs.readFileSync(projectFactoryPath));

const deploy = async () => {

  // // Deploy UserMetadataFactory
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

  console.log("UserMetadataFactory deployed at:", userMetadataFactoryReceipt.contractAddress);

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

  console.log("ProjectFactory deployed at:", projectFactoryReceipt.contractAddress);

  // Print summary
  console.log("\nDeployment Summary:");
  console.log("========================");
  console.log(`UserMetadataFactory:  ${userMetadataFactoryReceipt.contractAddress}`);
  console.log(`ProjectFactory:       ${projectFactoryReceipt.contractAddress}`);

  // Register factories in FactoryRegistry
  console.log("\nRegistering factories in FactoryRegistry...");
  const factories = [
    { name: "UserMetadataFactory", address: userMetadataFactoryReceipt.contractAddress },
    { name: "ProjectFactory", address: projectFactoryReceipt.contractAddress }
  ];

  try {
    await registerMultipleFactories(factories);
    console.log("\nAll factories registered successfully in FactoryRegistry!");
  } catch (error) {
    console.error("\nError registering factories:", error.message);
  }

  console.log("\nRemember to update your contract addresses in the frontend configuration!");
};

deploy().catch(console.error);
