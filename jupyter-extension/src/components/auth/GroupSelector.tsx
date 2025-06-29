import { useEffect, useState } from "react";
import { ethers } from "ethers";
import AssignGroupMemberForm from "./AssignGroupMemberForm";
import GroupFactoryABI from "../../abis/GroupFactory.json";
import GroupABI from "../../abis/Group.json";
import React from "react";
import { CONTRACT_ADDRESSES } from "../../config/contracts"; // Adjust the import path as necessary

type Group = {
  address: string;
  name: string;
};

const GroupSelector = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selected, setSelected] = useState<Group | undefined>();

  useEffect(() => {
    const loadGroups = async () => {
      if (!(window as any).ethereum) return;

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const factory = new ethers.Contract(CONTRACT_ADDRESSES.GROUP_FACTORY_ADDRESS, GroupFactoryABI.abi, provider);

      try {
        const groupAddresses: string[] = await factory.getAllGroups();

        const groupInfos: Group[] = await Promise.all(
          groupAddresses.map(async (addr) => {
            try {
              const groupContract = new ethers.Contract(addr, GroupABI.abi, provider);
              const name = await groupContract.name();
              return { address: addr, name };
            } catch {
              return { address: addr, name: "Unnamed Group" };
            }
          })
        );

        setGroups(groupInfos);
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };

    loadGroups();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const addr = e.target.value;
    const group = groups.find((g) => g.address === addr);
    setSelected(group);
  };

  return (
    <div style={{
      width: '400px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      gap: '16px',
      border: '1px solid var(--jp-border-color1)',
      borderRadius: '4px',
      backgroundColor: 'var(--jp-layout-color1)'
    }}>
      <p style={{ color: 'var(--jp-ui-font-color1)' }}>Select a group:</p>
      <select 
        style={{
          width: '100%',
          backgroundColor: 'var(--jp-layout-color0)',
          borderRadius: '4px',
          border: '1px solid var(--jp-border-color1)',
          padding: '8px',
          color: 'var(--jp-ui-font-color1)'
        }}
        value={selected?.address} 
        onChange={handleChange}
      >
        <option style={{ borderRadius: '4px' }} value="">- Choose a group -</option>
        {groups.map((group) => (
          <option key={group.address} value={group.address}>
            {group.name}
          </option>
        ))}
      </select>

      {selected && (
        <>
          <h2 style={{ color: 'var(--jp-ui-font-color1)' }}>
            <span style={{ fontWeight: 'bold' }}>Selected Group:</span> {selected.name}
          </h2>
          <AssignGroupMemberForm groupAddress={selected.address} />
        </>
      )}
    </div>
  );
};

export default GroupSelector;
