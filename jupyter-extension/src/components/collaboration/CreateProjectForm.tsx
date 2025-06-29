import React, { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';

export const CreateProjectForm: React.FC = () => {
  const [objective, setObjective] = useState('');
  const [rolesInput, setRolesInput] = useState('');
  const [ownerRole, setOwnerRole] = useState('');
  const { createProject, loading } = useProjects();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!objective.trim() || !rolesInput.trim() || !ownerRole.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const roles = rolesInput.split(',').map(role => role.trim()).filter(role => role.length > 0);
    
    if (roles.length === 0) {
      alert('Please provide at least one role');
      return;
    }

    if (!roles.includes(ownerRole)) {
      alert('Owner role must be one of the available roles');
      return;
    }

    const success = await createProject(objective, roles, ownerRole);
    if (success) {
      setObjective('');
      setRolesInput('');
      setOwnerRole('');
      alert('Project created successfully!');
    }
  };

  return (
    <div style={{
      background: 'var(--jp-layout-color1)',
      border: '1px solid var(--jp-border-color1)',
      borderRadius: '4px',
      padding: '16px',
      maxWidth: '400px'
    }}>
      <h3 style={{ 
        margin: '0 0 16px 0',
        color: 'var(--jp-ui-font-color1)'
      }}>
        Create New Project
      </h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '4px',
            color: 'var(--jp-ui-font-color1)',
            fontSize: '13px'
          }}>
            Project Objective:
          </label>
          <input
            type="text"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Enter project objective..."
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--jp-border-color1)',
              borderRadius: '3px',
              background: 'var(--jp-layout-color0)',
              color: 'var(--jp-ui-font-color1)',
              fontSize: '13px'
            }}
            disabled={loading}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '4px',
            color: 'var(--jp-ui-font-color1)',
            fontSize: '13px'
          }}>
            Available Roles (comma-separated):
          </label>
          <input
            type="text"
            value={rolesInput}
            onChange={(e) => setRolesInput(e.target.value)}
            placeholder="Developer, Designer, Manager"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--jp-border-color1)',
              borderRadius: '3px',
              background: 'var(--jp-layout-color0)',
              color: 'var(--jp-ui-font-color1)',
              fontSize: '13px'
            }}
            disabled={loading}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '4px',
            color: 'var(--jp-ui-font-color1)',
            fontSize: '13px'
          }}>
            Your Role:
          </label>
          <input
            type="text"
            value={ownerRole}
            onChange={(e) => setOwnerRole(e.target.value)}
            placeholder="Enter your role..."
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--jp-border-color1)',
              borderRadius: '3px',
              background: 'var(--jp-layout-color0)',
              color: 'var(--jp-ui-font-color1)',
              fontSize: '13px'
            }}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: loading ? 'var(--jp-layout-color2)' : 'var(--jp-brand-color1)',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '13px'
          }}
        >
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  );
};

export default CreateProjectForm;