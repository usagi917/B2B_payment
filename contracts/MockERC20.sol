// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20
 * @notice テスト用のERC20トークン
 * @dev 本番環境では使用しないでください
 */
contract MockERC20 is ERC20 {
    uint8 private _decimals;

    /**
     * @param name トークン名
     * @param symbol トークンシンボル
     * @param decimals_ 小数点以下桁数
     */
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) {
        _decimals = decimals_;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @notice テスト用のmint関数
     * @param to 送付先アドレス
     * @param amount 数量
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice テスト用のburn関数
     * @param from 焼却元アドレス
     * @param amount 数量
     */
    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}
