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
        
        projectsInfo.push({
          address,
          objective,
          creator,
          createdAt: Number(createdAt),
          memberCount: Number(memberCount),
          isMember
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
      const userProjectAddresses = await factory.getUserProjects(userAddress);
      
      const userProjectsInfo: ProjectInfo[] = [];
      
      for (const address of userProjectAddresses) {
        const project = await getProjectContract(address);
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
          isMember: true
        });
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
    getProjectDetails
  };
};