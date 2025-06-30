import React, { useState, useEffect, useCallback } from 'react';
import { ProjectDetails as ProjectDetailsType, useProjects } from '../../hooks/useProjects';
import { useAuth } from '../../hooks/useAuth';
import PendingJoinRequests from './PendingJoinRequests';

interface ProjectDetailsProps {
    projectAddress: string;
    onBack: () => void;
    onMembershipChange?: () => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
    projectAddress,
    onBack,
    onMembershipChange
}) => {
    const [details, setDetails] = useState<ProjectDetailsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getProjectDetails, getCollaborativeTemplateName } = useProjects();
    const { account } = useAuth();

    // Memoize the loadDetails function to prevent infinite re-renders
    const loadDetails = useCallback(async () => {
        if (!projectAddress) return;
        
        try {
            console.log('Loading project details for:', projectAddress);
            setLoading(true);
            setError(null);
            
            const projectDetails = await getProjectDetails(projectAddress);
            console.log('Project details loaded:', projectDetails);
            
            setDetails(projectDetails);
        } catch (err) {
            console.error('Error loading project details:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [projectAddress, getProjectDetails]);

    useEffect(() => {
        loadDetails();
    }, [loadDetails]); // Only depend on the memoized function

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ color: 'var(--jp-ui-font-color2)' }}>Loading project details...</div>
                <div style={{ fontSize: '12px', color: 'var(--jp-ui-font-color3)', marginTop: '8px' }}>
                    Address: {projectAddress}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ color: 'var(--jp-error-color1)', marginBottom: '10px' }}>
                    Error: {error}
                </div>
                <button onClick={onBack} style={{ marginTop: '10px' }}>Back to Projects</button>
            </div>
        );
    }

    if (!details) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ color: 'var(--jp-ui-font-color2)' }}>Failed to load project details</div>
                <button onClick={onBack} style={{ marginTop: '10px' }}>Back to Projects</button>
            </div>
        );
    }

    return (
        <div>
            <div style={{
                background: 'var(--jp-layout-color1)',
                border: '1px solid var(--jp-border-color1)',
                borderRadius: '4px',
                padding: '20px',
                maxWidth: '600px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{
                        margin: '0',
                        color: 'var(--jp-ui-font-color1)'
                    }}>
                        Project Details
                    </h2>
                    <button
                        onClick={onBack}
                        style={{
                            padding: '6px 12px',
                            background: 'var(--jp-layout-color2)',
                            border: '1px solid var(--jp-border-color1)',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            color: 'var(--jp-ui-font-color1)',
                            fontSize: '12px'
                        }}
                    >
                        ← Back
                    </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{
                        color: 'var(--jp-ui-font-color1)',
                        marginBottom: '8px'
                    }}>
                        Objective
                    </h3>
                    <div style={{
                        padding: '12px',
                        background: 'var(--jp-layout-color0)',
                        border: '1px solid var(--jp-border-color2)',
                        borderRadius: '3px',
                        color: 'var(--jp-ui-font-color1)'
                    }}>
                        {details.objective}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{
                            color: 'var(--jp-ui-font-color1)',
                            marginBottom: '8px'
                        }}>
                            Project Info
                        </h3>
                        <div style={{
                            padding: '12px',
                            background: 'var(--jp-layout-color0)',
                            border: '1px solid var(--jp-border-color2)',
                            borderRadius: '3px'
                        }}>
                            <div style={{ color: 'var(--jp-ui-font-color1)', marginBottom: '4px' }}>
                                <strong>Type:</strong> {(() => {
                                  console.log('ProjectDetails: details.collaborativeTemplateId =', details.collaborativeTemplateId);
                                  return details.collaborativeTemplateId ? getCollaborativeTemplateName(details.collaborativeTemplateId) : 'Custom Project';
                                })()}
                            </div>
                            <div style={{ color: 'var(--jp-ui-font-color1)', marginBottom: '4px' }}>
                                <strong>Creator:</strong> {details.creator.slice(0, 6)}...{details.creator.slice(-4)}
                            </div>
                            <div style={{ color: 'var(--jp-ui-font-color1)', marginBottom: '4px' }}>
                                <strong>Created:</strong> {new Date(details.createdAt * 1000).toLocaleDateString()}
                            </div>
                            <div style={{ color: 'var(--jp-ui-font-color1)' }}>
                                <strong>Members:</strong> {details.memberCount}
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1 }}>
                        <h3 style={{
                            color: 'var(--jp-ui-font-color1)',
                            marginBottom: '8px'
                        }}>
                            Available Roles
                        </h3>
                        <div style={{
                            padding: '12px',
                            background: 'var(--jp-layout-color0)',
                            border: '1px solid var(--jp-border-color2)',
                            borderRadius: '3px'
                        }}>
                            {details.availableRoles.map((role, index) => (
                                <div
                                    key={index}
                                    style={{
                                        color: 'var(--jp-ui-font-color1)',
                                        padding: '2px 0'
                                    }}
                                >
                                    • {role}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 style={{
                        color: 'var(--jp-ui-font-color1)',
                        marginBottom: '12px'
                    }}>
                        Team Members
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {details.members.map((member, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '12px',
                                    background: 'var(--jp-layout-color0)',
                                    border: '1px solid var(--jp-border-color2)',
                                    borderRadius: '3px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <div style={{
                                        color: 'var(--jp-ui-font-color1)',
                                        fontWeight: 'bold'
                                    }}>
                                        {member.address.slice(0, 6)}...{member.address.slice(-4)}
                                        {member.address === details.creator && ' (Owner)'}
                                    </div>
                                    <div style={{
                                        color: 'var(--jp-ui-font-color2)',
                                        fontSize: '12px'
                                    }}>
                                        Joined: {new Date(member.joinedAt * 1000).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{
                                    background: 'var(--jp-brand-color1)',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                }}>
                                    {member.role}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Join Requests Section - Only visible to project creators */}
                <PendingJoinRequests 
                    projectAddress={projectAddress}
                    isCreator={account === details.creator}
                    onMembershipChange={onMembershipChange}
                />
            </div>
        </div>
    );
};

export default ProjectDetails;