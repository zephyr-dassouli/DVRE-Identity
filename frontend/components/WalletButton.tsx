"use client";

import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export default function WalletButton({ setUserAccount }: { setUserAccount: (account: string | null) => void }) {

  const { account, groups, connect, disconnect } = useAuth();

  useEffect(() => {
    if (account) {
      setUserAccount(account);
    } else {
      setUserAccount(null);
    }
  }, [account, setUserAccount]);

  return (
    <div>
      {account ? (
        <div className="flex flex-col gap-4 p-4 border border-border rounded">
          <p><span className="font-bold">Connected:</span> {account}</p>
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
