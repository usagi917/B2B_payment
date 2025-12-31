// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title MilestoneNFT
 * @notice 和牛エスクローの状態を表すDynamic NFT
 * @dev 1エスクローコントラクト = 1 NFT
 */
contract MilestoneNFT is ERC721, Ownable {
    using Strings for uint256;

    interface IMilestoneEscrow {
        function buyer() external view returns (address);
    }

    uint256 private _nextTokenId;
    string public baseURI;

    // tokenId => escrow contract address
    mapping(uint256 => address) public escrowContracts;
    // escrow contract => tokenId (reverse lookup)
    mapping(address => uint256) public escrowToTokenId;

    event Minted(uint256 indexed tokenId, address indexed escrowContract, address indexed owner);

    error AlreadyMinted();
    error InvalidEscrowContract();
    error OnlyBuyer();

    constructor(string memory _baseURI) ERC721("Wagyu Milestone", "WAGYU") Ownable(msg.sender) {
        baseURI = _baseURI;
        _nextTokenId = 1; // Start from 1
    }

    /**
     * @notice エスクローコントラクトに対応するNFTをミント
     * @param escrowContract MilestoneEscrowコントラクトアドレス
     * @param to NFT受取アドレス
     */
    function mint(address escrowContract, address to) external onlyOwner returns (uint256) {
        if (escrowContract == address(0)) revert InvalidEscrowContract();
        if (escrowToTokenId[escrowContract] != 0) revert AlreadyMinted();

        uint256 tokenId = _nextTokenId++;

        escrowContracts[tokenId] = escrowContract;
        escrowToTokenId[escrowContract] = tokenId;

        _safeMint(to, tokenId);

        emit Minted(tokenId, escrowContract, to);
        return tokenId;
    }

    /**
     * @notice Buyerが自分宛にNFTをミント
     * @param escrowContract MilestoneEscrowコントラクトアドレス
     */
    function mintToBuyer(address escrowContract) external returns (uint256) {
        if (escrowContract == address(0)) revert InvalidEscrowContract();
        if (escrowToTokenId[escrowContract] != 0) revert AlreadyMinted();

        address buyer = IMilestoneEscrow(escrowContract).buyer();
        if (msg.sender != buyer) revert OnlyBuyer();

        uint256 tokenId = _nextTokenId++;

        escrowContracts[tokenId] = escrowContract;
        escrowToTokenId[escrowContract] = tokenId;

        _safeMint(buyer, tokenId);

        emit Minted(tokenId, escrowContract, buyer);
        return tokenId;
    }

    /**
     * @notice BaseURIを更新
     */
    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    /**
     * @notice tokenURIを返す（メタデータAPIを指す）
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(baseURI, "/api/nft/", tokenId.toString()));
    }

    /**
     * @notice 総発行数
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
}
