"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

import GroupFactory from "../abis/GroupFactory.json";
import Group from "../abis/Group.json";

const GROUP_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_GROUP_FACTORY_ADDRESS!;

export function useAuth() {
  const [account, setAccount] = useState<string | null>(null);
  const [groups, setGroups] = useState<{ address: string; name: string }[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("auth");
    if (stored) {
      const { account, groups } = JSON.parse(stored);
      setAccount(account);
      setGroups(groups);
      console.log("Restored session:", { account, groups });
    }
  }, []);

  const connect = async () => {
    if (!(window as any).ethereum) return;

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();

    const factoryContract = new ethers.Contract(GROUP_FACTORY_ADDRESS, GroupFactory.abi, provider);
    const groupAddresses: string[] = await factoryContract.getAllGroups();

    const groupDetails: { address: string; name: string }[] = [];

    for (const groupAddr of groupAddresses) {
      const groupContract = new ethers.Contract(groupAddr, Group.abi, provider);
      try {
        const isMember = await groupContract.isUserMember(addr);
        if (isMember) {
          const name = await groupContract.name();
          groupDetails.push({ address: groupAddr, name });
        }
      } catch (err) {
        console.warn(`Error checking group ${groupAddr}`, err);
      }
    }

    setAccount(addr);
    setGroups(groupDetails);
    sessionStorage.setItem("auth", JSON.stringify({ account: addr, groups: groupDetails }));
  };

  const disconnect = () => {
    setAccount(null);
    setGroups([]);
    sessionStorage.removeItem("auth");
  };

  return { account, groups, connect, disconnect };
}
