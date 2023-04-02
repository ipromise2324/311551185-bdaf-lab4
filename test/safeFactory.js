const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lab4_SafeFactory", function() {
    let safeFactory;
    let owner;
    let defaultImplementation;
    let defaultInstance;
    let defaultImplementationAddesss;
    beforeEach(async function() {
        [owner, usr] = await ethers.getSigners();
        const SafeFactory = await ethers.getContractFactory("SafeFactory");
        safeFactory = await SafeFactory.deploy();

        defaultInstance = await ethers.getContractFactory("SafeUpgradeable"); //use SafeUpgradeable contract as default iplmentatation
        defaultImplementation = await defaultInstance.deploy(); //deploy defaultImplementation
        defaultImplementationAddesss = await defaultImplementation.address; //get defaultImplementation's address
        await safeFactory.updateImplementation(defaultImplementationAddesss); //update safeFactory's safeAddress to default implemetation address  
    });
    it("should revert if called by a non-owner account", async function () {
        await expect(safeFactory.connect(usr).updateImplementation(ethers.constants.AddressZero)).to.be.revertedWith("Only owener can do this !!!");
    });
    it("should deploy a Safe with the caller as the owner", async function() {
        await safeFactory.deploySafe();
        const safeInstance = await ethers.getContractFactory("Safe");
        const safeAddesss = await safeFactory.safeAddress();
        const safe = await safeInstance.attach(safeAddesss);
        const safeOwner = await safe.owner(); //get owner of Safe contract
        expect(safeOwner).to.equal(owner.address);//check whether the caller of deploySafe is the owner of the deployed Safe contract
    });
    it("should allow only the admin to change the admin", async function () {
        const proxyInstance = await ethers.getContractFactory("Proxy");
        proxy = await proxyInstance.deploy();
        // Non-admin tries to change the admin
        await expect(proxy.connect(usr).changeAdmin(usr.address)).to.be.revertedWith("Only admin can call this function");
    
        // Admin changes the admin
        await proxy.connect(owner).changeAdmin(owner.address);
        expect(await proxy.admin()).to.equal(owner.address);
    });
    it("should allow only the admin to update the implementation", async function () {
        const proxyInstance = await ethers.getContractFactory("Proxy");
        proxy = await proxyInstance.deploy();
        // Non-admin tries to change the admin
        await expect(proxy.connect(usr).upgradeTo(usr.address)).to.be.revertedWith("Only admin can call this function");
    
        // Admin changes the admin
        await proxy.connect(owner).upgradeTo(owner.address);
        expect(await proxy.implementation()).to.equal(owner.address);
    });
    it("should deploy a Proxy with the caller as the owner", async function() {
        await safeFactory.deploySafeProxy();
        const proxyInstance = await ethers.getContractFactory("Proxy");
        const proxyAddress = await safeFactory.proxyAddress();
        const proxy = await proxyInstance.attach(proxyAddress);
        const proxyAdmin = await proxy.admin(); //get proxy's owner
        expect(proxyAdmin).to.equal(owner.address); //check whether the caller of deploySafeProxy is the owner of the deployed Proxy
    });

    it("should make sure that the owner of the proxy's implementation is safeFactory's owner", async function() {
        await safeFactory.deploySafeProxy();
        const proxyInstance = await ethers.getContractFactory("Proxy");
        const proxyAddress = await safeFactory.proxyAddress();
        const proxy = await proxyInstance.attach(proxyAddress);
        const implementationOwner = await proxy.getImplementationOwner(proxyAddress); //get he owner of Proxy's implementation contract
        expect(implementationOwner).to.equal(owner.address); //check whether the caller of the deployed deploySafeProxy is the owner of Proxy's implementation contract
    });
    
    it("should update the implementation contract for deploySafeProxy", async function() {
        const proxyInstance = await ethers.getContractFactory("Proxy");
        const newImplementation = await ethers.getContractFactory("SafeUpgradeable"); // use SafeUpgradeable contract as new iplmentatation

        const safe = await newImplementation.deploy(); //deploy newImplementation
        const safeAddesss = await safe.address; //get newImplementation's address
        await safeFactory.updateImplementation(safeAddesss); //update implemetation address in safeFactory

        await safeFactory.deploySafeProxy();
        const proxyAddress = await safeFactory.proxyAddress();
        const proxy = await proxyInstance.attach(proxyAddress);
        const newImp = await proxy.implementation(); //get proxy's implementation address 
        expect(newImp).to.equal(safeAddesss); //check whether proxy's implementation address is new one 
    });

    it("should fail if callInitialize failed", async function() {
        const proxyInstance = await ethers.getContractFactory("Proxy");
        proxy = await proxyInstance.deploy();
        const MockContract = await ethers.getContractFactory("ERC20");
        const mockContract = await MockContract.deploy();
        await expect(proxy.callInitialize(mockContract.address, owner.address)).to.be.revertedWith("Call failed");//ERC20 don't have getImplemcallInitialize，應該會觸發ntationOwner()
    });

    it("should fail if callInitialize failed", async function() {
        const proxyInstance = await ethers.getContractFactory("Proxy");
        proxy = await proxyInstance.deploy();
        const MockContract = await ethers.getContractFactory("ERC20");
        const mockContract = await MockContract.deploy();
        await expect(proxy.getImplementationOwner(mockContract.address)).to.be.revertedWith("Call failed"); //ERC20 don't have getImplementationOwner()
    });
});
