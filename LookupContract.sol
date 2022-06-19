// SPDX-License-Identifier: GPL- 3.0
pragma solidity >=0.7.0 < 0.9.0;

contract LookupContract {

    mapping (string => uint) public myDirectory;        // Defining the Mapping for directory
    
    constructor(string memory _name, uint _mobileNumber) {      // Defining the constructor to be able to add new entries in the directory
        myDirectory[_name] = _mobileNumber;

    }

    function setMobileNumber(string memory _name, uint _mobileNumber) public{       // Function for setting up a new entry

        myDirectory[_name] = _mobileNumber;
    }

    function getMobileNumber(string memory _name) public view returns(uint){        // Function to get data about already existing entry

        return myDirectory[_name];
    }

}
