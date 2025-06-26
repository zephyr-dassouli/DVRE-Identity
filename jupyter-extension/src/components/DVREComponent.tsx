import React from 'react';
import { useState, useEffect } from 'react';
import GroupSelector from './auth/GroupSelector';
import CreateGroupForm from './auth/CreateGroupForm';
import { useAuth } from '../hooks/useAuth';

interface DVREComponentProps {
    title?: string;
}

export const DVREComponent: React.FC<DVREComponentProps> = ({ 
    title = 'D-VRE' 
}) => {
        const { account} = useAuth();
        const [userAccount, setUserAccount] = useState<string | null>(null);

        useEffect(() => {
        if (account) {
            setUserAccount(account);
        } else {
            setUserAccount(null);
        }
    }, [account]);

    return (
        <div style={{ 
            padding: '20px', 
            textAlign: 'center',
            fontFamily: 'var(--jp-ui-font-family)',
            background: 'var(--jp-layout-color1)',
            minHeight: '400px'
        }}>
            {userAccount && (
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    justifyContent: 'center', 
                    gap: '40px', 
                    width: '100%' 
                }}>
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start', 
                        gap: '16px' 
                    }}>
                        <h1 style={{ 
                            fontSize: '1.5rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            color: 'var(--jp-ui-font-color1)',
                            margin: 0
                        }}>
                            Manage groups
                        </h1>
                        <GroupSelector />
                    </div>
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start', 
                        gap: '16px' 
                    }}>
                        <h1 style={{ 
                            fontSize: '1.5rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            color: 'var(--jp-ui-font-color1)',
                            margin: 0
                        }}>
                            Create a group
                        </h1>
                        <CreateGroupForm />
                    </div>
                </div>
            )}
            {!userAccount && (
                <h1 style={{ 
                    fontSize: '1.875rem', 
                    fontWeight: '800',
                    color: 'var(--jp-ui-font-color1)',
                    margin: 0
                }}>
                    Welcome to the D-VRE framework, please register
                </h1>
            )}
        </div>
    );
};

export default DVREComponent;
