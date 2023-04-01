// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
//Modify the Safe contract
contract Safe {
    using SafeMath for uint256;
    address public owner; //The contract should have an owner.
    //uint256 private feePercentage = 1;
    mapping(address => mapping(address => uint256)) private balances;
    mapping(address => uint256) private fees;
    constructor(address _owner)
    {
        owner = _owner;
    }
    function getOwner() public view returns(address)
    {
        return owner;
    }
    function deposit(address token, uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(token != address(0), "Can't send to 0x00.. address");
        uint256 fee = (amount*1)/1000; // Takes a 0.1% tax.
        balances[msg.sender][token] += (amount-fee);
        fees[token] += fee;
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
    }
    
    function withdraw(address token, uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender][token] >= amount, "Not enough amount to withdraw");
        balances[msg.sender][token] -= amount;
        require(IERC20(token).transfer(msg.sender, amount), "Token transfer failed");
    }

    function takeFee(address token) public {
        require(msg.sender == owner, "Only owner can take fees"); //Only the owner of the contract can call it.
        uint256 amount = fees[token];
        fees[token] = 0;
        require(IERC20(token).transfer(msg.sender, amount), "Fees transfer failed"); //The owner should get the token fees that are accumulated in the contract.
    }
    
    function getBalance(address token) public view returns(uint256 balance) {
        return balances[msg.sender][token];
    }
    function getFees(address token) public view returns(uint256 fee) {
        return fees[token];
    }
}