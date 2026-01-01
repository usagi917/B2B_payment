// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MilestoneEscrowV2 {
    struct Milestone {
        uint16 bps;
        bool completed;
    }

    address public immutable factory;
    address public immutable tokenAddress;
    address public immutable producer;
    uint256 public immutable tokenId;
    uint256 public immutable totalAmount;
    uint8 public immutable categoryType;

    address public buyer;
    bool public locked;
    string public title;
    string public description;
    string public imageURI;
    Milestone[] public milestones;
    uint256 public releasedAmount;

    event Locked(address indexed buyer, uint256 amount);
    event Completed(uint256 indexed index, uint256 amount);

    error Unauthorized();
    error InvalidState();
    error Failed();

    constructor(address f, address t, address p, uint256 tid, uint8 cat, string memory _title, string memory _desc, uint256 amt, string memory img) {
        factory = f;
        tokenAddress = t;
        producer = p;
        tokenId = tid;
        categoryType = cat;
        title = _title;
        description = _desc;
        totalAmount = amt;
        imageURI = img;

        uint16[11] memory w = [uint16(1000),1000,500,500,500,500,500,500,1000,2000,2000];
        uint16[5] memory s = [uint16(2000),2000,2000,2000,2000];
        uint16[4] memory c = [uint16(2500),2500,2500,2500];

        if (cat == 0) for(uint i; i < 11; i++) milestones.push(Milestone(w[i], false));
        else if (cat == 1) for(uint i; i < 5; i++) milestones.push(Milestone(s[i], false));
        else if (cat == 2) for(uint i; i < 4; i++) milestones.push(Milestone(c[i], false));
        else milestones.push(Milestone(10000, false));
    }

    function lock() external {
        if (locked) revert InvalidState();
        (bool ok,) = tokenAddress.call(abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), totalAmount));
        if (!ok) revert Failed();
        buyer = msg.sender;
        locked = true;
        (ok,) = factory.call(abi.encodeWithSignature("transferFrom(address,address,uint256)", address(this), msg.sender, tokenId));
        if (!ok) revert Failed();
        emit Locked(msg.sender, totalAmount);
    }

    function submit(uint256 i) external {
        if (msg.sender != producer) revert Unauthorized();
        if (!locked || i >= milestones.length || milestones[i].completed) revert InvalidState();
        milestones[i].completed = true;
        uint256 amt = (totalAmount * milestones[i].bps) / 10000;
        releasedAmount += amt;
        (bool ok,) = tokenAddress.call(abi.encodeWithSignature("transfer(address,uint256)", producer, amt));
        if (!ok) revert Failed();
        emit Completed(i, amt);
    }

    function getMilestones() external view returns (Milestone[] memory) { return milestones; }
    function getMilestoneCount() external view returns (uint256) { return milestones.length; }

    function getProgress() external view returns (uint256 comp, uint256 total) {
        total = milestones.length;
        for (uint i; i < total; i++) if (milestones[i].completed) comp++;
    }

    function getStatus() public view returns (string memory) {
        if (!locked) return "open";
        for (uint i; i < milestones.length; i++) if (!milestones[i].completed) return "active";
        return "completed";
    }

    function category() public view returns (string memory) {
        if (categoryType == 0) return "wagyu";
        if (categoryType == 1) return "sake";
        if (categoryType == 2) return "craft";
        return "other";
    }

    function getCore() external view returns (address, address, address, address, uint256, uint256, uint256, bool) {
        return (factory, tokenAddress, producer, buyer, tokenId, totalAmount, releasedAmount, locked);
    }

    function getMeta() external view returns (string memory, string memory, string memory, string memory, string memory) {
        return (category(), title, description, imageURI, getStatus());
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}

contract ListingFactory is ERC721 {
    address public immutable tokenAddress;
    address[] public listings;
    mapping(uint256 => address) public tokenIdToEscrow;
    uint256 private _nextTokenId;
    string public baseURI;

    event ListingCreated(uint256 indexed tokenId, address indexed escrow, address indexed producer, uint8 categoryType, uint256 totalAmount);

    constructor(address t, string memory uri) ERC721("MilestoneNFT", "MSNFT") {
        tokenAddress = t;
        baseURI = uri;
    }

    function createListing(uint8 cat, string calldata _title, string calldata desc, uint256 amt, string calldata img) external returns (address escrow, uint256 tid) {
        tid = _nextTokenId++;
        escrow = address(new MilestoneEscrowV2(address(this), tokenAddress, msg.sender, tid, cat, _title, desc, amt, img));
        listings.push(escrow);
        tokenIdToEscrow[tid] = escrow;
        _mint(escrow, tid);
        emit ListingCreated(tid, escrow, msg.sender, cat, amt);
    }

    function getListings() external view returns (address[] memory) { return listings; }
    function getListingCount() external view returns (uint256) { return listings.length; }
    function setBaseURI(string memory uri) external { baseURI = uri; }

    function tokenURI(uint256 tid) public view override returns (string memory) {
        _requireOwned(tid);
        return string.concat(baseURI, "/api/nft/", _toString(tid));
    }

    function _toString(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 t = v;
        uint256 d;
        while (t != 0) { d++; t /= 10; }
        bytes memory b = new bytes(d);
        while (v != 0) { b[--d] = bytes1(uint8(48 + v % 10)); v /= 10; }
        return string(b);
    }
}
