"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { ethers } from "ethers";
import UserMetadataFactory from "../abis/UserMetadataFactory.json";

import UserMetadataForm from "./UserMetadataForm";
import UserMetadataDisplay from "./UserMetadataDisplay";

const USER_METADATA_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_USER_METADATA_FACTORY_ADDRESS!;

export default function WalletButton({ setUserAccount }: { setUserAccount: (account: string | null) => void }) {
  const { account, groups, connect, disconnect, register } = useAuth();

  const [metadata, setMetadata] = useState<{ email: string; name: string; institution: string } | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  // Fetch user metadata if connected
  useEffect(() => {
    if (account) {
      setUserAccount(account);
      fetchMetadata(account);
    } else {
      setUserAccount(null);
      setMetadata(null);
      setShowRegister(false);
    }
  }, [account]);

  // Check if user is registered and fetch metadata
  const fetchMetadata = async (userAddress: string) => {
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(USER_METADATA_FACTORY_ADDRESS, UserMetadataFactory.abi, provider);
      const metadataAddr = await contract.getUserMetadataContract(userAddress);
      if (metadataAddr === ethers.ZeroAddress || metadataAddr === "0x0000000000000000000000000000000000000000") {
        setShowRegister(true);
        setMetadata(null);
      } else {
        const metadataJSON = await contract.getUserMetadataJSON(userAddress);
        const parsed = JSON.parse(metadataJSON);
        setMetadata(parsed);
        setShowRegister(false);
      }
    } catch (err) {
      setShowRegister(true);
      setMetadata(null);
    }
  };

  // Handle registration form submission
  const handleRegister = async (email: string, name: string, institution: string) => {
    const success = await register(email, name, institution);
    if (success && account) {
      await fetchMetadata(account);
    }
  };

  return (
    <div>
      {account ? (
        <div className="flex flex-col gap-4 p-4 border border-border rounded">
          <p><span className="font-bold">Connected:</span> {account}</p>
          {metadata ? (
            <UserMetadataDisplay metadata={metadata} />
          ) : showRegister ? (
            <UserMetadataForm onRegister={handleRegister} />
          ) : null}
          <div>
            <p className="font-bold">Groups:</p>
            {groups.length > 0 ? (
              <ul className="bg-card p-2 rounded border border-border max-h-[100px] overflow-y-auto">
                {groups.map(({ address, name }) => (
                  <li key={address}>
                    {name}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No group memberships found</p>
            )}
          </div>
          <button
            className="rounded cursor-pointer p-2 transition-opacity bg-danger hover:opacity-75 text-background"
            onClick={disconnect}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          className="rounded cursor-pointer p-2 transition-opacity bg-primary hover:opacity-75 text-background"
          onClick={connect}
        >
          Connect MetaMask
        </button>
      )}
    </div>
  );
}