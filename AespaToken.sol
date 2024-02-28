// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";



contract AespaToken is ERC20 {
    address public owner;
    uint256 private _blockReward;

    event BlockRewardSet(uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply, uint256 _blockRewardAmount) ERC20(_name, _symbol) {
        owner = msg.sender;
        _blockReward = _blockRewardAmount;
        _mint(owner, _totalSupply);
    }

    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }

    function _mintMinerReward() public {
        _mint(block.coinbase, _blockReward);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        if (from != address(0) && to != address(0)) {
            require(balanceOf(from) >= amount, "Insufficient balance!!!");
            if (from != address(0) && to != block.coinbase && block.coinbase != address(0)) {
                _mintMinerReward();
            }
        }
        super._beforeTokenTransfer(from, to, amount);
    }

    function setBlockReward(uint256 amount) external onlyOwner {
        _blockReward = amount;
        emit BlockRewardSet(amount);
    }

   function destroy(uint256 amount) external onlyOwner {
        _burn(msg.sender, amount);
    }


    function blockReward() external view returns (uint256) {
        return _blockReward;
    }
}
