"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

import ProjectFactory from "../abis/ProjectFactory.json";
import Project from "../abis/Project.json";
import UserMetadataFactory from "../abis/UserMetadataFactory.json";
import { CONTRACT_ADDRESSES } from "../config/contracts";

export function useAuth() {
  const [account, setAccount] = useState<string | null>(null);
  const [projects, setProjects] = useState<{ address: string; name: string }[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("auth");
    if (stored) {
      const { account, projects } = JSON.parse(stored);
      setAccount(account);
      setProjects(projects);
      console.log("Restored session:", { account, projects });
    }
  }, []);

  const connect = async () => {
    if (!(window as any).ethereum) return;

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();

    const factoryContract = new ethers.Contract(CONTRACT_ADDRESSES.PROJECT_FACTORY_ADDRESS, ProjectFactory.abi, provider);
    const projectAddresses: string[] = await factoryContract.getAllProjects();

    const projectDetails: { address: string; name: string }[] = [];

    for (const projectAddr of projectAddresses) {
      const projectContract = new ethers.Contract(projectAddr, Project.abi, provider);
      try {
        const isMember = await projectContract.isMember(addr);
        if (isMember) {
          const name = await projectContract.getName(); // This returns the objective which serves as the project name
          projectDetails.push({ address: projectAddr, name });
        }
      } catch (err) {
        console.warn(`Error checking project ${projectAddr}`, err);
      }
    }

    setAccount(addr);
    setProjects(projectDetails);
    sessionStorage.setItem("auth", JSON.stringify({ account: addr, projects: projectDetails }));
  };

  const disconnect = () => {
    setAccount(null);
    setProjects([]);
    sessionStorage.removeItem("auth");
  };

  // Register user on the blockchain
  const register = async (email: string, name: string, institution: string) => {
    if (!(window as any).ethereum) return;

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();

    const userMetadataFactory = new ethers.Contract(
      CONTRACT_ADDRESSES.USER_METADATA_FACTORY_ADDRESS,
      UserMetadataFactory.abi,
      signer
    );

    try {
      const tx = await userMetadataFactory.registerUser(email, name, institution);
      await tx.wait();
      // Optionally, you can refresh or fetch user metadata here
      return true;
    } catch (err) {
      console.error("Registration failed:", err);
      return false;
    }
  };

  return { account, projects, connect, disconnect, register };
}
