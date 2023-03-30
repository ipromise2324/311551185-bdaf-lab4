// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
contract Proxy  { 
    //Use unstructured storage to store "owner" and "implementation".
    bytes32 private constant proxyOwnerPosition = keccak256("org.zeppelinos.proxy.owner"); 
    bytes32 private constant implementationPosition = keccak256("org.zeppelinos.proxy.implementation");
    constructor() {
        _setAdmin(msg.sender);
    }

    modifier ifAdmin() {
        // TODO: check whether msg.sender is the admin of this contract
        if (msg.sender ==_getAdmin()) {
            _;
        }
        else{
            _fallback();
        }
    }

    function _getAdmin() private view returns(address owner) {   
        bytes32 position = proxyOwnerPosition;   
        assembly {
            owner := sload(position)
        } 
    } 
    function _setAdmin(address _admin) private {   
        bytes32 position = proxyOwnerPosition;   
        assembly {
            sstore(position, _admin)
        } 
    } 
    function _getImplementation() private view returns(address impl) {   
        bytes32 position = implementationPosition;   
        assembly {
            impl := sload(position)
        } 
    } 
    function _setImplementation(address _newImplementation) private {   
        bytes32 position = implementationPosition;   
        assembly {
            sstore(position, _newImplementation)
        } 
    } 
    // Admin interface
    function changeAdmin(address _admin) external ifAdmin { 
        // TODO: Only the "owner" should be able to change the admin of the proxy,so using ifAdmin to check
        _setAdmin(_admin);
    }

    function upgradeTo(address _implementation) external ifAdmin { 
        // TODO: Only the "owner" should be able to update the implementation of the proxy,so using ifAdmin to check
        _setImplementation(_implementation);
    }

    function admin() external view returns (address) {
        // TODO: Return the admin of the contract
        return _getAdmin();
    }

     function implementation() external view returns (address) {
        // TODO: Return the implementation of the contract
        return _getImplementation();
    }
    // User interface
    function _delegate(address _implementation) internal virtual {
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), _implementation, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
    function callInitialize(address otherContractAddress, address _owner) public {
        bytes memory payload = abi.encodeWithSignature("initialize(address)", _owner);
        (bool success, bytes memory result) = otherContractAddress.call(payload);
        require(success, "Call failed");
    }
    function getImplementationOwner(address contractAddress) public view returns (address) {
        bytes memory payload = abi.encodeWithSignature("getOwner()");
        (bool success, bytes memory result) = contractAddress.staticcall(payload);
        require(success, "Call failed");
        return abi.decode(result, (address));
    }

    function _fallback() private {
        _delegate(_getImplementation());
    }

    fallback() external payable {
        _fallback();
    }

    receive() external payable {
        _fallback();
    }
}