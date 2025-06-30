import React, { useState, useEffect } from 'react';
import { useProjects, CollaborativeTemplate } from '../../hooks/useProjects';
import TemplateSelector from './TemplateSelector';
import CreateProjectFromTemplate from './CreateProjectFromTemplate';
import CreateProjectForm from './CreateProjectForm';

type CreationMode = 'choose' | 'from-collaborative-template' | 'custom';

interface ProjectCreationHubProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const ProjectCreationHub: React.FC<ProjectCreationHubProps> = ({
  onBack,
  onSuccess
}) => {
  const [creationMode, setCreationMode] = useState<CreationMode>('choose');
  const [selectedCollaborativeTemplate, setSelectedCollaborativeTemplate] = useState<CollaborativeTemplate | null>(null);
  const { collaborativeTemplates, loadCollaborativeTemplates, loading: collaborativeTemplatesLoading } = useProjects();

  useEffect(() => {
    loadCollaborativeTemplates();
  }, [loadCollaborativeTemplates]);

  const handleCollaborativeTemplateSelect = (collaborativeTemplate: CollaborativeTemplate) => {
    setSelectedCollaborativeTemplate(collaborativeTemplate);
    setCreationMode('from-collaborative-template');
  };

  const handleBackToChoose = () => {
    setCreationMode('choose');
    setSelectedCollaborativeTemplate(null);
  };

  if (creationMode === 'from-collaborative-template' && selectedCollaborativeTemplate) {
    return (
      <CreateProjectFromTemplate
        template={selectedCollaborativeTemplate}
        onBack={handleBackToChoose}
        onSuccess={onSuccess}
      />
    );
  }

  if (creationMode === 'custom') {
    return (
      <div style={{
        background: 'var(--jp-layout-color1)',
        padding: '20px',
        fontFamily: 'var(--jp-ui-font-family)',
        minHeight: '400px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={handleBackToChoose}
            style={{
              padding: '6px 12px',
              background: 'var(--jp-layout-color2)',
              border: '1px solid var(--jp-border-color1)',
              borderRadius: '3px',
              cursor: 'pointer',
              color: 'var(--jp-ui-font-color1)',
              fontSize: '12px',
              marginRight: '12px'
            }}
          >
            ← Back to Options
          </button>
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
            ← Back to Projects
          </button>
        </div>
        <CreateProjectForm />
      </div>
    );
  }

  // Choose creation mode
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
          ← Back to Projects
        </button>
      </div>

      <h2 style={{
        fontSize: '1.3rem',
        color: 'var(--jp-ui-font-color1)',
        margin: '0 0 24px 0'
      }}>
        Create New Project
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Template-based creation */}
        <div style={{
          background: 'var(--jp-layout-color0)',
          border: '1px solid var(--jp-border-color1)',
          borderRadius: '6px',
          padding: '20px'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            color: 'var(--jp-ui-font-color1)',
            margin: '0 0 12px 0'
          }}>
            Collaborative D-App
          </h3>
          <p style={{
            color: 'var(--jp-ui-font-color2)',
            fontSize: '13px',
            margin: '0 0 16px 0',
            lineHeight: '1.4'
          }}>
            Create a project using a predefined collaborative template (e.g., Federated Learning) that includes specific roles and objectives.
          </p>
          <button
            onClick={() => setCreationMode('from-collaborative-template')}
            disabled={collaborativeTemplatesLoading || collaborativeTemplates.length === 0}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: collaborativeTemplates.length > 0 ? 'var(--jp-brand-color1)' : 'var(--jp-layout-color2)',
              color: collaborativeTemplates.length > 0 ? 'white' : 'var(--jp-ui-font-color2)',
              border: 'none',
              borderRadius: '4px',
              cursor: collaborativeTemplates.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            {collaborativeTemplatesLoading ? 'Loading Templates...' : 
             collaborativeTemplates.length === 0 ? 'No Templates Available' : 
             `Browse ${collaborativeTemplates.length} Template${collaborativeTemplates.length !== 1 ? 's' : ''}`}
          </button>
        </div>

        {/* Custom creation */}
        <div style={{
          background: 'var(--jp-layout-color0)',
          border: '1px solid var(--jp-border-color1)',
          borderRadius: '6px',
          padding: '20px'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            color: 'var(--jp-ui-font-color1)',
            margin: '0 0 12px 0'
          }}>
            Custom Project
          </h3>
          <p style={{
            color: 'var(--jp-ui-font-color2)',
            fontSize: '13px',
            margin: '0 0 16px 0',
            lineHeight: '1.4'
          }}>
            Create a project from scratch by defining your own objective, roles, and project structure.
          </p>
          <button
            onClick={() => setCreationMode('custom')}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: 'var(--jp-accent-color1)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            Create Custom Project
          </button>
        </div>
      </div>

      {/* Collaborative template selector when in collaborative template mode */}
      {creationMode === 'from-collaborative-template' && (
        <div>
          <TemplateSelector
            templates={collaborativeTemplates}
            onSelectTemplate={handleCollaborativeTemplateSelect}
            onCreateCustom={() => setCreationMode('custom')}
            onCancel={handleBackToChoose}
            loading={collaborativeTemplatesLoading}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectCreationHub;
