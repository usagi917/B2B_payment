// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MilestoneEscrow
 * @notice 和牛肥育工程のマイルストーンベースエスクローコントラクト
 * @dev 1ロット = 1コントラクトインスタンス
 *
 * 重要: これはB2B取引の決済インフラであり、投資商品ではありません。
 * 監査未実施のため、実資金での運用は禁止です。
 */
contract MilestoneEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Enums ============
    enum MilestoneState {
        PENDING,    // 未申請
        SUBMITTED,  // 申請済み（承認待ち）
        APPROVED    // 承認済み（解放完了）
    }

    // ============ Structs ============
    struct Milestone {
        string code;           // 工程コード (E1, E2, E3_01, etc.)
        uint256 bps;           // 解放率 (10000 = 100%)
        MilestoneState state;
        bytes32 evidenceHash;  // エビデンスハッシュ
        string evidenceText;   // エビデンステキスト（オンチェーン）
        uint256 submittedAt;   // 申請タイムスタンプ
        uint256 approvedAt;    // 承認タイムスタンプ
    }

    // ============ State Variables ============
    IERC20 public immutable token;
    address public immutable buyer;
    address public immutable producer;
    address public immutable admin;
    uint256 public immutable totalAmount;

    uint256 public lockedAmount;
    uint256 public releasedAmount;
    uint256 public refundedAmount;
    bool public cancelled;

    Milestone[] public milestones;

    // ============ Events ============
    event Locked(uint256 amount, address indexed actor);
    event Submitted(uint256 indexed index, string code, bytes32 evidenceHash, address indexed actor);
    event Released(uint256 indexed index, string code, uint256 amount, address indexed actor);
    event Cancelled(string reason, uint256 refundAmount, address indexed actor);

    // ============ Errors ============
    error OnlyBuyer();
    error OnlyProducer();
    error OnlyAdmin();
    error AlreadyLocked();
    error NotLocked();
    error AlreadyCancelled();
    error InvalidMilestoneIndex();
    error MilestoneNotPending();
    error MilestoneNotSubmitted();
    error TransferFailed();

    // ============ Modifiers ============
    modifier onlyBuyer() {
        if (msg.sender != buyer) revert OnlyBuyer();
        _;
    }

    modifier onlyProducer() {
        if (msg.sender != producer) revert OnlyProducer();
        _;
    }

    modifier onlyAdmin() {
        if (msg.sender != admin) revert OnlyAdmin();
        _;
    }

    modifier notCancelled() {
        if (cancelled) revert AlreadyCancelled();
        _;
    }

    modifier whenLocked() {
        if (lockedAmount == 0) revert NotLocked();
        _;
    }

    // ============ Constructor ============
    /**
     * @param _token ERC20トークンアドレス
     * @param _buyer Buyerアドレス（ロック・承認権限）
     * @param _producer Producerアドレス（申請権限）
     * @param _admin Adminアドレス（キャンセル権限）
     * @param _totalAmount 総額
     */
    constructor(
        address _token,
        address _buyer,
        address _producer,
        address _admin,
        uint256 _totalAmount
    ) {
        require(_token != address(0), "Invalid token");
        require(_buyer != address(0), "Invalid buyer");
        require(_producer != address(0), "Invalid producer");
        require(_admin != address(0), "Invalid admin");
        require(_totalAmount > 0, "Invalid amount");

        token = IERC20(_token);
        buyer = _buyer;
        producer = _producer;
        admin = _admin;
        totalAmount = _totalAmount;

        // マイルストーン初期化（合計10000 bps = 100%）
        _initializeMilestones();
    }

    // ============ Internal Functions ============
    function _initializeMilestones() internal {
        // E1: 契約・個体登録 (10%)
        milestones.push(Milestone({
            code: "E1",
            bps: 1000,
            state: MilestoneState.PENDING,
            evidenceHash: bytes32(0),
            evidenceText: "",
            submittedAt: 0,
            approvedAt: 0
        }));

        // E2: 初期検疫・導入 (10%)
        milestones.push(Milestone({
            code: "E2",
            bps: 1000,
            state: MilestoneState.PENDING,
            evidenceHash: bytes32(0),
            evidenceText: "",
            submittedAt: 0,
            approvedAt: 0
        }));

        // E3_01〜E3_06: 月次肥育記録×6 (各5%)
        for (uint i = 1; i <= 6; i++) {
            milestones.push(Milestone({
                code: string(abi.encodePacked("E3_0", _uint2str(i))),
                bps: 500,
                state: MilestoneState.PENDING,
                evidenceHash: bytes32(0),
                evidenceText: "",
                submittedAt: 0,
                approvedAt: 0
            }));
        }

        // E4: 出荷準備 (10%)
        milestones.push(Milestone({
            code: "E4",
            bps: 1000,
            state: MilestoneState.PENDING,
            evidenceHash: bytes32(0),
            evidenceText: "",
            submittedAt: 0,
            approvedAt: 0
        }));

        // E5: 出荷 (20%)
        milestones.push(Milestone({
            code: "E5",
            bps: 2000,
            state: MilestoneState.PENDING,
            evidenceHash: bytes32(0),
            evidenceText: "",
            submittedAt: 0,
            approvedAt: 0
        }));

        // E6: 受領・検収 (20%)
        milestones.push(Milestone({
            code: "E6",
            bps: 2000,
            state: MilestoneState.PENDING,
            evidenceHash: bytes32(0),
            evidenceText: "",
            submittedAt: 0,
            approvedAt: 0
        }));
    }

    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    // ============ External Functions ============

    /**
     * @notice Buyerが総額をロック
     * @dev 事前にtoken.approve(address(this), totalAmount)が必要
     */
    function lock() external onlyBuyer notCancelled nonReentrant {
        if (lockedAmount > 0) revert AlreadyLocked();

        // State update first (CEI pattern)
        lockedAmount = totalAmount;

        // External call
        token.safeTransferFrom(msg.sender, address(this), totalAmount);

        emit Locked(totalAmount, msg.sender);
    }

    /**
     * @notice Producerが工程完了を申請
     * @param index マイルストーンインデックス
     * @param evidenceText エビデンステキスト（オンチェーンに保存）
     */
    function submit(uint256 index, string calldata evidenceText)
        external
        onlyProducer
        whenLocked
        notCancelled
    {
        if (index >= milestones.length) revert InvalidMilestoneIndex();
        if (milestones[index].state != MilestoneState.PENDING) revert MilestoneNotPending();

        bytes32 evidenceHash = keccak256(bytes(evidenceText));
        milestones[index].state = MilestoneState.SUBMITTED;
        milestones[index].evidenceHash = evidenceHash;
        milestones[index].evidenceText = evidenceText;
        milestones[index].submittedAt = block.timestamp;

        emit Submitted(index, milestones[index].code, evidenceHash, msg.sender);
    }

    /**
     * @notice Buyerがマイルストーンを承認し、該当分を解放
     * @param index マイルストーンインデックス
     */
    function approve(uint256 index)
        external
        onlyBuyer
        whenLocked
        notCancelled
        nonReentrant
    {
        if (index >= milestones.length) revert InvalidMilestoneIndex();
        if (milestones[index].state != MilestoneState.SUBMITTED) revert MilestoneNotSubmitted();

        uint256 remaining = lockedAmount - releasedAmount;
        uint256 releaseAmount = (totalAmount * milestones[index].bps) / 10000;

        bool isLastApproval = true;
        for (uint256 i = 0; i < milestones.length; i++) {
            if (i == index) continue;
            if (milestones[i].state != MilestoneState.APPROVED) {
                isLastApproval = false;
                break;
            }
        }
        if (isLastApproval) {
            releaseAmount = remaining;
        } else if (releaseAmount > remaining) {
            releaseAmount = remaining;
        }

        // State update first (CEI pattern)
        milestones[index].state = MilestoneState.APPROVED;
        milestones[index].approvedAt = block.timestamp;
        releasedAmount += releaseAmount;

        // External call
        token.safeTransfer(producer, releaseAmount);

        emit Released(index, milestones[index].code, releaseAmount, msg.sender);
    }

    /**
     * @notice Adminがエスクローをキャンセルし、未解放分をBuyerに返金
     * @param reason キャンセル理由
     */
    function cancel(string calldata reason)
        external
        onlyAdmin
        notCancelled
        nonReentrant
    {
        uint256 refund = lockedAmount - releasedAmount;

        // State update first (CEI pattern)
        cancelled = true;
        refundedAmount = refund;

        // External call
        if (refund > 0) {
            token.safeTransfer(buyer, refund);
        }

        emit Cancelled(reason, refund, msg.sender);
    }

    // ============ View Functions ============

    /**
     * @notice マイルストーン数を返す
     */
    function milestonesLength() external view returns (uint256) {
        return milestones.length;
    }

    /**
     * @notice 指定インデックスのマイルストーン情報を返す
     */
    function milestone(uint256 index) external view returns (
        string memory code,
        uint256 bps,
        MilestoneState state,
        bytes32 evidenceHash,
        string memory evidenceText,
        uint256 submittedAt,
        uint256 approvedAt
    ) {
        require(index < milestones.length, "Invalid index");
        Milestone storage m = milestones[index];
        return (m.code, m.bps, m.state, m.evidenceHash, m.evidenceText, m.submittedAt, m.approvedAt);
    }

    /**
     * @notice コントラクトサマリーを返す
     */
    function getSummary() external view returns (
        address _token,
        address _buyer,
        address _producer,
        address _admin,
        uint256 _totalAmount,
        uint256 _lockedAmount,
        uint256 _releasedAmount,
        uint256 _refundedAmount,
        bool _cancelled,
        uint256 _milestonesCount
    ) {
        return (
            address(token),
            buyer,
            producer,
            admin,
            totalAmount,
            lockedAmount,
            releasedAmount,
            refundedAmount,
            cancelled,
            milestones.length
        );
    }
}
