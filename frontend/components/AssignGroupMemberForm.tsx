"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import GroupABI from "../abis/Group.json";

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
        <div className="rounded border border-border bg-card p-2 flex flex-col gap-2 w-full">
            <h2>{isUserMember ? "Leave group ?" : "Join group ?"}</h2>

            <button className={` cursor-pointer ${isUserMember ? "bg-danger" : "bg-primary"} text-background w-full p-2 rounded hover:opacity-75 transition-opacity`} onClick={isUserMember ? handleLeave : handleAssign}>
                {isUserMember ? "Leave" : "Join"}
            </button>
            <p>{status}</p>
        </div>
    );
};

export default AssignGroupMemberForm;
