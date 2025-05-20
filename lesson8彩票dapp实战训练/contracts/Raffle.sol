// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

error Raffle__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);
error Raffle__TransferFailed();
error Raffle__SendMoreToEnterRaffle();
error Raffle__RaffleNotOpen();

contract Raffle {
    enum RaffleState { OPEN, CALCULATING }

    address private s_owner;
    uint256 private immutable i_interval;
    uint256 private immutable i_entranceFee;
    uint256 private s_lastTimeStamp;
    address private s_recentWinner;
    address payable[] private s_players;
    RaffleState private s_raffleState;

    event RaffleEnter(address indexed player);
    event WinnerPicked(address indexed player);

    modifier onlyOwner() {
        require(msg.sender == s_owner, "Not owner");
        _;
    }

    constructor(uint256 interval, uint256 entranceFee) {
        s_owner = msg.sender;
        i_interval = interval;
        i_entranceFee = entranceFee;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) revert Raffle__SendMoreToEnterRaffle();
        if (s_raffleState != RaffleState.OPEN) revert Raffle__RaffleNotOpen();
        s_players.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    function manualTriggerDraw() external onlyOwner {
        require(block.timestamp - s_lastTimeStamp >= i_interval, "Interval not passed");
        require(s_players.length > 0, "No players");
        require(s_raffleState == RaffleState.OPEN, "Raffle not open");

        s_raffleState = RaffleState.CALCULATING;
        _selectWinner();
    }

    function _selectWinner() private {
        uint256 pseudoRandom = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao)));
        uint256 index = pseudoRandom % s_players.length;
        address payable winner = s_players[index];

        s_recentWinner = winner;
        s_players = new address payable[](0);
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;

        (bool success, ) = winner.call{value: address(this).balance}("");
        if (!success) revert Raffle__TransferFailed();
        emit WinnerPicked(winner);
    }

    //======================= Getter 函数 =======================//
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getOwner() public view returns (address) {
        return s_owner;
    }
}