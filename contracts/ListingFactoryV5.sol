// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MilestoneEscrowV5
 * @notice Per-listing escrow with cancel support
 * @dev V5 adds cancel() for producer to cancel listing before lock
 */
contract MilestoneEscrowV5 is ReentrancyGuard {
    using SafeERC20 for IERC20;

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
    bool public cancelled;  // V5: Cancel state
    string public title;
    string public description;
    string public imageURI;
    Milestone[] public milestones;
    uint256 public releasedAmount;

    mapping(uint256 => bytes32) public evidenceHashes;

    event Locked(address indexed buyer, uint256 amount);
    event Completed(uint256 indexed index, uint256 amount, bytes32 evidenceHash);
    event Cancelled();  // V5: Cancel event

    error Unauthorized();
    error InvalidState();
    error InvalidCategory();
    error InvalidAmount();
    error InvalidToken();
    error SelfPurchase();

    constructor(
        address f,
        address t,
        address p,
        uint256 tid,
        uint8 cat,
        string memory _title,
        string memory _desc,
        uint256 amt,
        string memory img
    ) {
        if (cat > 2) revert InvalidCategory();
        if (f == address(0) || t == address(0)) revert InvalidToken();
        if (amt == 0) revert InvalidAmount();

        factory = f;
        tokenAddress = t;
        producer = p;
        tokenId = tid;
        categoryType = cat;
        title = _title;
        description = _desc;
        totalAmount = amt;
        imageURI = img;

        uint16[11] memory w = [uint16(1000), 1000, 500, 500, 500, 500, 500, 500, 1000, 2000, 2000];
        uint16[5] memory s = [uint16(2000), 2000, 2000, 2000, 2000];
        uint16[4] memory c = [uint16(2500), 2500, 2500, 2500];

        if (cat == 0) for (uint i; i < 11; i++) milestones.push(Milestone(w[i], false));
        else if (cat == 1) for (uint i; i < 5; i++) milestones.push(Milestone(s[i], false));
        else for (uint i; i < 4; i++) milestones.push(Milestone(c[i], false));
    }

    /**
     * @notice Cancel listing before lock
     * @dev Only producer can cancel, only when not locked
     */
    function cancel() external nonReentrant {
        if (msg.sender != producer) revert Unauthorized();
        if (locked || cancelled) revert InvalidState();

        cancelled = true;

        // Burn the NFT by transferring to factory (which will burn it)
        ListingFactoryV5(factory).burnNFT(tokenId);

        emit Cancelled();
    }

    function lock() external nonReentrant {
        if (locked || cancelled) revert InvalidState();  // V5: Check cancelled
        if (msg.sender == producer) revert SelfPurchase();
        buyer = msg.sender;
        locked = true;
        IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), totalAmount);
        IERC721(factory).safeTransferFrom(address(this), msg.sender, tokenId);
        emit Locked(msg.sender, totalAmount);
    }

    function submit(uint256 i, bytes32 _evidenceHash) external nonReentrant {
        if (msg.sender != producer) revert Unauthorized();
        if (!locked || cancelled || i >= milestones.length || milestones[i].completed) revert InvalidState();
        uint256 nextIndex = _nextIncompleteIndex();
        if (i != nextIndex) revert InvalidState();

        milestones[i].completed = true;
        evidenceHashes[i] = _evidenceHash;

        uint256 amt;
        if (i == milestones.length - 1) {
            amt = totalAmount - releasedAmount;
        } else {
            amt = (totalAmount * milestones[i].bps) / 10000;
        }
        releasedAmount += amt;
        IERC20(tokenAddress).safeTransfer(producer, amt);
        emit Completed(i, amt, _evidenceHash);
    }

    function _nextIncompleteIndex() internal view returns (uint256) {
        for (uint256 j; j < milestones.length; j++) {
            if (!milestones[j].completed) return j;
        }
        return milestones.length;
    }

    function getMilestones() external view returns (Milestone[] memory) {
        return milestones;
    }

    function getMilestoneCount() external view returns (uint256) {
        return milestones.length;
    }

    function getProgress() external view returns (uint256 comp, uint256 total) {
        total = milestones.length;
        for (uint i; i < total; i++) if (milestones[i].completed) comp++;
    }

    function getStatus() public view returns (string memory) {
        if (cancelled) return "cancelled";  // V5: Cancelled status
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

    function getCore()
        external
        view
        returns (address, address, address, address, uint256, uint256, uint256, bool)
    {
        return (factory, tokenAddress, producer, buyer, tokenId, totalAmount, releasedAmount, locked);
    }

    function getMeta()
        external
        view
        returns (string memory, string memory, string memory, string memory, string memory)
    {
        return (category(), title, description, imageURI, getStatus());
    }

    function getEvidenceHash(uint256 i) external view returns (bytes32) {
        return evidenceHashes[i];
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}

/**
 * @title ListingFactoryV5
 * @notice Factory for creating MilestoneEscrowV5 contracts with cancel support
 */
contract ListingFactoryV5 is ERC721 {
    address public immutable tokenAddress;
    address[] public listings;
    mapping(uint256 => address) public tokenIdToEscrow;
    uint256 private _nextTokenId;
    string public baseURI;

    event ListingCreated(
        uint256 indexed tokenId,
        address indexed escrow,
        address indexed producer,
        uint8 categoryType,
        uint256 totalAmount
    );
    event ListingCancelled(uint256 indexed tokenId, address indexed escrow);  // V5

    error InvalidCategory();
    error InvalidToken();
    error InvalidAmount();
    error Unauthorized();

    constructor(address t, string memory uri) ERC721("MilestoneNFT", "MSNFT") {
        if (t == address(0)) revert InvalidToken();
        tokenAddress = t;
        baseURI = uri;
    }

    function createListing(
        uint8 cat,
        string calldata _title,
        string calldata desc,
        uint256 amt,
        string calldata img
    ) external returns (address escrow, uint256 tid) {
        if (cat > 2) revert InvalidCategory();
        if (amt == 0) revert InvalidAmount();
        tid = _nextTokenId++;
        escrow = address(
            new MilestoneEscrowV5(address(this), tokenAddress, msg.sender, tid, cat, _title, desc, amt, img)
        );
        listings.push(escrow);
        tokenIdToEscrow[tid] = escrow;
        _safeMint(escrow, tid);
        emit ListingCreated(tid, escrow, msg.sender, cat, amt);
    }

    /**
     * @notice Burn NFT when listing is cancelled
     * @dev Only callable by the escrow contract that owns the NFT
     */
    function burnNFT(uint256 tid) external {
        address escrow = tokenIdToEscrow[tid];
        if (msg.sender != escrow) revert Unauthorized();
        if (ownerOf(tid) != escrow) revert Unauthorized();

        _burn(tid);
        emit ListingCancelled(tid, escrow);
    }

    function getListings() external view returns (address[] memory) {
        return listings;
    }

    function getListingCount() external view returns (uint256) {
        return listings.length;
    }

    function tokenURI(uint256 tid) public view override returns (string memory) {
        _requireOwned(tid);
        return string.concat(baseURI, "/api/nft/", _toString(tid));
    }

    function _toString(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 t = v;
        uint256 d;
        while (t != 0) {
            d++;
            t /= 10;
        }
        bytes memory b = new bytes(d);
        while (v != 0) {
            b[--d] = bytes1(uint8(48 + (v % 10)));
            v /= 10;
        }
        return string(b);
    }
}
