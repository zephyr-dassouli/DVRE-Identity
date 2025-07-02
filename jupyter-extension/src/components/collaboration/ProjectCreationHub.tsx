import React, { useState, useEffect } from 'react';
import { useProjects, ProjectTemplate } from '../../hooks/useProjects';

type CreationMode = 'quick' | 'template' | 'custom' | 'custom-builder';

interface ProjectCreationHubProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface CustomField {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
}

export const ProjectCreationHub: React.FC<ProjectCreationHubProps> = ({
  onBack,
  onSuccess
}) => {
  const [creationMode, setCreationMode] = useState<CreationMode>('quick');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const { 
    templates, 
    loading: templatesLoading, 
    error: projectError,
    createProjectFromTemplate,
    createCustomProject,
    loadTemplates
  } = useProjects();

  const [formData, setFormData] = useState({
    projectId: '',
    objective: '',
    description: '',
    projectData: ''
  });

  const [customFields, setCustomFields] = useState<CustomField[]>([
    { key: 'project_id', value: '', type: 'string' },
    { key: 'objective', value: '', type: 'string' },
    { key: 'description', value: '', type: 'string' }
  ]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleQuickCreate = async () => {
    if (!formData.projectId || !formData.objective) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const projectData = {
        project_id: formData.projectId,
        objective: formData.objective,
        description: formData.description || 'Quick-created project',
        type: 'general',
        created_at: new Date().toISOString(),
      };

      const projectAddress = await createCustomProject(projectData);

      if (projectAddress) {
        alert(`Project created successfully!\nAddress: ${projectAddress}`);
        onSuccess();
      } else {
        setError('Failed to create project');
      }
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setError(`Failed to create project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateCreate = async () => {
    if (!selectedTemplate || !formData.projectData) {
      setError('Please select a template and provide project data');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const projectData = JSON.parse(formData.projectData);
      const projectAddress = await createProjectFromTemplate(selectedTemplate.id, projectData);

      if (projectAddress) {
        alert(`Project created successfully!\nAddress: ${projectAddress}`);
        onSuccess();
      } else {
        setError('Failed to create project');
      }
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setError(`Failed to create project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomJSONCreate = async () => {
    if (!formData.projectData) {
      setError('Please provide project data');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const projectData = JSON.parse(formData.projectData);
      const projectAddress = await createCustomProject(projectData);

      if (projectAddress) {
        alert(`Custom project created successfully!\nAddress: ${projectAddress}`);
        onSuccess();
      } else {
        setError('Failed to create project');
      }
    } catch (err: any) {
      console.error('Failed to create custom project:', err);
      setError(`Failed to create project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomBuilderCreate = async () => {
    setLoading(true);
    setError(null);

    try {
      const projectData: any = {};
      
      // Convert custom fields to project data
      customFields.forEach(field => {
        if (field.key && field.value !== '') {
          let value = field.value;
          
          // Type conversion
          if (field.type === 'number') {
            value = Number(field.value);
          } else if (field.type === 'boolean') {
            value = field.value === 'true' || field.value === true;
          } else if (field.type === 'array') {
            try {
              value = JSON.parse(field.value);
              if (!Array.isArray(value)) {
                value = field.value.split(',').map((s: string) => s.trim());
              }
            } catch {
              value = field.value.split(',').map((s: string) => s.trim());
            }
          } else if (field.type === 'object') {
            try {
              value = JSON.parse(field.value);
            } catch {
              value = field.value;
            }
          }
          
          projectData[field.key] = value;
        }
      });

      if (!projectData.project_id || !projectData.objective) {
        setError('Project ID and Objective are required');
        return;
      }

      projectData.created_at = new Date().toISOString();
      const projectAddress = await createCustomProject(projectData);

      if (projectAddress) {
        alert(`Project created successfully!\nAddress: ${projectAddress}`);
        onSuccess();
      } else {
        setError('Failed to create project');
      }
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setError(`Failed to create project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({ ...prev, projectData: template.exampleJSON }));
  };

  const addCustomField = () => {
    setCustomFields(prev => [...prev, { key: '', value: '', type: 'string' }]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, field: Partial<CustomField>) => {
    setCustomFields(prev => 
      prev.map((f, i) => i === index ? { ...f, ...field } : f)
    );
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'var(--jp-ui-font-family)',
      background: 'var(--jp-layout-color1)',
      minHeight: '500px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ 
          fontSize: '1.3rem',
          color: 'var(--jp-ui-font-color1)',
          margin: 0
        }}>
          Create New Project
        </h2>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            background: 'var(--jp-layout-color2)',
            border: '1px solid var(--jp-border-color1)',
            borderRadius: '3px',
            cursor: 'pointer',
            color: 'var(--jp-ui-font-color1)',
            fontSize: '13px'
          }}
        >
          ← Back
        </button>
      </div>

      {(error || projectError) && (
        <div style={{
          background: 'var(--jp-error-color3)',
          border: '1px solid var(--jp-error-color1)',
          borderRadius: '3px',
          padding: '12px',
          marginBottom: '20px',
          color: 'var(--jp-error-color1)'
        }}>
          {error || projectError}
        </div>
      )}

      {/* Creation Mode Selector */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: 'var(--jp-ui-font-color1)' }}>
          Choose Creation Method
        </h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {(['quick', 'template', 'custom', 'custom-builder'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setCreationMode(mode)}
              style={{
                padding: '8px 16px',
                background: creationMode === mode ? 'var(--jp-brand-color1)' : 'var(--jp-layout-color2)',
                color: creationMode === mode ? 'white' : 'var(--jp-ui-font-color1)',
                border: '1px solid var(--jp-border-color1)',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              {mode === 'quick' ? 'Quick Create' : 
               mode === 'template' ? 'From Template' : 
               mode === 'custom' ? 'Custom JSON' : 
               'Custom Builder'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Create Form */}
      {creationMode === 'quick' && (
        <div style={{ background: 'var(--jp-layout-color2)', padding: '20px', borderRadius: '3px' }}>
          <h4 style={{ marginBottom: '15px', color: 'var(--jp-ui-font-color1)' }}>Quick Create</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--jp-ui-font-color2)' }}>
                Project ID *
              </label>
              <input
                type="text"
                value={formData.projectId}
                onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                placeholder="e.g., my-research-project"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--jp-border-color1)',
                  borderRadius: '3px',
                  background: 'var(--jp-layout-color1)',
                  color: 'var(--jp-ui-font-color1)',
                  fontSize: '13px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--jp-ui-font-color2)' }}>
                Objective *
              </label>
              <input
                type="text"
                value={formData.objective}
                onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                placeholder="e.g., Collaborative research on machine learning"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--jp-border-color1)',
                  borderRadius: '3px',
                  background: 'var(--jp-layout-color1)',
                  color: 'var(--jp-ui-font-color1)',
                  fontSize: '13px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--jp-ui-font-color2)' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of your project"
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--jp-border-color1)',
                  borderRadius: '3px',
                  background: 'var(--jp-layout-color1)',
                  color: 'var(--jp-ui-font-color1)',
                  fontSize: '13px',
                  resize: 'vertical'
                }}
              />
            </div>
            <button
              onClick={handleQuickCreate}
              disabled={loading}
              style={{
                padding: '10px 16px',
                background: 'var(--jp-brand-color1)',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </div>
      )}

      {/* Template Creation */}
      {creationMode === 'template' && (
        <div style={{ background: 'var(--jp-layout-color2)', padding: '20px', borderRadius: '3px' }}>
          <h4 style={{ marginBottom: '15px', color: 'var(--jp-ui-font-color1)' }}>Create from Template</h4>
          {templatesLoading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--jp-ui-font-color2)' }}>
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--jp-ui-font-color2)' }}>
              No templates available
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--jp-ui-font-color2)' }}>
                  Select Template
                </label>
                <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                  {templates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      style={{
                        padding: '12px',
                        border: selectedTemplate?.id === template.id ? '2px solid var(--jp-brand-color1)' : '1px solid var(--jp-border-color1)',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        background: selectedTemplate?.id === template.id ? 'var(--jp-brand-color3)' : 'var(--jp-layout-color1)'
                      }}
                    >
                      <h5 style={{ margin: '0 0 5px 0', color: 'var(--jp-ui-font-color1)' }}>{template.name}</h5>
                      <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: 'var(--jp-ui-font-color2)' }}>
                        {template.description}
                      </p>
                      <small style={{ color: 'var(--jp-ui-font-color3)' }}>
                        Type: {template.projectType}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedTemplate && (
                <div style={{ marginTop: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'var(--jp-ui-font-color2)' }}>
                    Project Data (JSON)
                  </label>
                  <textarea
                    value={formData.projectData}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectData: e.target.value }))}
                    rows={10}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--jp-border-color1)',
                      borderRadius: '3px',
                      background: 'var(--jp-layout-color1)',
                      color: 'var(--jp-ui-font-color1)',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      resize: 'vertical'
                    }}
                  />
                  <button
                    onClick={handleTemplateCreate}
                    disabled={loading}
                    style={{
                      marginTop: '10px',
                      padding: '10px 16px',
                      background: 'var(--jp-brand-color1)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    {loading ? 'Creating...' : 'Create from Template'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Custom JSON Creation */}
      {creationMode === 'custom' && (
        <div style={{ background: 'var(--jp-layout-color2)', padding: '20px', borderRadius: '3px' }}>
          <h4 style={{ marginBottom: '15px', color: 'var(--jp-ui-font-color1)' }}>Custom JSON Project</h4>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--jp-ui-font-color2)' }}>
              Project Data (JSON) *
            </label>
            <textarea
              value={formData.projectData}
              onChange={(e) => setFormData(prev => ({ ...prev, projectData: e.target.value }))}
              placeholder={JSON.stringify({
                project_id: "my-project",
                objective: "Research collaboration",
                description: "A collaborative research project",
                type: "research",
              }, null, 2)}
              rows={15}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--jp-border-color1)',
                borderRadius: '3px',
                background: 'var(--jp-layout-color1)',
                color: 'var(--jp-ui-font-color1)',
                fontSize: '12px',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            />
            <button
              onClick={handleCustomJSONCreate}
              disabled={loading}
              style={{
                marginTop: '10px',
                padding: '10px 16px',
                background: 'var(--jp-brand-color1)',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Creating...' : 'Create Custom Project'}
            </button>
          </div>
        </div>
      )}

      {/* Custom Builder */}
      {creationMode === 'custom-builder' && (
        <div style={{ background: 'var(--jp-layout-color2)', padding: '20px', borderRadius: '3px' }}>
          <h4 style={{ marginBottom: '15px', color: 'var(--jp-ui-font-color1)' }}>Custom Project Builder</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {customFields.map((field, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
                <div style={{ flex: '1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'var(--jp-ui-font-color2)', fontSize: '12px' }}>
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => updateCustomField(index, { key: e.target.value })}
                    placeholder="e.g., title, tags, etc."
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid var(--jp-border-color1)',
                      borderRadius: '3px',
                      background: 'var(--jp-layout-color1)',
                      color: 'var(--jp-ui-font-color1)',
                      fontSize: '12px'
                    }}
                  />
                </div>
                <div style={{ flex: '1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'var(--jp-ui-font-color2)', fontSize: '12px' }}>
                    Type
                  </label>
                  <select
                    value={field.type}
                    onChange={(e) => updateCustomField(index, { type: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid var(--jp-border-color1)',
                      borderRadius: '3px',
                      background: 'var(--jp-layout-color1)',
                      color: 'var(--jp-ui-font-color1)',
                      fontSize: '12px'
                    }}
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="array">Array</option>
                    <option value="object">Object</option>
                  </select>
                </div>
                <div style={{ flex: '2' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'var(--jp-ui-font-color2)', fontSize: '12px' }}>
                    Value
                  </label>
                  {field.type === 'boolean' ? (
                    <select
                      value={field.value.toString()}
                      onChange={(e) => updateCustomField(index, { value: e.target.value === 'true' })}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid var(--jp-border-color1)',
                        borderRadius: '3px',
                        background: 'var(--jp-layout-color1)',
                        color: 'var(--jp-ui-font-color1)',
                        fontSize: '12px'
                      }}
                    >
                      <option value="false">false</option>
                      <option value="true">true</option>
                    </select>
                  ) : field.type === 'array' ? (
                    <input
                      type="text"
                      value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                      onChange={(e) => updateCustomField(index, { value: e.target.value })}
                      placeholder="Comma-separated values or JSON array"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid var(--jp-border-color1)',
                        borderRadius: '3px',
                        background: 'var(--jp-layout-color1)',
                        color: 'var(--jp-ui-font-color1)',
                        fontSize: '12px'
                      }}
                    />
                  ) : field.type === 'object' ? (
                    <textarea
                      value={typeof field.value === 'object' ? JSON.stringify(field.value) : field.value}
                      onChange={(e) => updateCustomField(index, { value: e.target.value })}
                      placeholder='{"key": "value"}'
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid var(--jp-border-color1)',
                        borderRadius: '3px',
                        background: 'var(--jp-layout-color1)',
                        color: 'var(--jp-ui-font-color1)',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        resize: 'vertical'
                      }}
                    />
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={field.value}
                      onChange={(e) => updateCustomField(index, { value: e.target.value })}
                      placeholder={field.key === 'project_id' ? 'Required' : field.key === 'objective' ? 'Required' : 'Enter value'}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid var(--jp-border-color1)',
                        borderRadius: '3px',
                        background: 'var(--jp-layout-color1)',
                        color: 'var(--jp-ui-font-color1)',
                        fontSize: '12px'
                      }}
                    />
                  )}
                </div>
                <button
                  onClick={() => removeCustomField(index)}
                  disabled={customFields.length <= 3}
                  style={{
                    padding: '6px 8px',
                    background: customFields.length <= 3 ? 'var(--jp-layout-color3)' : 'var(--jp-error-color1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: customFields.length <= 3 ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    opacity: customFields.length <= 3 ? 0.5 : 1
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={addCustomField}
                style={{
                  padding: '8px 12px',
                  background: 'var(--jp-accent-color1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                + Add Field
              </button>
              
              <button
                onClick={handleCustomBuilderCreate}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  background: 'var(--jp-brand-color1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Creating...' : 'Create Custom Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCreationHub;
