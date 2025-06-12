"use client";
import GroupSelector from "../components/GroupSelector";
import WalletButton from "../components/WalletButton";
import CreateGroupForm from "../components/CreateGroupForm";
import { PlusCircleIcon, UsersRoundIcon, UserRoundIcon } from "lucide-react";
import { useState } from "react";

const GroupManagerPage = () => {

  const [userAccount, setUserAccount] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center min-h-screen p-10 gap-12">

      {!userAccount && <h1 className="text-3xl font-extrabold">Welcome to D-VRE</h1>}
      <div className="flex flex-col items-start gap-4">
        {userAccount && <h1 className="text-2xl flex items-center gap-2"><UserRoundIcon />User info</h1>}
        <WalletButton setUserAccount={setUserAccount} />
      </div>
      {userAccount && (
        <div className="flex flex-row justify-center gap-10 w-full">
          <div className="flex flex-col items-start gap-4">
            <h1 className="text-2xl flex items-center gap-2"><UsersRoundIcon />Manage groups</h1>
            <GroupSelector />
          </div>
          <div className="flex flex-col items-start gap-4">
            <h1 className="text-2xl flex items-center gap-2"><PlusCircleIcon />Create a group</h1>
            <CreateGroupForm />
          </div>

        </div>
      )}
      <div />

    </div>
  );
};

export default GroupManagerPage;
