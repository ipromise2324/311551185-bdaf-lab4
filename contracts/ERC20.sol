// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
contract ERC20 is IERC20 {
    using SafeMath for uint256;
    
    uint256 private _totalSupply;
    mapping(address => uint256)  _balances;
    mapping(address => mapping(address => uint256)) _approve;
    constructor(){
        _balances[msg.sender]=10000;
        _totalSupply=10000;
    }
    function decimals()  public pure returns (uint8) {
        return 3;
    }
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address tokenOwner) external view returns (uint256 balance) {
        return _balances[tokenOwner];
    }
    
    function transfer(address to, uint256 tokens) external returns (bool success) {
        return _transfer(msg.sender, to, tokens);
    }
    
    function allowance(address tokenOwner, address spender) external view returns (uint256 remaining) {
        return _approve[tokenOwner][spender];
    }
  
    function approve(address spender, uint256 tokens) external returns (bool success) {
        _approve[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }

    function transferFrom(address from, address to, uint256 tokens) external returns (bool success) {
        _approve[from][msg.sender] = _approve[from][msg.sender].sub(tokens);
        
        return _transfer(from, to, tokens);
    }
    
    function _transfer(address from, address to, uint256 tokens) internal returns (bool success) {
        _balances[from] = _balances[from].sub(tokens);
        _balances[to] = _balances[to].add(tokens);
        emit Transfer(from, to, tokens);
        return true;
    }
}