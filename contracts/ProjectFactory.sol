// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Project.sol";

contract ProjectFactory {
    // Events
    event ProjectCreated(
        address indexed creator,
        address indexed projectAddress,
        string objective,
        uint256 timestamp
    );

    // Mappings
    mapping(address => address[]) public userProjects;
    mapping(address => bool) public isProject;
    address[] public allProjects;

    // Create a new project
    function createProject(
        string memory _objective,
        string[] memory _availableRoles,
        string memory _ownerRole
    ) external returns (address) {
        require(bytes(_objective).length > 0, "Project objective cannot be empty");
        require(_availableRoles.length > 0, "At least one role must be defined");
        require(bytes(_ownerRole).length > 0, "Owner role cannot be empty");
        
        // Verify that the chosen owner role is in the available roles
        bool validOwnerRole = false;
        for (uint256 i = 0; i < _availableRoles.length; i++) {
            if (keccak256(bytes(_availableRoles[i])) == keccak256(bytes(_ownerRole))) {
                validOwnerRole = true;
                break;
            }
        }
        require(validOwnerRole, "Owner role must be one of the available roles");

        // Deploy new Project contract
        Project newProject = new Project(
            msg.sender,
            _objective,
            _availableRoles,
            _ownerRole
        );

        address projectAddress = address(newProject);

        // Update mappings
        userProjects[msg.sender].push(projectAddress);
        isProject[projectAddress] = true;
        allProjects.push(projectAddress);

        emit ProjectCreated(msg.sender, projectAddress, _objective, block.timestamp);

        return projectAddress;
    }

    // Get projects created by a user
    function getUserProjects(address _user) external view returns (address[] memory) {
        return userProjects[_user];
    }

    // Get all projects
    function getAllProjects() external view returns (address[] memory) {
        return allProjects;
    }

    // Get total number of projects
    function getTotalProjects() external view returns (uint256) {
        return allProjects.length;
    }
}