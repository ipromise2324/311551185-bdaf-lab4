const { expect } = require('chai');

describe('Lab4_Safe', function () {
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

        SafeWallet = await ethers.getContractFactory('Safe');
        safeWallet = await SafeWallet.deploy(owner.address);
        await erc20.approve(safeWallet.address, amount);
    }); 

    it("should revert if token transfer fails", async function () {
        // Transfer tokens to user1
        const transferAmount = 200;
        await erc20.transfer(user.address, transferAmount);
        const depositAmount = 500;
        await expect(
            safeWallet.connect(user).deposit(erc20.address, depositAmount)
          ).to.be.reverted;
        
    });

    it("should return the contract owner's address", async function() {
        expect(await safeWallet.getOwner()).to.equal(owner.address);
    });

    it("should revert deposit if amount is zero", async function() {
        const zeroAmount = 0;
        await expect(safeWallet.deposit(erc20.address, zeroAmount)).to.be.revertedWith("Amount must be greater than 0");
    });

    it("should revert deposit if sending to address(0)", async function() {
        await expect(safeWallet.deposit(ethers.constants.AddressZero, amount)).to.be.revertedWith("Can't send to 0x00.. address");
    });

    it("Deposit: amount must be greater than 0", async function() {
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
   
    it("should deposit tokens", async function () {
        await safeWallet.deposit(erc20.address, 1000);
        const balance = await safeWallet.getBalance(erc20.address);
        expect(balance).to.equal(999);
    });

    it("should withdraw tokens", async function () {
        await safeWallet.deposit(erc20.address, 1000);
        await safeWallet.withdraw(erc20.address, 500);
        const balance = await safeWallet.getBalance(erc20.address);
        expect(balance).to.equal(499);
    });

    it('should deposit 1000 tokens and charge a fee of 1 token', async function () {
        const feePercentage = 1;
        await safeWallet.deposit(erc20.address, depositAmount);
        const balance = await safeWallet.getBalance(erc20.address);
        const fees = await safeWallet.getFees(erc20.address);

        expect(balance).to.equal(depositAmount - (depositAmount * feePercentage) / 1000);
        expect(fees).to.equal((depositAmount * feePercentage) / 1000);
    });
    
    it("should revert if non-owner tries to take fees", async () => {
        const nonOwner = user; 
        await expect(safeWallet.connect(nonOwner).takeFee(erc20.address)).to.be.revertedWith("Only owner can take fees");
    });
    it('should allow the owner to take fees', async function () {
        await safeWallet.deposit(erc20.address, depositAmount);

        const initialBalance = await erc20.balanceOf(owner.address);
        const fees = await safeWallet.getFees(erc20.address);
        await safeWallet.takeFee(erc20.address);

        const finalBalance = await erc20.balanceOf(owner.address);
        expect(finalBalance).to.equal(initialBalance.add(fees));
    });

    it("should fail to takeFee when transfer function fails", async function() {
        const invalidToken = ethers.constants.AddressZero;
        await expect(safeWallet.takeFee(invalidToken)).to.be.reverted;
    });

    it("should fail to withdraw when transfer function fails", async function() {
        
        const invalidToken = ethers.constants.AddressZero;
        await expect(safeWallet.withdraw(invalidToken,0)).to.be.reverted;
    });
});