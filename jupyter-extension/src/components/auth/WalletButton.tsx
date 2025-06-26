import { useEffect, useState } from "react";
import {useAuth} from "../../hooks/useAuth";
import { ethers } from "ethers";
import UserMetadataFactory from "../../abis/UserMetadataFactory.json";

import UserMetadataForm from "./UserMetadataForm";
import UserMetadataDisplay from "./UserMetadataDisplay";
import React from "react";

const USER_METADATA_FACTORY_ADDRESS = "0x62be652c9ca2d2c90c4792c367a883411641d89f";

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
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '16px',
          border: '1px solid var(--jp-border-color1)',
          borderRadius: '4px',
          backgroundColor: 'var(--jp-layout-color0)'
        }}>
          <p><span style={{ fontWeight: 'bold' }}>Connected:</span> {account}</p>
          {metadata ? (
            <UserMetadataDisplay metadata={metadata} />
          ) : showRegister ? (
            <UserMetadataForm onRegister={handleRegister} />
          ) : null}
          <div>
            <p style={{ fontWeight: 'bold' }}>Groups:</p>
            {groups.length > 0 ? (
              <ul style={{
                backgroundColor: 'var(--jp-layout-color1)',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid var(--jp-border-color1)',
                maxHeight: '100px',
                overflowY: 'auto',
                listStyle: 'none',
                margin: 0
              }}>
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
            style={{
              borderRadius: '4px',
              cursor: 'pointer',
              padding: '8px',
              transition: 'opacity 0.2s',
              backgroundColor: 'var(--jp-error-color1)',
              color: 'var(--jp-ui-inverse-font-color1)',
              border: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.75'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            onClick={disconnect}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          style={{
            borderRadius: '4px',
            cursor: 'pointer',
            padding: '8px',
            transition: 'opacity 0.2s',
            backgroundColor: 'var(--jp-brand-color1)',
            color: 'var(--jp-ui-inverse-font-color1)',
            border: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.75'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          onClick={connect}
        >
          Connect MetaMask
        </button>
      )}
    </div>
  );
}