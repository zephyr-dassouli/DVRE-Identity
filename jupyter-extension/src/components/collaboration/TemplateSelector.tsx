import React, { useState } from 'react';
import { CollaborativeTemplate } from '../../hooks/useProjects';

interface TemplateSelectorProps {
  templates: CollaborativeTemplate[];
  onSelectTemplate: (template: CollaborativeTemplate) => void;
  onCreateCustom: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  onSelectTemplate,
  onCreateCustom,
  onCancel,
  loading = false
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CollaborativeTemplate | null>(null);

  const handleTemplateClick = (template: CollaborativeTemplate) => {
    setSelectedTemplate(template);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
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
          onClick={onCancel}
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

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '1.5rem',
          color: 'var(--jp-ui-font-color1)',
          margin: '0 0 8px 0'
        }}>
          Create New Project
        </h1>
        <p style={{
          color: 'var(--jp-ui-font-color2)',
          margin: 0,
          fontSize: '14px'
        }}>
          Choose a project template to get started quickly, or create a custom project.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ color: 'var(--jp-ui-font-color2)' }}>Loading templates...</div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              color: 'var(--jp-ui-font-color1)',
              marginBottom: '16px',
              fontSize: '1.1rem'
            }}>
              Project Templates
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
              marginBottom: '20px'
            }}>
              {templates.filter(t => t.isActive).map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  style={{
                    padding: '16px',
                    background: selectedTemplate?.id === template.id ? 'var(--jp-brand-color3)' : 'var(--jp-layout-color0)',
                    border: selectedTemplate?.id === template.id ? '2px solid var(--jp-brand-color1)' : '1px solid var(--jp-border-color2)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTemplate?.id !== template.id) {
                      e.currentTarget.style.background = 'var(--jp-layout-color2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTemplate?.id !== template.id) {
                      e.currentTarget.style.background = 'var(--jp-layout-color0)';
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <h4 style={{
                      color: 'var(--jp-ui-font-color1)',
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}>
                      {template.name}
                    </h4>
                    {selectedTemplate?.id === template.id && (
                      <div style={{
                        color: 'var(--jp-brand-color1)',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        Selected
                      </div>
                    )}
                  </div>
                  
                  <p style={{
                    color: 'var(--jp-ui-font-color2)',
                    margin: '0 0 12px 0',
                    fontSize: '13px',
                    lineHeight: '1.4'
                  }}>
                    {template.description}
                  </p>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{
                      color: 'var(--jp-ui-font-color1)',
                      fontSize: '12px'
                    }}>
                      Roles:
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
                        {role} {role === template.defaultOwnerRole && '(Owner)'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 0',
            borderTop: '1px solid var(--jp-border-color2)'
          }}>
            <button
              onClick={onCreateCustom}
              style={{
                padding: '10px 16px',
                background: 'var(--jp-layout-color2)',
                border: '1px solid var(--jp-border-color1)',
                borderRadius: '3px',
                cursor: 'pointer',
                color: 'var(--jp-ui-font-color1)',
                fontSize: '13px'
              }}
            >
              Create Custom Project
            </button>

            <button
              onClick={handleContinue}
              disabled={!selectedTemplate}
              style={{
                padding: '10px 20px',
                background: selectedTemplate ? 'var(--jp-brand-color1)' : 'var(--jp-ui-font-color3)',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: selectedTemplate ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                opacity: selectedTemplate ? 1 : 0.6
              }}
            >
              Continue with {selectedTemplate?.name || 'Selected Template'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TemplateSelector;
