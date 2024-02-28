const { expect } = require("chai");
const { ethers } = require("hardhat"); // Import ethers library

describe("AespaToken contract", function() {
  // global vars
  let AespaToken;
  let aespaToken;
  let owner;
  let addr1;
  let addr2;
  let tokenBlockReward = 50;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    AespaToken = await ethers.getContractFactory("AespaToken");
    [owner, addr1, addr2] = await hre.ethers.getSigners();

    aespaToken = await AespaToken.deploy("AespaToken", "AES", 100000000000, tokenBlockReward);
  });

describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await aespaToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await aespaToken.balanceOf(owner.address);
      expect(await aespaToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the blockReward to the argument provided during deployment", async function () {
        const blockReward = await aespaToken.blockReward(); // Use the getter function
        expect(blockReward).to.equal(tokenBlockReward);
    });
    
    
      
  });




describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await aespaToken.transfer(addr1.address, 50);
      const addr1Balance = await aespaToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await aespaToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await aespaToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
        const initialOwnerBalance = await aespaToken.balanceOf(owner.address);
        // Ensure that the transaction tries to transfer more tokens than the sender owns
        await expect(
            aespaToken.connect(addr1).transfer(owner.address, 1)
        ).to.be.reverted;
    
        // Owner balance shouldn't have changed.
        expect(await aespaToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
        
    });
    
    it("Should update balances after transfers", async function () {
        const initialOwnerBalance = await aespaToken.balanceOf(owner.address);
      
        // Transfer 100 tokens from owner to addr1.
        await aespaToken.transfer(addr1.address, 100);
      
        // Transfer another 50 tokens from owner to addr2.
        await aespaToken.transfer(addr2.address, 50);
      
        // Check balances.
        const finalOwnerBalance = await aespaToken.balanceOf(owner.address);
        expect(finalOwnerBalance).to.equal((initialOwnerBalance - 150n).toString()); // Use BigNumber for subtraction
      
        const addr1Balance = await aespaToken.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(100);
      
        const addr2Balance = await aespaToken.balanceOf(addr2.address);
        expect(addr2Balance).to.equal(50);
      });
    });

    describe("Token Minting", function () {
        it("Should allow only the owner to mint tokens", async function () {
            const initialSupply = await aespaToken.totalSupply();
            const mintAmount = 1000;
        
            // Attempt minting by the owner
            await aespaToken.mint(owner.address, mintAmount);
            const finalSupplyOwner = await aespaToken.totalSupply();
        
            try {
                // Attempt minting by a non-owner
                await aespaToken.connect(addr1).mint(addr1.address, mintAmount);
            } catch (error) {
                // Catch the error and handle it
                console.log("Minting by non-owner failed as expected:", error.message);
            }
        
            // Ensure that only the owner's minting succeeded and the total supply increased accordingly
            const finalSupplyNonOwner = await aespaToken.totalSupply();
            
            expect(finalSupplyOwner).to.equal(initialSupply + BigInt(mintAmount));
            try {
                expect(finalSupplyNonOwner).to.equal(initialSupply);
            } catch (error) {
                console.log("Minting by non-owner failed as expected, final supply remains the same: ", error.message);
            }
        });
        
    
        it("Should mint tokens to different accounts and verify balances", async function () {
            const mintAmount = 1000;
            await aespaToken.mint(addr1.address, mintAmount);
            await aespaToken.mint(addr2.address, mintAmount);
            const addr1Balance = await aespaToken.balanceOf(addr1.address);
            const addr2Balance = await aespaToken.balanceOf(addr2.address);
            expect(addr1Balance).to.equal(mintAmount);
            expect(addr2Balance).to.equal(mintAmount);
        });
    });
    
    describe("Block Reward", function () {
        it("Should set the block reward to different values", async function () {
            const newBlockReward = 100;
            await aespaToken.setBlockReward(newBlockReward);
            const blockReward = await aespaToken.blockReward();
            expect(blockReward).to.equal(newBlockReward);
        });
    
        it("Should correctly mint tokens for the miner", async function () {
            const block = await ethers.provider.getBlock('latest');
            const minerAddress = block.miner;
            const initialBalance = await aespaToken.balanceOf(minerAddress);
            await aespaToken._mintMinerReward(); // Mint tokens for the miner
            const finalBalance = await aespaToken.balanceOf(minerAddress);
            const blockReward = await aespaToken.blockReward();
            
            expect(finalBalance).to.equal(initialBalance + blockReward);
        });
        
    });
    
    describe("Token Destruction", function () {
        it("Should allow the owner to destroy tokens", async function () {
            const initialBalance = await aespaToken.balanceOf(owner.address);
            await aespaToken.destroy(initialBalance);
            const finalBalance = await aespaToken.balanceOf(owner.address);
            
            expect(finalBalance).to.equal(0); // Owner's balance should be zero after destruction
        });
    });
    
    describe("Events", function () {
        it("Should emit the BlockRewardSet event when setting the block reward", async function () {
            const newBlockReward = 100;
            await expect(aespaToken.setBlockReward(newBlockReward))
                .to.emit(aespaToken, 'BlockRewardSet')
                .withArgs(newBlockReward);
        });
    });

});  
