import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import ProjectFactoryABI from '../abis/ProjectFactory.json';
import ProjectABI from '../abis/Project.json';

export interface ProjectInfo {
  address: string;
  objective: string;
  creator: string;
  createdAt: number;
  memberCount: number;
  isMember: boolean;
  hasPendingRequest?: boolean;
}

export interface ProjectDetails extends ProjectInfo {
  members: Array<{
    address: string;
    role: string;
    joinedAt: number;
  }>;
  availableRoles: string[];
  ownerRole: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [userProjects, setUserProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProvider = () => {
    if (!(window as any).ethereum) {
      throw new Error('MetaMask not found');
    }
    return new ethers.BrowserProvider((window as any).ethereum);
  };

  const getProjectFactory = async () => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESSES.PROJECT_FACTORY_ADDRESS, ProjectFactoryABI.abi, signer);
  };

  const getProjectContract = async (address: string) => {
    const provider = getProvider();
    return new ethers.Contract(address, ProjectABI.abi, provider);
  };

  const getProjectContractWithSigner = async (address: string) => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    return new ethers.Contract(address, ProjectABI.abi, signer);
  };

  // Join a project by submitting a join request
  const requestToJoinProject = async (projectAddress: string, role: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const provider = getProvider();
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      const project = await getProjectContractWithSigner(projectAddress);
      
      // Check if user is already a member
      const isMember = await project.isMember(userAddress);
      if (isMember) {
        throw new Error('You are already a member of this project');
      }
      
      // Check if user already has a pending request
      const hasPendingRequest = await project.hasPendingJoinRequest(userAddress);
      if (hasPendingRequest) {
        throw new Error('You already have a pending join request for this project');
      }
      
      // Check if the role is valid
      const availableRoles = await project.getAvailableRoles();
      if (!availableRoles.includes(role)) {
        throw new Error('Invalid role selected');
      }
      
      // Submit join request
      const tx = await project.requestToJoin(role);
      await tx.wait();
      
      // Refresh projects list
      await loadProjects();
      await loadUserProjects();
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to submit join request');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (objective: string, availableRoles: string[], ownerRole: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const factory = await getProjectFactory();
      const tx = await factory.createProject(objective, availableRoles, ownerRole);
      await tx.wait();
      
      // Refresh projects list
      await loadProjects();
      await loadUserProjects();
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const factory = await getProjectFactory();
      const projectAddresses = await factory.getAllProjects();
      
      const projectsInfo: ProjectInfo[] = [];
      
      for (const address of projectAddresses) {
        const project = await getProjectContract(address);
        const objective = await project.objective();
        const creator = await project.creator();
        const createdAt = await project.createdAt();
        const memberCount = await project.getActiveMemberCount();
        
        // Check if current user is a member
        const provider = getProvider();
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        const isMember = await project.isMember(userAddress);
        
        // Check if user has a pending join request
        let hasPendingRequest = false;
        if (!isMember) {
          try {
            hasPendingRequest = await project.hasPendingJoinRequest(userAddress);
          } catch (err) {
            // If there's an error checking pending request, default to false
            hasPendingRequest = false;
          }
        }
        
        projectsInfo.push({
          address,
          objective,
          creator,
          createdAt: Number(createdAt),
          memberCount: Number(memberCount),
          isMember,
          hasPendingRequest
        });
      }
      
      setProjects(projectsInfo);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProjects = async () => {
    try {
      const provider = getProvider();
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      const factory = await getProjectFactory();
      
      // Get all projects and check which ones the user is a member of
      const allProjectAddresses = await factory.getAllProjects();
      const userProjectsInfo: ProjectInfo[] = [];
      
      for (const address of allProjectAddresses) {
        const project = await getProjectContract(address);
        
        // Check if user is a member of this project
        const isMember = await project.isMember(userAddress);
        
        if (isMember) {
          const objective = await project.objective();
          const creator = await project.creator();
          const createdAt = await project.createdAt();
          const memberCount = await project.getActiveMemberCount();
          
          userProjectsInfo.push({
            address,
            objective,
            creator,
            createdAt: Number(createdAt),
            memberCount: Number(memberCount),
            isMember: true,
            hasPendingRequest: false
          });
        }
      }
      
      setUserProjects(userProjectsInfo);
    } catch (err: any) {
      setError(err.message || 'Failed to load user projects');
    }
  };

  const getProjectDetails = useCallback(async (address: string): Promise<ProjectDetails | null> => {
    try {
      const project = await getProjectContract(address);
      
      const objective = await project.objective();
      const creator = await project.creator();
      const createdAt = await project.createdAt();
      const memberAddresses = await project.getAllMembers();
      const availableRoles = await project.getAvailableRoles();
      const ownerRole = await project.getOwnerRole();
      
      const members = [];
      for (const memberAddress of memberAddresses) {
        const memberInfo = await project.getMember(memberAddress);
        members.push({
          address: memberAddress,
          role: memberInfo.role,
          joinedAt: Number(memberInfo.joinedAt)
        });
      }
      
      const provider = getProvider();
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const isMember = await project.isMember(userAddress);
      
      return {
        address,
        objective,
        creator,
        createdAt: Number(createdAt),
        memberCount: members.length,
        isMember,
        members,
        availableRoles,
        ownerRole
      };
    } catch (err: any) {
      setError(err.message || 'Failed to get project details');
      return null;
    }
  }, []); // Empty dependency array since getProjectContract doesn't depend on state

  // Get pending join requests for a project (for project creators)
  const getPendingJoinRequests = async (projectAddress: string) => {
    try {
      const project = await getProjectContract(projectAddress);
      const pendingAddresses = await project.getPendingJoinRequests();
      
      const requests = [];
      for (const address of pendingAddresses) {
        const requestInfo = await project.getJoinRequest(address);
        requests.push({
          requester: requestInfo.requester,
          requestedRole: requestInfo.requestedRole,
          requestedAt: Number(requestInfo.requestedAt),
          isPending: requestInfo.isPending
        });
      }
      
      return requests;
    } catch (err: any) {
      setError(err.message || 'Failed to get join requests');
      return [];
    }
  };

  // Approve a join request (for project creators)
  const approveJoinRequest = async (projectAddress: string, requesterAddress: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const project = await getProjectContractWithSigner(projectAddress);
      const tx = await project.approveJoinRequest(requesterAddress);
      await tx.wait();
      
      // Refresh projects list
      await loadProjects();
      await loadUserProjects();
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to approve join request');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reject a join request (for project creators)
  const rejectJoinRequest = async (projectAddress: string, requesterAddress: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const project = await getProjectContractWithSigner(projectAddress);
      const tx = await project.rejectJoinRequest(requesterAddress);
      await tx.wait();
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to reject join request');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if user has a pending join request for a project
  const hasPendingJoinRequest = async (projectAddress: string, userAddress?: string) => {
    try {
      if (!userAddress) {
        const provider = getProvider();
        const signer = await provider.getSigner();
        userAddress = await signer.getAddress();
      }
      
      const project = await getProjectContract(projectAddress);
      return await project.hasPendingJoinRequest(userAddress);
    } catch (err: any) {
      return false;
    }
  };

  // Get available roles for a project
  const getProjectRoles = async (projectAddress: string): Promise<string[]> => {
    try {
      const project = await getProjectContract(projectAddress);
      return await project.getAvailableRoles();
    } catch (err: any) {
      setError(err.message || 'Failed to get project roles');
      return [];
    }
  };

  useEffect(() => {
    if ((window as any).ethereum) {
      loadProjects();
      loadUserProjects();
    }
  }, []);

  return {
    projects,
    userProjects,
    loading,
    error,
    createProject,
    loadProjects,
    loadUserProjects,
    getProjectDetails,
    requestToJoinProject,
    getProjectRoles,
    getPendingJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
    hasPendingJoinRequest
  };
};