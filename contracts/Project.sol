// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Project {
    // Structs
    struct Member {
        address memberAddress;
        string role;
        uint256 joinedAt;
        bool isActive;
    }

    struct JoinRequest {
        address requester;
        string requestedRole;
        uint256 requestedAt;
        bool isPending;
    }

    // State variables
    address public creator;
    string public objective; // This serves as both name and objective
    string[] public availableRoles;
    uint256 public createdAt;
    uint256 public templateId; // 999999 for custom projects
    bool public finished; 
    uint256 public finishedAt;
    
    // Mappings
    mapping(address => Member) public members;
    mapping(string => bool) public validRoles;
    address[] public memberAddresses;
    mapping(address => JoinRequest) public joinRequests;
    address[] public pendingRequests;

    // Events
    event MemberAdded(address indexed member, string role, uint256 timestamp);
    event MemberRoleUpdated(address indexed member, string oldRole, string newRole);
    event MemberRemoved(address indexed member);
    event ObjectiveUpdated(string oldObjective, string newObjective);
    event ProjectFinished(uint256 timestamp);
    event ProjectReactivated(uint256 timestamp); 
    event JoinRequestSubmitted(address indexed requester, string requestedRole, uint256 timestamp);
    event JoinRequestApproved(address indexed requester, string role, uint256 timestamp);
    event JoinRequestRejected(address indexed requester, uint256 timestamp);

    // Modifiers
    modifier onlyCreator() {
        require(msg.sender == creator, "Only project creator can perform this action");
        _;
    }

    modifier onlyMember() {
        require(members[msg.sender].isActive, "Only active members can perform this action");
        _;
    }

    modifier validRole(string memory _role) {
        require(validRoles[_role], "Invalid role");
        _;
    }

    modifier notFinished() {
        require(!finished, "Project is already finished");
        _;
    }

    // Constructor
    constructor(
        address _creator,
        string memory _objective,
        string[] memory _availableRoles,
        string memory _ownerRole
    ) {
        creator = _creator;
        objective = _objective;
        createdAt = block.timestamp;
        templateId = 999999; // Default to custom project, can be updated by factory
        finished = false; // Initialize as not finished
        finishedAt = 0;

        // Set available roles
        for (uint256 i = 0; i < _availableRoles.length; i++) {
            availableRoles.push(_availableRoles[i]);
            validRoles[_availableRoles[i]] = true;
        }

        // Add creator as first member with their chosen role
        members[_creator] = Member({
            memberAddress: _creator,
            role: _ownerRole,
            joinedAt: block.timestamp,
            isActive: true
        });
        memberAddresses.push(_creator);

        emit MemberAdded(_creator, _ownerRole, block.timestamp);
    }

    // Function to set template ID (can only be called once by factory)
    function setTemplateId(uint256 _templateId) external {
        require(templateId == 999999, "Template ID already set");
        require(msg.sender != address(0), "Invalid caller");
        templateId = _templateId;
    }

    // Mark project as finished
    function finishProject() external onlyCreator notFinished {
        finished = true;
        finishedAt = block.timestamp;
        emit ProjectFinished(block.timestamp);
    }

    // Reactivate a finished project
    function reactivateProject() external onlyCreator {
        require(finished, "Project is not finished");
        finished = false;
        finishedAt = 0;
        emit ProjectReactivated(block.timestamp);
    }

    // Submit a join request
    function requestToJoin(string memory _requestedRole) 
        external 
        validRole(_requestedRole)
        notFinished
    {
        require(msg.sender != creator, "Creator is already a member");
        require(!members[msg.sender].isActive, "Already a member");
        require(!joinRequests[msg.sender].isPending, "Join request already pending");

        joinRequests[msg.sender] = JoinRequest({
            requester: msg.sender,
            requestedRole: _requestedRole,
            requestedAt: block.timestamp,
            isPending: true
        });
        pendingRequests.push(msg.sender);

        emit JoinRequestSubmitted(msg.sender, _requestedRole, block.timestamp);
    }

    // Approve a join request
    function approveJoinRequest(address _requester) 
        external 
        onlyCreator 
        notFinished
    {
        require(joinRequests[_requester].isPending, "No pending request from this address");
        require(!members[_requester].isActive, "User is already a member");

        JoinRequest memory request = joinRequests[_requester];
        
        // Add member
        members[_requester] = Member({
            memberAddress: _requester,
            role: request.requestedRole,
            joinedAt: block.timestamp,
            isActive: true
        });
        memberAddresses.push(_requester);

        // Remove from pending requests
        joinRequests[_requester].isPending = false;
        _removePendingRequest(_requester);

        emit JoinRequestApproved(_requester, request.requestedRole, block.timestamp);
        emit MemberAdded(_requester, request.requestedRole, block.timestamp);
    }

    // Reject a join request
    function rejectJoinRequest(address _requester) 
        external 
        onlyCreator 
    {
        require(joinRequests[_requester].isPending, "No pending request from this address");

        // Remove from pending requests
        joinRequests[_requester].isPending = false;
        _removePendingRequest(_requester);

        emit JoinRequestRejected(_requester, block.timestamp);
    }

    // Internal function to remove from pending requests array
    function _removePendingRequest(address _requester) internal {
        for (uint256 i = 0; i < pendingRequests.length; i++) {
            if (pendingRequests[i] == _requester) {
                pendingRequests[i] = pendingRequests[pendingRequests.length - 1];
                pendingRequests.pop();
                break;
            }
        }
    }

    // Add a new member to the project (direct add by creator)
    function addMember(address _member, string memory _role) 
        external 
        onlyCreator 
        validRole(_role)
        notFinished
    {
        require(_member != address(0), "Invalid member address");
        require(!members[_member].isActive, "Member already exists");

        members[_member] = Member({
            memberAddress: _member,
            role: _role,
            joinedAt: block.timestamp,
            isActive: true
        });
        memberAddresses.push(_member);

        emit MemberAdded(_member, _role, block.timestamp);
    }

    // Update member role (including owner's own role)
    function updateMemberRole(address _member, string memory _newRole) 
        external 
        onlyCreator 
        validRole(_newRole)
        notFinished
    {
        require(members[_member].isActive, "Member does not exist");
        
        string memory oldRole = members[_member].role;
        members[_member].role = _newRole;

        emit MemberRoleUpdated(_member, oldRole, _newRole);
    }

    // Allow owner to update their own role
    function updateMyRole(string memory _newRole) 
        external 
        validRole(_newRole)
        notFinished
    {
        require(msg.sender == creator, "Only project owner can update their own role");
        
        string memory oldRole = members[creator].role;
        members[creator].role = _newRole;

        emit MemberRoleUpdated(creator, oldRole, _newRole);
    }

    // Remove a member from the project
    function removeMember(address _member) external onlyCreator notFinished {
        require(members[_member].isActive, "Member does not exist");
        require(_member != creator, "Cannot remove project creator");

        members[_member].isActive = false;

        // Remove from memberAddresses array
        for (uint256 i = 0; i < memberAddresses.length; i++) {
            if (memberAddresses[i] == _member) {
                memberAddresses[i] = memberAddresses[memberAddresses.length - 1];
                memberAddresses.pop();
                break;
            }
        }

        emit MemberRemoved(_member);
    }

    // Update project objective (also serves as name)
    function updateObjective(string memory _newObjective) external onlyCreator notFinished {
        require(bytes(_newObjective).length > 0, "Objective cannot be empty");
        
        string memory oldObjective = objective;
        objective = _newObjective;

        emit ObjectiveUpdated(oldObjective, _newObjective);
    }

    // Get project name (returns objective)
    function getName() external view returns (string memory) {
        return objective;
    }

    // Get project owner
    function getOwner() external view returns (address) {
        return creator;
    }

    // Get owner's role
    function getOwnerRole() external view returns (string memory) {
        return members[creator].role;
    }

    // Check if project is finished
    function isFinished() external view returns (bool) {
        return finished;
    }

    // Get finished timestamp
    function getFinishedAt() external view returns (uint256) {
        return finishedAt;
    }

    // Get template ID
    function getTemplateId() external view returns (uint256) {
        return templateId;
    }

    // Get project status info
    function getProjectStatus() external view returns (
        bool projectFinished,
        uint256 finishedTimestamp,
        uint256 createdTimestamp
    ) {
        return (finished, finishedAt, createdAt);
    }

    // Get member information
    function getMember(address _member) external view returns (
        address memberAddress,
        string memory role,
        uint256 joinedAt,
        bool isActive
    ) {
        Member memory member = members[_member];
        return (member.memberAddress, member.role, member.joinedAt, member.isActive);
    }

    // Get all members
    function getAllMembers() external view returns (address[] memory) {
        return memberAddresses;
    }

    // Get available roles
    function getAvailableRoles() external view returns (string[] memory) {
        return availableRoles;
    }

    // Get active member count
    function getActiveMemberCount() external view returns (uint256) {
        return memberAddresses.length;
    }

    // Check if address is a member
    function isMember(address _address) external view returns (bool) {
        return members[_address].isActive;
    }

    // Get member role
    function getMemberRole(address _member) external view returns (string memory) {
        require(members[_member].isActive, "Member does not exist");
        return members[_member].role;
    }

    // Get join request information
    function getJoinRequest(address _requester) external view returns (
        address requester,
        string memory requestedRole,
        uint256 requestedAt,
        bool isPending
    ) {
        JoinRequest memory request = joinRequests[_requester];
        return (request.requester, request.requestedRole, request.requestedAt, request.isPending);
    }

    // Get all pending join requests
    function getPendingJoinRequests() external view returns (address[] memory) {
        return pendingRequests;
    }

    // Check if address has pending join request
    function hasPendingJoinRequest(address _address) external view returns (bool) {
        return joinRequests[_address].isPending;
    }

    // Get pending join requests count
    function getPendingRequestsCount() external view returns (uint256) {
        return pendingRequests.length;
    }
}