import React, { useState } from 'react';
import { CollaborativeTemplate, useProjects } from '../../hooks/useProjects';

interface CreateProjectFromTemplateProps {
  template: CollaborativeTemplate;
  onBack: () => void;
  onSuccess: () => void;
}

export const CreateProjectFromTemplate: React.FC<CreateProjectFromTemplateProps> = ({
  template,
  onBack,
  onSuccess
}) => {
  const [objective, setObjective] = useState('');
  const [selectedRole, setSelectedRole] = useState(template.defaultOwnerRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createProjectFromCollaborativeTemplate } = useProjects();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!objective.trim()) {
      setError('Project objective is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await createProjectFromCollaborativeTemplate(template.id, objective.trim(), selectedRole);
      if (success) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'var(--jp-layout-color1)',
      padding: '20px',
      fontFamily: 'var(--jp-ui-font-family)',
      minHeight: '400px'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={onBack}
          disabled={loading}
          style={{
            padding: '6px 12px',
            background: 'var(--jp-layout-color2)',
            border: '1px solid var(--jp-border-color1)',
            borderRadius: '3px',
            cursor: loading ? 'not-allowed' : 'pointer',
            color: 'var(--jp-ui-font-color1)',
            fontSize: '12px',
            opacity: loading ? 0.6 : 1
          }}
        >
          ← Back to Collaborative D-Apps
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '1.5rem',
          color: 'var(--jp-ui-font-color1)',
          margin: '0 0 8px 0'
        }}>
          Create {template.name} Project
        </h1>
        <p style={{
          color: 'var(--jp-ui-font-color2)',
          margin: 0,
          fontSize: '14px'
        }}>
          {template.description}
        </p>
      </div>

      {/* Template info */}
      <div style={{
        background: 'var(--jp-layout-color0)',
        border: '1px solid var(--jp-border-color2)',
        borderRadius: '4px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <h3 style={{
          color: 'var(--jp-ui-font-color1)',
          margin: '0 0 12px 0',
          fontSize: '1rem'
        }}>
          Template: {template.name}
        </h3>
        
        <div style={{ marginBottom: '12px' }}>
          <strong style={{
            color: 'var(--jp-ui-font-color1)',
            fontSize: '12px'
          }}>
            Available Roles:
          </strong>
        </div>
        
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px'
        }}>
          {template.availableRoles.map((role, index) => (
            <span
              key={index}
              style={{
                padding: '2px 6px',
                background: role === template.defaultOwnerRole ? 'var(--jp-brand-color1)' : 'var(--jp-ui-font-color3)',
                color: role === template.defaultOwnerRole ? 'white' : 'var(--jp-layout-color0)',
                fontSize: '10px',
                borderRadius: '8px',
                fontWeight: role === template.defaultOwnerRole ? 'bold' : 'normal'
              }}
            >
              {role} {role === template.defaultOwnerRole && '(Default Owner)'}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            color: 'var(--jp-ui-font-color1)',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Project Objective *
          </label>
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            disabled={loading}
            placeholder="Describe the objective of your project..."
            rows={3}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'var(--jp-layout-color0)',
              border: '1px solid var(--jp-border-color2)',
              borderRadius: '3px',
              color: 'var(--jp-ui-font-color1)',
              fontSize: '14px',
              fontFamily: 'var(--jp-ui-font-family)',
              resize: 'vertical',
              minHeight: '80px',
              cursor: loading ? 'not-allowed' : 'text',
              opacity: loading ? 0.6 : 1
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            color: 'var(--jp-ui-font-color1)',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Your Role *
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'var(--jp-layout-color0)',
              border: '1px solid var(--jp-border-color2)',
              borderRadius: '3px',
              color: 'var(--jp-ui-font-color1)',
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {template.availableRoles.map((role) => (
              <option key={role} value={role}>
                {role} {role === template.defaultOwnerRole && '(Recommended)'}
              </option>
            ))}
          </select>
          <div style={{
            fontSize: '12px',
            color: 'var(--jp-ui-font-color2)',
            marginTop: '4px'
          }}>
            As the project creator, you'll have full control over the project regardless of your role.
          </div>
        </div>

        {error && (
          <div style={{
            background: 'var(--jp-error-color3)',
            border: '1px solid var(--jp-error-color1)',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              color: 'var(--jp-error-color1)',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Error
            </div>
            <div style={{
              color: 'var(--jp-ui-font-color2)',
              fontSize: '12px',
              marginTop: '4px'
            }}>
              {error}
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '20px',
          borderTop: '1px solid var(--jp-border-color2)'
        }}>
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            style={{
              padding: '10px 16px',
              background: 'var(--jp-layout-color2)',
              border: '1px solid var(--jp-border-color1)',
              borderRadius: '3px',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: 'var(--jp-ui-font-color1)',
              fontSize: '13px',
              opacity: loading ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !objective.trim()}
            style={{
              padding: '10px 20px',
              background: loading || !objective.trim() ? 'var(--jp-ui-font-color3)' : 'var(--jp-brand-color1)',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: loading || !objective.trim() ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              opacity: loading || !objective.trim() ? 0.6 : 1
            }}
          >
            {loading ? 'Creating Project...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectFromTemplate;
