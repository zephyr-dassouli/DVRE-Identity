import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useFactoryRegistry } from './useFactoryRegistry';
import { useAuth } from './useAuth';

import ProjectTemplateRegistry from '../abis/ProjectTemplateRegistry.json';
import ProjectFactory from '../abis/ProjectFactory.json';
import JSONProject from '../abis/JSONProject.json';
import { RPC_URL } from '../config/contracts';

export interface ProjectTemplate {
  id: number;
  name: string;
  description: string;
  projectType: string;
  participantRoles: string[];
  exampleJSON: string;
  isActive: boolean;
}

export interface ProjectMember {
  address: string;
  role: string;
}

export interface JoinRequest {
  requester: string;
  role: string;
  timestamp: number;
}

export interface ProjectInfo {
  address: string;
  projectId: string;
  objective: string;
  description?: string;
  creator: string;
  isActive: boolean;
  created: number;
  lastModified: number;
  participants: ProjectMember[];
  joinRequests: JoinRequest[];
  projectData: any; // Full parsed JSON
  // UI helpers
  isMember: boolean;
  isOwner: boolean;
  hasPendingRequest: boolean;
  memberCount: number;
}

export interface ProjectDetails extends ProjectInfo {
  availableRoles: string[];
}

export const useProjects = () => {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [userProjects, setUserProjects] = useState<ProjectInfo[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getFactoryContract } = useFactoryRegistry();
  const { account } = useAuth();

  const getProvider = () => {
    return new ethers.JsonRpcProvider(RPC_URL);
  };

  const getSigner = async () => {
    if (!(window as any).ethereum) {
      throw new Error('MetaMask not found');
    }
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    return await provider.getSigner();
  };

  // Get detailed project information
  const getProjectInfo = useCallback(async (projectAddress: string): Promise<ProjectInfo | null> => {
    try {
      const provider = getProvider();
      const projectContract = new ethers.Contract(projectAddress, JSONProject.abi, provider);

      // First, validate that this is a valid contract by checking if it has code
      const code = await provider.getCode(projectAddress);
      if (code === '0x') {
        console.warn(`No contract code at address ${projectAddress}`);
        return null;
      }

      // Try to call a simple read function first to validate the contract
      try {
        await projectContract.creator();
      } catch (err) {
        console.warn(`Address ${projectAddress} is not a valid JSONProject contract:`, err);
        return null;
      }

      const projectDataString = await projectContract.getProjectData();
      let projectData;
      
      try {
        projectData = JSON.parse(projectDataString);
      } catch (parseErr) {
        console.error(`Invalid JSON in project ${projectAddress}:`, parseErr);
        return null;
      }
      
      // Get project status (returns: active, created, modified, creator)
      const projectStatus = await projectContract.getProjectStatus();
      const projectInfo = {
        creator: projectStatus.projectCreator,
        isActive: projectStatus.active,
        created: Number(projectStatus.created),
        lastModified: Number(projectStatus.modified)
      };

      // Extract participants from project data (address and role)
      const participants: ProjectMember[] = [];
      if (projectData.participants && Array.isArray(projectData.participants)) {
        participants.push(...projectData.participants);
      }

      // Get join requests from contract
      const joinRequests: JoinRequest[] = [];
      try {
        const requesters = await projectContract.getAllRequesters();
        for (const requester of requesters) {
          const request = await projectContract.getJoinRequest(requester);
          if (request.exists) {
            joinRequests.push({
              requester: request.requester,
              role: request.role,
              timestamp: Number(request.timestamp)
            });
          }
        }
      } catch (err) {
        console.warn('Failed to get join requests:', err);
      }

      // Find the user's membership (might be owner or regular member)
      const userParticipant = participants.find(p => p.address.toLowerCase() === account?.toLowerCase());
      const isOwner = projectInfo.creator.toLowerCase() === account?.toLowerCase();
      const isMember = !!userParticipant || isOwner;
      const hasPendingRequest = joinRequests.some(r => r.requester.toLowerCase() === account?.toLowerCase());

      // Count of participants in the project
      const memberCount = participants.length;

      return {
        address: projectAddress,
        projectId: projectData.project_id || projectData.projectId || 'Unknown',
        objective: projectData.objective || 'No objective specified',
        description: projectData.description,
        creator: projectInfo.creator,
        isActive: projectInfo.isActive,
        created: Number(projectInfo.created),
        lastModified: Number(projectInfo.lastModified),
        participants,
        joinRequests,
        projectData,
        isMember,
        isOwner,
        hasPendingRequest,
        memberCount
      };
    } catch (err) {
      console.error(`Failed to get project info for ${projectAddress}:`, err);
      return null;
    }
  }, [account]);

  // Load all projects
  const loadProjects = useCallback(async () => {
    if (!account) return;
    
    setLoading(true);
    setError(null);

    try {
      const factoryContract = await getFactoryContract(
        "ProjectFactory",
        ProjectFactory.abi
      );

      if (!factoryContract) {
        throw new Error("ProjectFactory not found");
      }

      const projectAddresses = await factoryContract.getAllProjects();
      const allProjects: ProjectInfo[] = [];

      for (let i = 0; i < projectAddresses.length; i++) {
        try {
          const projectInfo = await getProjectInfo(projectAddresses[i]);
          if (projectInfo) {
            allProjects.push(projectInfo);
          }
        } catch (err) {
          console.warn(`Failed to load project at address ${projectAddresses[i]}:`, err);
        }
      }

      // Separate user projects from all projects
      const userProjectsList = allProjects.filter(p => p.isMember || p.isOwner);
      const availableProjectsList = allProjects.filter(p => !p.isMember && !p.isOwner);

      setUserProjects(userProjectsList);
      setProjects(availableProjectsList);
      setLoading(false);
    } catch (err: any) {
      setError(`Failed to load projects: ${err.message}`);
      setLoading(false);
    }
  }, [account, getFactoryContract, getProjectInfo]);

  // Load project templates
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const templateRegistryContract = await getFactoryContract(
        "ProjectTemplateRegistry",
        ProjectTemplateRegistry.abi
      );

      if (!templateRegistryContract) {
        throw new Error("ProjectTemplateRegistry not found");
      }

      const templateCount = await templateRegistryContract.getTemplateCount();
      const loadedTemplates: ProjectTemplate[] = [];

      for (let i = 0; i < templateCount; i++) {
        const template = await templateRegistryContract.getTemplate(i);
        loadedTemplates.push({
          id: i,
          name: template[0],
          description: template[1],
          projectType: template[2],
          participantRoles: template[3],
          exampleJSON: template[4],
          isActive: template[5]
        });
      }

      setTemplates(loadedTemplates.filter(t => t.isActive));
      setLoading(false);
    } catch (err: any) {
      setError(`Failed to load templates: ${err.message}`);
      setLoading(false);
    }
  }, [getFactoryContract]);

  // Request to join a project (uses contract's join request system)
  const requestToJoinProject = useCallback(async (projectAddress: string, role: string): Promise<boolean> => {
    if (!account) return false;

    try {
      const signer = await getSigner();
      const projectContract = new ethers.Contract(projectAddress, JSONProject.abi, signer);

      // Check if user already has a pending request or is already a member
      const projectInfo = await getProjectInfo(projectAddress);
      if (!projectInfo) {
        throw new Error('Project not found');
      }

      if (projectInfo.isOwner) {
        throw new Error('You are the owner of this project');
      }

      if (projectInfo.isMember) {
        throw new Error('You are already a member of this project');
      }

      if (projectInfo.hasPendingRequest) {
        throw new Error('You already have a pending request for this project');
      }

      // Validate that the requested role is available in the project
      const availableRoles = await getProjectRoles(projectAddress);
      if (!availableRoles.includes(role)) {
        throw new Error(`Role "${role}" is not available for this project. Available roles: ${availableRoles.join(', ')}`);
      }

      // Submit join request to contract
      const tx = await projectContract.submitJoinRequest(role);
      await tx.wait();

      console.log('Join request submitted successfully');
      return true;
    } catch (err: any) {
      console.error('Failed to request join:', err);
      setError(`Failed to request join: ${err.message}`);
      return false;
    }
  }, [account, getProjectInfo]);

  // Approve/reject join request (project owner only)
  const handleJoinRequest = useCallback(async (
    projectAddress: string, 
    memberAddress: string, 
    approve: boolean
  ): Promise<boolean> => {
    if (!account) return false;

    try {
      const signer = await getSigner();
      const projectContract = new ethers.Contract(projectAddress, JSONProject.abi, signer);

      if (approve) {
        // Get the join request details first
        const request = await projectContract.getJoinRequest(memberAddress);
        if (!request.exists) {
          throw new Error('Join request not found');
        }

        // Get current project data
        const projectDataString = await projectContract.getProjectData();
        const projectData = JSON.parse(projectDataString);

        // Initialize participants array if it doesn't exist
        if (!projectData.participants) {
          projectData.participants = [];
        }

        // Add the new member to participants
        projectData.participants.push({
          address: memberAddress,
          role: request.role
        });

        // Update project data
        const newProjectDataString = JSON.stringify(projectData);
        const updateTx = await projectContract.updateProjectData(newProjectDataString);
        await updateTx.wait();

        // Approve the join request (this removes it from the contract)
        const approveTx = await projectContract.approveJoinRequest(memberAddress);
        await approveTx.wait();
      } else {
        // Just reject the join request (this removes it from the contract)
        const rejectTx = await projectContract.rejectJoinRequest(memberAddress);
        await rejectTx.wait();
      }

      console.log(`Join request ${approve ? 'approved' : 'rejected'} for ${memberAddress}`);
      return true;
    } catch (err: any) {
      console.error('Failed to handle join request:', err);
      setError(`Failed to handle join request: ${err.message}`);
      return false;
    }
  }, [account]);

  // Create project from template
  const createProjectFromTemplate = useCallback(async (
    templateId: number,
    projectData: any
  ): Promise<string | null> => {
    try {
      const signer = await getSigner();
      const factoryContract = await getFactoryContract(
        "ProjectFactory",
        ProjectFactory.abi,
        signer
      );

      if (!factoryContract) {
        throw new Error("ProjectFactory not found");
      }

      // Ensure participants array exists
      if (!projectData.participants) {
        projectData.participants = [];
      }

      // Ensure roles array exists with default roles if not provided
      if (!projectData.roles || !Array.isArray(projectData.roles) || projectData.roles.length === 0) {
        projectData.roles = ['Researcher', 'Data Provider', 'Analyst', 'Contributor'];
      }

      if (account) {
        // Remove creator from participants if accidentally included
        projectData.participants = projectData.participants.filter(
          (p: ProjectMember) => p.address && p.address.toLowerCase() !== account.toLowerCase()
        );

        // Add the creator to participants with a role (commonly "Owner")
        projectData.participants.push({
          address: account,
          role: "Owner" // Can be configured based on project needs
        });
      }

      const projectDataString = JSON.stringify(projectData);
      const tx = await factoryContract.createProjectFromTemplate(templateId, projectDataString);
      const receipt = await tx.wait();

      // Find the project creation event
      const factoryInterface = new ethers.Interface(ProjectFactory.abi);
      const projectCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = factoryInterface.parseLog(log);
          return parsed?.name === 'ProjectCreated';
        } catch {
          return false;
        }
      });

      if (projectCreatedEvent) {
        const parsedEvent = factoryInterface.parseLog(projectCreatedEvent);
        return parsedEvent?.args[0]; // project address
      }

      return null;
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setError(`Failed to create project: ${err.message}`);
      return null;
    }
  }, [account, getFactoryContract]);

  // Create custom project
  const createCustomProject = useCallback(async (projectData: any): Promise<string | null> => {
    try {
      const signer = await getSigner();
      const factoryContract = await getFactoryContract(
        "ProjectFactory",
        ProjectFactory.abi,
        signer
      );

      if (!factoryContract) {
        throw new Error("ProjectFactory not found");
      }

      // Ensure participants array exists
      if (!projectData.participants) {
        projectData.participants = [];
      }

      // Ensure roles array exists with default roles if not provided
      if (!projectData.roles || !Array.isArray(projectData.roles) || projectData.roles.length === 0) {
        projectData.roles = ['Researcher', 'Data Provider', 'Analyst', 'Contributor'];
      }

      if (account) {
        // Remove creator from participants if accidentally included
        projectData.participants = projectData.participants.filter(
          (p: ProjectMember) => p.address && p.address.toLowerCase() !== account.toLowerCase()
        );

        // Add the creator to participants with a role (commonly "Owner")
        projectData.participants.push({
          address: account,
          role: "Owner" // Can be configured based on project needs
        });
      }

      const projectDataString = JSON.stringify(projectData);
      const tx = await factoryContract.createCustomProject(projectDataString);
      const receipt = await tx.wait();

      // Find the project creation event
      const factoryInterface = new ethers.Interface(ProjectFactory.abi);
      const projectCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = factoryInterface.parseLog(log);
          return parsed?.name === 'ProjectCreated';
        } catch {
          return false;
        }
      });

      if (projectCreatedEvent) {
        const parsedEvent = factoryInterface.parseLog(projectCreatedEvent);
        return parsedEvent?.args[0]; // project address
      }

      return null;
    } catch (err: any) {
      console.error('Failed to create custom project:', err);
      setError(`Failed to create custom project: ${err.message}`);
      return null;
    }
  }, [account, getFactoryContract]);

  // Get project roles (from project JSON roles field)
  const getProjectRoles = useCallback(async (projectAddress: string): Promise<string[]> => {
    try {
      const projectInfo = await getProjectInfo(projectAddress);
      if (!projectInfo) return [];

      // Get roles from project data roles field
      if (projectInfo.projectData.roles && Array.isArray(projectInfo.projectData.roles)) {
        return projectInfo.projectData.roles;
      }

      // Fallback to default roles if not defined in project
      console.warn(`Project ${projectAddress} does not have roles defined, using default roles`);
      return ['Researcher', 'Data Provider', 'Analyst', 'Contributor'];
    } catch (err) {
      console.error('Failed to get project roles:', err);
      return ['Researcher', 'Data Provider', 'Analyst', 'Contributor'];
    }
  }, [getProjectInfo]);

  // Get join requests for a project
  const getJoinRequests = useCallback(async (projectAddress: string): Promise<JoinRequest[]> => {
    try {
      const provider = getProvider();
      const projectContract = new ethers.Contract(projectAddress, JSONProject.abi, provider);

      const requesters = await projectContract.getAllRequesters();
      const joinRequests: JoinRequest[] = [];

      for (const requester of requesters) {
        const request = await projectContract.getJoinRequest(requester);
        if (request.exists) {
          joinRequests.push({
            requester: request.requester,
            role: request.role,
            timestamp: Number(request.timestamp)
          });
        }
      }

      return joinRequests;
    } catch (err) {
      console.error('Failed to get join requests:', err);
      return [];
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    if (account) {
      loadProjects();
      loadTemplates();
    }
  }, [account, loadProjects, loadTemplates]);

  return {
    // State
    projects,
    userProjects,
    templates,
    loading,
    error,

    // Methods
    loadProjects,
    loadTemplates,
    getProjectInfo,
    getJoinRequests,
    requestToJoinProject,
    handleJoinRequest,
    createProjectFromTemplate,
    createCustomProject,
    getProjectRoles,

    // Utility
    clearError: () => setError(null)
  };
};
