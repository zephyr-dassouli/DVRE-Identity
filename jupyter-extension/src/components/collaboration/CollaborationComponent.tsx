import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProjects, ProjectInfo } from '../../hooks/useProjects';
import CreateProjectForm from './CreateProjectForm';
import ProjectList from './ProjectList';
import ProjectDetails from './ProjectDetails';

type ViewMode = 'main' | 'create' | 'details';

interface CollaborationComponentProps {
  title?: string;
}

export const CollaborationComponent: React.FC<CollaborationComponentProps> = ({ 
  title = 'Project Collaboration' 
}) => {
  const { account } = useAuth();
  const { projects, userProjects, loading, error } = useProjects();
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const handleSelectProject = (project: ProjectInfo) => {
    setSelectedProject(project.address);
    setViewMode('details');
  };

  const handleBackToMain = () => {
    setViewMode('main');
    setSelectedProject(null);
  };

  if (!account) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        fontFamily: 'var(--jp-ui-font-family)',
        background: 'var(--jp-layout-color1)',
        minHeight: '400px'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem',
          color: 'var(--jp-ui-font-color1)',
          margin: '0 0 16px 0'
        }}>
          Project Collaboration
        </h1>
        <p style={{ 
          color: 'var(--jp-ui-font-color2)'
        }}>
          Please connect your wallet to access project collaboration features.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: 'var(--jp-error-color1)'
      }}>
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (viewMode === 'details' && selectedProject) {
    return (
      <div style={{ 
        padding: '20px', 
        fontFamily: 'var(--jp-ui-font-family)',
        background: 'var(--jp-layout-color1)',
        minHeight: '400px'
      }}>
        <ProjectDetails 
          projectAddress={selectedProject}
          onBack={handleBackToMain}
        />
      </div>
    );
  }

  if (viewMode === 'create') {
    return (
      <div style={{ 
        padding: '20px', 
        fontFamily: 'var(--jp-ui-font-family)',
        background: 'var(--jp-layout-color1)',
        minHeight: '400px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={handleBackToMain}
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

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'var(--jp-ui-font-family)',
      background: 'var(--jp-layout-color1)',
      minHeight: '400px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem',
          color: 'var(--jp-ui-font-color1)',
          margin: 0
        }}>
          Project Collaboration
        </h1>
        <button
          onClick={() => setViewMode('create')}
          style={{
            padding: '8px 16px',
            background: 'var(--jp-brand-color1)',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          + New Project
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <ProjectList
          projects={userProjects}
          title="My Projects"
          onSelectProject={handleSelectProject}
          loading={loading}
        />
        
        <ProjectList
          projects={projects.filter(p => !p.isMember)}
          title="Available Projects"
          onSelectProject={handleSelectProject}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CollaborationComponent;