"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

import ProjectFactory from "../abis/ProjectFactory.json";
import Project from "../abis/Project.json";
import UserMetadataFactory from "../abis/UserMetadataFactory.json";
import { useFactoryRegistry } from "./useFactoryRegistry";

export function useAuth() {
  const [account, setAccount] = useState<string | null>(null);
  const [projects, setProjects] = useState<{ address: string; name: string }[]>([]);
  const { getFactoryAddress } = useFactoryRegistry();

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

    // Get ProjectFactory address from registry
    const projectFactoryAddress = await getFactoryAddress("ProjectFactory");
    if (!projectFactoryAddress) {
      console.error("Failed to get ProjectFactory address from registry");
      return;
    }

    const factoryContract = new ethers.Contract(projectFactoryAddress, ProjectFactory.abi, provider);
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

    // Get UserMetadataFactory address from registry
    const userMetadataFactoryAddress = await getFactoryAddress("UserMetadataFactory");
    if (!userMetadataFactoryAddress) {
      console.error("Failed to get UserMetadataFactory address from registry");
      return false;
    }

    const userMetadataFactory = new ethers.Contract(
      userMetadataFactoryAddress,
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

  // Get factory address from registry (alternative to hardcoded addresses)
  const getFactoryFromRegistry = async (factoryName: string) => {
    try {
      const address = await getFactoryAddress(factoryName);
      return address;
    } catch (error) {
      console.error(`Failed to get ${factoryName} from registry:`, error);
      return null;
    }
  };

  return { account, projects, connect, disconnect, register, getFactoryFromRegistry };
}
