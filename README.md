# 311551185-bdaf-lab4

# Set-UP
```
npm install
npx hardhat test
```
# Gas-Reporter
![messageImage_1680170137440](https://user-images.githubusercontent.com/87699256/228800367-00663376-7b78-424f-a28d-8552907a6c84.jpg)
# Solidity-Coverage
![messageImage_1680170166584](https://user-images.githubusercontent.com/87699256/228800249-6f0956a9-e1c2-4ba8-8f51-a4defb2ca480.jpg)

# Requirement
## Modify the Safe contract

- The contract should have an owner.
- The contract now takes a 0.1% tax. That means, if an address deposited 1000 ATokens, the address can only withdraw 999 ATokens. The remaining 1 AToken will be kept in the contract and ready to be withdrawn by the owner.
- Implement a `function takeFee(address token)` and only the owner of the contract can call it. The owner should get the token fees that are accumulated in the contract.

## Write 3 contracts:

- A **SafeUpgradeable** implementation contract, but **in Proxy pattern**.
    - Constructor needs to become a separate callable function.
- A **proxy contract** ([ref](https://fravoll.github.io/solidity-patterns/proxy_delegate.html)1, [ref](https://solidity-by-example.org/app/upgradeable-proxy/)2) with a few important specifications:
    - Use unstructured storage to store “owner” and “implementation”. As in [here](https://blog.openzeppelin.com/upgradeability-using-unstructured-storage/)
    - The “owner” should be able to update the implementation of the proxy.
- A **SafeFactory contract**: a factory that deploys proxies that point to the **SafeUpgradeable** implementation.
    - Stores the address of the Safe Implementation in a storage.
    - `function updateImplementation(address newImp) external`
        - The Safe implementation address can only be updated by the owner of the Factory contract.
    - `function deploySafeProxy() external`
        - Deploys a proxy, points the proxy to the current Safe Implementation. Initializes the proxy so that the message sender is the owner of the new Safe.
    - `function deploySafe() external`
        - Deploys the original Safe contract. Note that you might need to modify the Safe contract so that the original caller of the `deploySafe` contract will be the owner of the deployed "Safe” contract.

## Write tests

- Make sure the tax calculations are done correctly in the modified Safe contract.
- the tests should indicate that the system works as intended. E.g.
    - the caller of deploySafe is the owner of the deployed Safe contract
    - the caller of deploySafeProxy is the owner of the deployed Proxy.
    - After `updateImplementation` is being called, a newly deployed proxy with `deploySafeProxy()` points to the new implementation instead of the old one.

## Assessment

- Use Solidity Test Coverage to see how well covered is your tests (Note that high coverage does not necessarily mean high quality tests)
    - [https://www.npmjs.com/package/solidity-coverage](https://www.npmjs.com/package/solidity-coverage)
- Use Hardhat gas reporter to assess the gas of `deploySafeProxy()` and `deploySafe()`.
    - [https://www.npmjs.com/package/hardhat-gas-reporter](https://www.npmjs.com/package/hardhat-gas-reporter)

##
