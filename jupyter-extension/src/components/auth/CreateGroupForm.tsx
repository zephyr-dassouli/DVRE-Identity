import { useState } from "react";
import { ethers } from "ethers";
import GroupFactoryABI from "../../abis/GroupFactory.json";
import React from "react";
import { CONTRACT_ADDRESSES } from "../../config/contracts"; // Adjust the import path as necessary

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
      const factoryContract = new ethers.Contract(CONTRACT_ADDRESSES.GROUP_FACTORY_ADDRESS, GroupFactoryABI.abi, signer);

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
    <div style={{
      border: "1px solid var(--jp-border-color1)",
      borderRadius: "4px",
      padding: "20px",
      backgroundColor: "var(--jp-layout-color1)"
    }}>
      <h2 style={{ color: "var(--jp-ui-font-color1)", marginBottom: "16px" }}>Create New Group</h2>
      <input
        type="text"
        placeholder="Group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          border: "1px solid var(--jp-border-color1)",
          borderRadius: "4px",
          marginBottom: "12px",
          backgroundColor: "var(--jp-layout-color2)",
          color: "var(--jp-ui-font-color1)"
        }}
      />
      <button 
        onClick={handleCreateGroup} 
        style={{
          cursor: "pointer",
          backgroundColor: "var(--jp-brand-color1)",
          color: "var(--jp-ui-inverse-font-color1)",
          width: "100%",
          padding: "8px",
          borderRadius: "4px",
          border: "none",
          transition: "opacity 0.2s ease",
          fontSize: "14px"
        }}
        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.opacity = "0.75"}
        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.opacity = "1"}
      >
        Create Group
      </button>
      <p style={{ color: "var(--jp-ui-font-color1)", marginTop: "12px" }}>{status}</p>
    </div>
  );
};

export default CreateGroupForm;
