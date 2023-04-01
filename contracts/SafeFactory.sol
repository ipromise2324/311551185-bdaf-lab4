// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./Proxy.sol";
import "./Safe.sol";
contract SafeFactory {
    address public owner;
    address public safeImplementation; //Stores the address of the Safe Implementation in a storage.
    address public proxyAddress; //Stores the Proxy contact address in "proxyAddress",so it's easier to test.
    address public safeAddress; //Stores the Safe contact address in "safeAddress",so it's easier to test.
    address public implementationOwner;
    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owener can do this !!!");
        _;
    }

    /*
     * Homework requirement
     * 1. function updateImplementation(address newImp) external
     * 2. function deploySafeProxy() external
     * 3. function deploySafe() external
     **/
   
    function updateImplementation(address newImp) external onlyOwner{
        // TODO: The Safe implementation address can only be updated by the owner of the Factory contract, so using onlyOwner to check it.
        safeImplementation = newImp;
    }

    function deploySafeProxy() external {
        // TODO: Deploys a proxy, points the proxy to the current Safe Implementation. Initializes the proxy so that the message sender is the owner of the new Safe.
        Proxy proxy = new Proxy(); 
        proxyAddress = address(proxy);
        proxy.upgradeTo(safeImplementation);
        proxy.callInitialize(proxyAddress,owner);
        implementationOwner = proxy.getImplementationOwner(proxyAddress);
        proxy.changeAdmin(msg.sender); 
    }

    function deploySafe() external {
        // TODO: Deploys the original Safe contract. Note that you might need to modify the Safe contract so that the original caller of the deploySafe contract will be the owner of the deployed "Safe” contract.
        Safe safe = new Safe(owner);
        safeAddress = address(safe);
    }

}