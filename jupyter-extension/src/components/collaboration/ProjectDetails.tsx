import React, { useState, useEffect, useCallback } from 'react';
import { ProjectDetails as ProjectDetailsType, useProjects } from '../../hooks/useProjects';
import { useAuth } from '../../hooks/useAuth';

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
    const [actionLoading, setActionLoading] = useState(false);
    const [showJsonModal, setShowJsonModal] = useState(false);
    const { getProjectInfo, handleJoinRequest } = useProjects();
    const { account } = useAuth();

    // Toggle JSON viewer modal
    const toggleJsonModal = () => {
        setShowJsonModal(!showJsonModal);
    };
    
    // Memoize the loadDetails function to prevent infinite re-renders
    const loadDetails = useCallback(async () => {
        if (!projectAddress) return;
        
        try {
            console.log('Loading project details for:', projectAddress);
            setLoading(true);
            setError(null);
            
            const projectDetails = await getProjectInfo(projectAddress);
            console.log('Project details loaded:', projectDetails);
            
            if (projectDetails) {
                // Add availableRoles for ProjectDetails compatibility
                const detailsWithRoles = {
                    ...projectDetails,
                    availableRoles: ['Researcher', 'Data Provider', 'Analyst', 'Contributor']
                };
                setDetails(detailsWithRoles);
            }
        } catch (err) {
            console.error('Error loading project details:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [projectAddress, getProjectInfo]);

    // Helper functions for approve/reject
    const handleApproveRequest = useCallback(async (memberAddress: string) => {
        if (!details) return;
        
        setActionLoading(true);
        try {
            const success = await handleJoinRequest(projectAddress, memberAddress, true);
            if (success) {
                // Reload project details
                await loadDetails();
                onMembershipChange?.();
            }
        } catch (err: any) {
            console.error('Failed to approve request:', err);
            setError(`Failed to approve request: ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    }, [details, handleJoinRequest, projectAddress, onMembershipChange, loadDetails]);

    const handleRejectRequest = useCallback(async (memberAddress: string) => {
        if (!details) return;
        
        setActionLoading(true);
        try {
            const success = await handleJoinRequest(projectAddress, memberAddress, false);
            if (success) {
                // Reload project details
                await loadDetails();
                onMembershipChange?.();
            }
        } catch (err: any) {
            console.error('Failed to reject request:', err);
            setError(`Failed to reject request: ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    }, [details, handleJoinRequest, projectAddress, onMembershipChange, loadDetails]);

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
            {/* JSON Viewer Modal */}
            {showJsonModal && details && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }} onClick={toggleJsonModal}>
                    <div 
                        style={{
                            background: 'var(--jp-layout-color0)',
                            padding: '20px',
                            borderRadius: '4px',
                            width: '80%',
                            maxWidth: '800px',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            zIndex: 1001
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <h3 style={{ margin: 0, color: 'var(--jp-ui-font-color1)' }}>
                                Project JSON Data
                            </h3>
                            <button 
                                onClick={toggleJsonModal}
                                style={{
                                    background: 'var(--jp-layout-color2)',
                                    border: '1px solid var(--jp-border-color1)',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    color: 'var(--jp-ui-font-color1)'
                                }}
                            >
                                Close
                            </button>
                        </div>
                        <pre style={{ 
                            padding: '12px', 
                            background: 'var(--jp-layout-color1)',
                            border: '1px solid var(--jp-border-color2)',
                            borderRadius: '4px',
                            color: 'var(--jp-ui-font-color1)',
                            overflow: 'auto',
                            fontSize: '14px',
                            lineHeight: '1.4',
                            maxHeight: 'calc(80vh - 100px)'
                        }}>
                            {JSON.stringify(details.projectData, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
            
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
                                <strong>Type:</strong> {details.projectData?.type || 'General Project'}
                            </div>
                            <div style={{ color: 'var(--jp-ui-font-color1)', marginBottom: '4px' }}>
                                <strong>Creator:</strong> {details.creator.slice(0, 6)}...{details.creator.slice(-4)}
                            </div>
                            <div style={{ color: 'var(--jp-ui-font-color1)', marginBottom: '4px' }}>
                                <strong>Created:</strong> {new Date(details.created * 1000).toLocaleDateString()}
                            </div>
                            <div style={{ color: 'var(--jp-ui-font-color1)', marginBottom: '12px' }}>
                                <strong>Members:</strong> {details.memberCount}
                            </div>
                            <button 
                                onClick={toggleJsonModal}
                                style={{
                                    background: 'var(--jp-brand-color1)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 10px',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    width: '100%',
                                    justifyContent: 'center',
                                    marginTop: '8px'
                                }}
                            >
                                <span style={{ fontSize: '14px' }}>{ '{' } { '}' }</span>
                                View Project JSON
                            </button>
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
                        {/* Show owner with their role from the JSON */}
                        {details.participants.filter(participant => participant.address.toLowerCase() === details.creator.toLowerCase())
                            .map((ownerParticipant, index) => (
                            <div
                                key={`owner-${index}`}
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
                                        {ownerParticipant.address.slice(0, 6)}...{ownerParticipant.address.slice(-4)} (Owner)
                                    </div>
                                    <div style={{
                                        color: 'var(--jp-ui-font-color2)',
                                        fontSize: '12px'
                                    }}>
                                        Role: {ownerParticipant.role}
                                    </div>
                                </div>
                                <div style={{
                                    background: '#6f42c1',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                }}>
                                    {ownerParticipant.role}
                                </div>
                            </div>
                        ))}
                        
                        {/* Show other participants (excluding owner) */}
                        {details.participants.filter(participant => participant.address.toLowerCase() !== details.creator.toLowerCase())
                            .map((participant, index) => (
                            <div
                                key={`participant-${index}`}
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
                                        {participant.address.slice(0, 6)}...{participant.address.slice(-4)}
                                    </div>
                                    <div style={{
                                        color: 'var(--jp-ui-font-color2)',
                                        fontSize: '12px'
                                    }}>
                                        Role: {participant.role}
                                    </div>
                                </div>
                                <div style={{
                                    background: 'var(--jp-brand-color1)',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                }}>
                                    {participant.role}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Join Requests Section - Only visible to project creators */}
                {account === details.creator && (
                    <div style={{ marginTop: '24px' }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: '12px' 
                        }}>
                            <h3 style={{
                                color: 'var(--jp-ui-font-color1)',
                                margin: '0',
                                fontSize: '1.1rem'
                            }}>
                                Pending Join Requests
                            </h3>
                            <button
                                onClick={loadDetails}
                                disabled={loading || actionLoading}
                                style={{
                                    padding: '6px 12px',
                                    background: 'var(--jp-brand-color1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: (loading || actionLoading) ? 'not-allowed' : 'pointer',
                                    fontSize: '12px',
                                    opacity: (loading || actionLoading) ? 0.6 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                {loading ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>
                        <div style={{
                            background: 'var(--jp-layout-color2)',
                            border: '1px solid var(--jp-border-color1)',
                            borderRadius: '3px',
                            padding: '16px'
                        }}>
                            {details.joinRequests.length === 0 ? (
                                <p style={{ 
                                    color: 'var(--jp-ui-font-color2)',
                                    fontStyle: 'italic',
                                    margin: 0
                                }}>
                                    No pending join requests
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {details.joinRequests.map((request, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px',
                                            background: 'var(--jp-layout-color0)',
                                            border: '1px solid var(--jp-border-color2)',
                                            borderRadius: '3px'
                                        }}>
                                            <div>
                                                <div style={{ color: 'var(--jp-ui-font-color1)', fontWeight: 'bold' }}>
                                                    {request.requester.slice(0, 6)}...{request.requester.slice(-4)}
                                                </div>
                                                <div style={{ color: 'var(--jp-ui-font-color2)', fontSize: '12px' }}>
                                                    Role: {request.role}
                                                </div>
                                                <div style={{ color: 'var(--jp-ui-font-color3)', fontSize: '11px' }}>
                                                    Requested: {new Date(request.timestamp * 1000).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleApproveRequest(request.requester)}
                                                    disabled={actionLoading}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#28a745',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                                                        fontSize: '12px',
                                                        opacity: actionLoading ? 0.6 : 1,
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {actionLoading ? 'Processing...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(request.requester)}
                                                    disabled={actionLoading}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#dc3545',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                                                        fontSize: '12px',
                                                        opacity: actionLoading ? 0.6 : 1,
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {actionLoading ? 'Processing...' : 'Reject'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetails;