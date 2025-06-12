// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Group {
    string public name;

    mapping(address => bool) public isMember;
    address[] private members;

    event JoinedGroup(address indexed user);
    event LeftGroup(address indexed user);

    constructor(string memory _name) {
        name = _name;
    }

    function joinGroup() external {
        require(!isMember[msg.sender], "Already a member");
        isMember[msg.sender] = true;
        members.push(msg.sender);
        emit JoinedGroup(msg.sender);
    }

    function leaveGroup() external {
        require(isMember[msg.sender], "Not a member");
        isMember[msg.sender] = false;
        emit LeftGroup(msg.sender);
        // Optionally remove the member from the members array (not recommended O(n) operation)
    }

    function getAllMembers() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < members.length; i++) {
            if (isMember[members[i]]) {
                count++;
            }
        }

        address[] memory activeMembers = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < members.length; i++) {
            if (isMember[members[i]]) {
                activeMembers[index++] = members[i];
            }
        }
        return activeMembers;
    }

    function isUserMember(address user) external view returns (bool) {
        return isMember[user];
    }
}
