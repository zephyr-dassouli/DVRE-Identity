// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Group.sol";

contract GroupFactory {
    address[] public allGroups;

    event GroupCreated(address indexed groupAddress, address indexed creator, string name);

    function createGroup(string memory name) external returns (address) {
        Group newGroup = new Group(name);
        allGroups.push(address(newGroup));
        emit GroupCreated(address(newGroup), msg.sender, name);
        return address(newGroup);
    }

    function getAllGroups() external view returns (address[] memory) {
        return allGroups;
    }
}
