// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Project.sol";

contract ProjectFactory {
    // Structs
    struct ProjectTemplate {
        string name;
        string description;
        string[] availableRoles;
        string defaultOwnerRole;
        bool isActive;
    }

    // Events
    event ProjectCreated(
        address indexed creator,
        address indexed projectAddress,
        string objective,
        uint256 templateId,
        uint256 timestamp
    );

    event TemplateCreated(
        uint256 indexed templateId,
        string name,
        string description,
        uint256 timestamp
    );

    // State variables
    ProjectTemplate[] public templates;
    mapping(uint256 => address[]) public templateProjects; // templateId => project addresses
    mapping(address => address[]) public userProjects; // user => project addresses (for backward compatibility)
    mapping(address => bool) public isProject;
    address[] public allProjects;

    constructor() {
        // Add Federated Learning collaboration template
        string[] memory flRoles = new string[](2);
        flRoles[0] = "Data Owner";
        flRoles[1] = "Model Owner";
        _createTemplate(
            "Federated Learning",
            "Collaborative machine learning D-App where data remains distributed",
            flRoles,
            "Model Owner"
        );
    }

    // Internal function to create a template
    function _createTemplate(
        string memory _name,
        string memory _description,
        string[] memory _availableRoles,
        string memory _defaultOwnerRole
    ) internal {
        require(bytes(_name).length > 0, "Template name cannot be empty");
        require(_availableRoles.length > 0, "At least one role must be defined");
        
        // Verify that the default owner role is in the available roles
        bool validOwnerRole = false;
        for (uint256 i = 0; i < _availableRoles.length; i++) {
            if (keccak256(bytes(_availableRoles[i])) == keccak256(bytes(_defaultOwnerRole))) {
                validOwnerRole = true;
                break;
            }
        }
        require(validOwnerRole, "Default owner role must be one of the available roles");

        templates.push(ProjectTemplate({
            name: _name,
            description: _description,
            availableRoles: _availableRoles,
            defaultOwnerRole: _defaultOwnerRole,
            isActive: true
        }));

        emit TemplateCreated(templates.length - 1, _name, _description, block.timestamp);
    }

    // Create a new project using a template
    function createProjectFromTemplate(
        uint256 _templateId,
        string memory _objective,
        string memory _ownerRole
    ) external returns (address) {
        require(_templateId < templates.length, "Template does not exist");
        require(templates[_templateId].isActive, "Template is not active");
        require(bytes(_objective).length > 0, "Project objective cannot be empty");
        
        ProjectTemplate memory template = templates[_templateId];
        
        // Verify that the chosen owner role is in the template's available roles
        bool validOwnerRole = false;
        for (uint256 i = 0; i < template.availableRoles.length; i++) {
            if (keccak256(bytes(template.availableRoles[i])) == keccak256(bytes(_ownerRole))) {
                validOwnerRole = true;
                break;
            }
        }
        require(validOwnerRole, "Owner role must be one of the template's available roles");

        // Deploy new Project contract
        Project newProject = new Project(
            msg.sender,
            _objective,
            template.availableRoles,
            _ownerRole
        );

        address projectAddress = address(newProject);

        // Set the template ID
        newProject.setTemplateId(_templateId);

        // Update mappings
        userProjects[msg.sender].push(projectAddress);
        isProject[projectAddress] = true;
        allProjects.push(projectAddress);
        templateProjects[_templateId].push(projectAddress);

        emit ProjectCreated(msg.sender, projectAddress, _objective, _templateId, block.timestamp);

        return projectAddress;
    }

    // Create a new project (legacy function - creates custom project)
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

        emit ProjectCreated(msg.sender, projectAddress, _objective, 999999, block.timestamp); // Use 999999 as templateId for custom projects

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

    // Get all templates
    function getAllTemplates() external view returns (
        uint256[] memory ids,
        string[] memory names,
        string[] memory descriptions,
        bool[] memory isActiveList
    ) {
        uint256 length = templates.length;
        ids = new uint256[](length);
        names = new string[](length);
        descriptions = new string[](length);
        isActiveList = new bool[](length);
        
        for (uint256 i = 0; i < length; i++) {
            ids[i] = i;
            names[i] = templates[i].name;
            descriptions[i] = templates[i].description;
            isActiveList[i] = templates[i].isActive;
        }
    }

    // Get template details
    function getTemplate(uint256 _templateId) external view returns (
        string memory name,
        string memory description,
        string[] memory availableRoles,
        string memory defaultOwnerRole,
        bool isActive
    ) {
        require(_templateId < templates.length, "Template does not exist");
        ProjectTemplate memory template = templates[_templateId];
        return (template.name, template.description, template.availableRoles, template.defaultOwnerRole, template.isActive);
    }

    // Get projects created from a specific template
    function getProjectsByTemplate(uint256 _templateId) external view returns (address[] memory) {
        require(_templateId < templates.length, "Template does not exist");
        return templateProjects[_templateId];
    }

    // Get template count
    function getTemplateCount() external view returns (uint256) {
        return templates.length;
    }

    // Admin function to create new templates (could be restricted to owner in production)
    function createTemplate(
        string memory _name,
        string memory _description,
        string[] memory _availableRoles,
        string memory _defaultOwnerRole
    ) external returns (uint256) {
        _createTemplate(_name, _description, _availableRoles, _defaultOwnerRole);
        return templates.length - 1;
    }

    // Admin function to deactivate a template
    function deactivateTemplate(uint256 _templateId) external {
        require(_templateId < templates.length, "Template does not exist");
        templates[_templateId].isActive = false;
    }
}