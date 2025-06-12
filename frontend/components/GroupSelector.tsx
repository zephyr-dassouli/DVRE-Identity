"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import AssignGroupMemberForm from "./AssignGroupMemberForm";
import GroupFactoryABI from "../abis/GroupFactory.json";
import GroupABI from "../abis/Group.json";

const GROUP_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_GROUP_FACTORY_ADDRESS!;

console.log("Factory address:", GROUP_FACTORY_ADDRESS);

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
      const factory = new ethers.Contract(GROUP_FACTORY_ADDRESS, GroupFactoryABI.abi, provider);

      try {
        const groupAddresses: string[] = await factory.getAllGroups();

        const groupInfos: Group[] = await Promise.all(
          groupAddresses.map(async (addr) => {
            try {
              const groupContract = new ethers.Contract(addr, GroupABI.abi, provider);
              const name = await groupContract.name(); // Assumes Group.sol has `string public name;`
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
    <div className="w-[400px] flex flex-col items-center justify-center p-4 gap-4 border border-border rounded">

      <p>Select a group:</p>
      <select className="w-full bg-background rounded border border-border" value={selected?.address} onChange={handleChange}>
        <option className="rounded" value="">- Choose a group -</option>
        {groups.map((group) => (
          <option key={group.address} value={group.address}>
            {group.name}
          </option>
        ))}
      </select>

      {selected && (
        <>
          <h2><span className=" font-bold">Selected Group:</span> {selected.name}</h2>
          <AssignGroupMemberForm groupAddress={selected.address} />
        </>
      )}
    </div>
  );
};

export default GroupSelector;
