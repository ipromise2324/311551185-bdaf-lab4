const { expect } = require('chai');

describe('Lab4_SafeUpgradeable', function () {
    let ERC20;
    let SafeWallet;
    let erc20;
    let safeWallet;
    let owner;
    let user;
    let amount = 1000;
    let depositAmount = 1000;
    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();
        ERC20 = await ethers.getContractFactory('ERC20');
        erc20 = await ERC20.deploy();

        SafeWallet = await ethers.getContractFactory('SafeUpgradeable');
        safeWallet = await SafeWallet.deploy();
        await erc20.approve(safeWallet.address, amount);
    }); 

    it("should initialize the contract only once", async function() {
        await safeWallet.initialize(owner.address);
        await expect(safeWallet.initialize(owner.address)).to.be.revertedWith("already initialized");
    });
    // Before initializing, no function can be used
    it("should not allow deposit before initialization", async function() {
        await expect(safeWallet.deposit(erc20.address, 1)).to.be.revertedWith("Not Init yet!!!");
    });
    it("should not allow taking fees before initialization", async function() {
        await expect(safeWallet.takeFee(erc20.address)).to.be.revertedWith("Not Init yet!!!");
    });
    it("should not allow withdraw before initialization", async function() {
        await expect(safeWallet.withdraw(erc20.address, amount)).to.be.revertedWith("Not Init yet!!!");
    });
    it("should not allow taking fees before initialization", async function() {
        await expect(safeWallet.takeFee(erc20.address)).to.be.revertedWith("Not Init yet!!!");
    });

    it('should deposit 1000 tokens and charge a fee of 1 token', async function () {
        const feePercentage = 1;
        await safeWallet.initialize(owner.address);
        await safeWallet.deposit(erc20.address, depositAmount);
        const balance = await safeWallet.getBalance(erc20.address);
        const fees = await safeWallet.getFees(erc20.address);

        expect(balance).to.equal(depositAmount - (depositAmount * feePercentage) / 1000);
        expect(fees).to.equal((depositAmount * feePercentage) / 1000);
    });
    
    it("should revert if non-owner tries to take fees", async () => {
        await safeWallet.initialize(owner.address);
        const nonOwner = user; 
        await expect(safeWallet.connect(nonOwner).takeFee(erc20.address)).to.be.revertedWith("Only owner can take fees");
    });
    it('should allow the owner to take fees', async function () {
        await safeWallet.initialize(owner.address);
        await safeWallet.deposit(erc20.address, depositAmount);

        const initialBalance = await erc20.balanceOf(owner.address);
        const fees = await safeWallet.getFees(erc20.address);
        await safeWallet.takeFee(erc20.address);

        const finalBalance = await erc20.balanceOf(owner.address);
        expect(finalBalance).to.equal(initialBalance.add(fees));
    });
});