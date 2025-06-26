import { useState, useEffect } from "react";
import { ethers } from "ethers";
import GroupABI from "../../abis/Group.json";
import React from "react";

type Props = {
    groupAddress: string; // Pass the group contract address as a prop
};

const AssignGroupMemberForm = ({ groupAddress }: Props) => {
    const [status, setStatus] = useState("");
    const [isUserMember, setIsUserMember] = useState(false);
    const [userAddress, setUserAddress] = useState("");

    const checkMembership = async () => {
        try {
            if (!(window as any).ethereum) {
                return;
            }

            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setUserAddress(address);

            const groupContract = new ethers.Contract(groupAddress, GroupABI.abi, provider);
            const isMember = await groupContract.isMember(address);
            setIsUserMember(isMember);
        } catch (err: any) {
            console.error("Error checking membership:", err);
        }
    };

    useEffect(() => {
        checkMembership();
    }, [groupAddress]);

    const handleAssign = async () => {
        try {
            if (!(window as any).ethereum) {
                alert("MetaMask is not available");
                return;
            }

            setStatus("🔗 Connecting to MetaMask...");

            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();

            const groupContract = new ethers.Contract(groupAddress, GroupABI.abi, signer);

            setStatus("📨 Sending transaction to add member...");
            const tx = await groupContract.joinGroup();
            await tx.wait();

            setStatus("✅ Member added successfully! Reconnect to see changes.");
            await checkMembership(); // Refresh membership status
        } catch (err: any) {
            console.error(err);
            setStatus("❌ Error: " + (err.reason || err.message));
        }
    };

    const handleLeave = async () => {
        try {
            if (!(window as any).ethereum) {
                alert("MetaMask is not available");
                return;
            }

            setStatus("🔗 Connecting to MetaMask...");

            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();

            const groupContract = new ethers.Contract(groupAddress, GroupABI.abi, signer);

            setStatus("📨 Sending transaction to leave group...");
            const tx = await groupContract.leaveGroup();
            await tx.wait();

            setStatus("✅ Left group successfully!");
            await checkMembership(); // Refresh membership status
        } catch (err: any) {
            console.error(err);
            setStatus("❌ Error: " + (err.reason || err.message));
        }
    };

    return (
        <div style={{
            borderRadius: '4px',
            border: '1px solid var(--jp-border-color1)',
            backgroundColor: 'var(--jp-layout-color1)',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%'
        }}>
            <h2>{isUserMember ? "Leave group ?" : "Join group ?"}</h2>
            <p>{userAddress}</p>
            <button 
                style={{
                    cursor: 'pointer',
                    backgroundColor: isUserMember ? 'var(--jp-error-color1)' : 'var(--jp-brand-color1)',
                    color: 'var(--jp-ui-inverse-font-color1)',
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    transition: 'opacity 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.75'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                onClick={isUserMember ? handleLeave : handleAssign}
            >
                {isUserMember ? "Leave" : "Join"}
            </button>
            <p>{status}</p>
        </div>
    );
};

export default AssignGroupMemberForm;
