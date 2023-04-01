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

    it("should revert deposit if amount is zero", async function() {
        await safeWallet.initialize(owner.address);
        const zeroAmount = 0;
        await expect(safeWallet.deposit(erc20.address, zeroAmount)).to.be.revertedWith("Amount must be greater than 0");
    });

    it("should revert deposit if sending to address(0)", async function() {
        await safeWallet.initialize(owner.address);
        await expect(safeWallet.deposit(ethers.constants.AddressZero, amount)).to.be.revertedWith("Can't send to 0x00.. address");
    });

    it("Deposit: amount must be greater than 0", async function() {
        await safeWallet.initialize(owner.address);
        // Transfer tokens to user1
        const transferAmount = 100;
        await erc20.transfer(user.address, transferAmount);
        const depositAmount = 50;
    
        // Deposit tokens to safe
        await erc20.connect(user).approve(safeWallet.address, depositAmount);
        await safeWallet.connect(user).deposit(erc20.address, depositAmount);
    
        // Try to withdraw more than available balance
        await expect(safeWallet.connect(user).withdraw(erc20.address, 0)).to.be.revertedWith("Amount must be greater than 0");
    });

    it("should not allow withdrawing more than available balance", async function() {
        await safeWallet.initialize(owner.address);
        // Transfer tokens to user1
        const transferAmount = 100;
        await erc20.transfer(user.address, transferAmount);
        const depositAmount = 50;
        const withdrawAmount = 100;
    
        // Deposit tokens to safe
        await erc20.connect(user).approve(safeWallet.address, depositAmount);
        await safeWallet.connect(user).deposit(erc20.address, depositAmount);
    
        // Try to withdraw more than available balance
        await expect(safeWallet.connect(user).withdraw(erc20.address, withdrawAmount)).to.be.revertedWith("Not enough amount to withdraw");
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
    it("should not allow getBalance before initialization", async function() {
        await expect(safeWallet.getBalance(erc20.address)).to.be.revertedWith("Not Init yet!!!");
    });
    it("should not allow getFees before initialization", async function() {
        await expect(safeWallet.getFees(erc20.address)).to.be.revertedWith("Not Init yet!!!");
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