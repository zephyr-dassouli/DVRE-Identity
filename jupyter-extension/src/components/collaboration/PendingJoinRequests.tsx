import React, { useState, useEffect } from 'react';
import { useProjects } from '../../hooks/useProjects';

interface JoinRequest {
  requester: string;
  requestedRole: string;
  requestedAt: number;
  isPending: boolean;
}

interface PendingJoinRequestsProps {
  projectAddress: string;
  isCreator: boolean;
  onMembershipChange?: () => void;
}

export const PendingJoinRequests: React.FC<PendingJoinRequestsProps> = ({
  projectAddress,
  isCreator,
  onMembershipChange
}) => {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { getPendingJoinRequests, approveJoinRequest, rejectJoinRequest } = useProjects();

  const loadRequests = async () => {
    if (!isCreator) return;
    
    setLoading(true);
    try {
      const pendingRequests = await getPendingJoinRequests(projectAddress);
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Failed to load join requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [projectAddress, isCreator]);

  const handleApprove = async (requesterAddress: string) => {
    setActionLoading(requesterAddress + '-approve');
    try {
      const success = await approveJoinRequest(projectAddress, requesterAddress);
      if (success) {
        // Refresh requests after approval
        await loadRequests();
        // Notify parent component about membership change
        if (onMembershipChange) {
          onMembershipChange();
        }
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requesterAddress: string) => {
    setActionLoading(requesterAddress + '-reject');
    try {
      const success = await rejectJoinRequest(projectAddress, requesterAddress);
      if (success) {
        // Refresh requests after rejection
        await loadRequests();
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isCreator) {
    return null;
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{
        color: 'var(--jp-ui-font-color1)',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Pending Join Requests
          {requests.length > 0 && (
            <span style={{
              background: 'var(--jp-warn-color1)',
              color: 'white',
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '10px',
              fontWeight: 'bold'
            }}>
              {requests.length}
            </span>
          )}
        </div>
        <button
          onClick={loadRequests}
          disabled={loading}
          style={{
            padding: '4px 8px',
            background: 'var(--jp-layout-color2)',
            border: '1px solid var(--jp-border-color1)',
            borderRadius: '3px',
            cursor: loading ? 'not-allowed' : 'pointer',
            color: 'var(--jp-ui-font-color1)',
            fontSize: '11px',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⟳ Refreshing...' : '⟳ Refresh'}
        </button>
      </h3>

      {loading ? (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: 'var(--jp-ui-font-color2)',
          background: 'var(--jp-layout-color0)',
          border: '1px solid var(--jp-border-color2)',
          borderRadius: '3px'
        }}>
          Loading join requests...
        </div>
      ) : requests.length === 0 ? (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: 'var(--jp-ui-font-color2)',
          background: 'var(--jp-layout-color0)',
          border: '1px solid var(--jp-border-color2)',
          borderRadius: '3px'
        }}>
          No pending join requests
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {requests.map((request, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                background: 'var(--jp-layout-color0)',
                border: '1px solid var(--jp-border-color2)',
                borderRadius: '3px'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div>
                  <div style={{
                    color: 'var(--jp-ui-font-color1)',
                    fontWeight: 'bold',
                    marginBottom: '4px'
                  }}>
                    {request.requester.slice(0, 8)}...{request.requester.slice(-6)}
                  </div>
                  <div style={{
                    color: 'var(--jp-ui-font-color2)',
                    fontSize: '12px',
                    marginBottom: '4px'
                  }}>
                    Requested: {new Date(request.requestedAt * 1000).toLocaleDateString()} at{' '}
                    {new Date(request.requestedAt * 1000).toLocaleTimeString()}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    background: 'var(--jp-brand-color1)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    Role: {request.requestedRole}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleApprove(request.requester)}
                    disabled={actionLoading !== null}
                    style={{
                      padding: '6px 12px',
                      background: actionLoading === request.requester + '-approve' 
                        ? 'var(--jp-ui-font-color3)' 
                        : 'var(--jp-success-color1)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      opacity: actionLoading ? 0.6 : 1
                    }}
                  >
                    {actionLoading === request.requester + '-approve' ? 'Approving...' : '✓ Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(request.requester)}
                    disabled={actionLoading !== null}
                    style={{
                      padding: '6px 12px',
                      background: actionLoading === request.requester + '-reject' 
                        ? 'var(--jp-ui-font-color3)' 
                        : 'var(--jp-error-color1)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      opacity: actionLoading ? 0.6 : 1
                    }}
                  >
                    {actionLoading === request.requester + '-reject' ? 'Rejecting...' : '✗ Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingJoinRequests;
