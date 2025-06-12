"use client";
import { useState } from "react";
import { ethers } from "ethers";
import GroupFactoryABI from "../abis/GroupFactory.json";

const GROUP_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_GROUP_FACTORY_ADDRESS!;

const CreateGroupForm = () => {
  const [groupName, setGroupName] = useState("");
  const [status, setStatus] = useState("");

  const handleCreateGroup = async () => {
    if (!(window as any).ethereum) {
      alert("MetaMask is not available");
      return;
    }
    if (!groupName.trim()) {
      alert("Group name cannot be empty");
      return;
    }

    try {
      setStatus("Connecting to MetaMask...");
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const factoryContract = new ethers.Contract(GROUP_FACTORY_ADDRESS, GroupFactoryABI.abi, signer);

      setStatus("Sending transaction to create group...");
      const tx = await factoryContract.createGroup(groupName);
      setStatus("Waiting for transaction confirmation...");
      await tx.wait();

      setStatus(`✅ Group "${groupName}" created!`);
      setGroupName(""); // reset input
    } catch (error) {
      console.error(error);
      setStatus("❌ Error creating group");
    }
  };

  return (
    <div className="border border-border rounded p-5">
      <h2>Create New Group</h2>
      <input
        type="text"
        placeholder="Group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className="w-full p-2 border border-border rounded mb-3"
      />
      <button onClick={handleCreateGroup} className="cursor-pointer bg-primary text-background w-full p-2 rounded hover:opacity-75 transition-opacity">
        Create Group
      </button>
      <p>{status}</p>
    </div>
  );
};

export default CreateGroupForm;
