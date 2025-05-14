// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Calculator {
    event Calculation(
        address indexed user,
        string operation,
        uint256 num1,
        uint256 num2,
        uint256 result,
        uint256 timestamp
    );

    function add(uint256 _num1, uint256 _num2) external returns (uint256) {
        uint256 result = _num1 + _num2;
        emit Calculation(msg.sender, "ADD", _num1, _num2, result, block.timestamp);
        return result;
    }

    function sub(uint256 _num1, uint256 _num2) external returns (uint256) {
        require(_num1 >= _num2, "Subtraction error");
        uint256 result = _num1 - _num2;
        emit Calculation(msg.sender, "SUB", _num1, _num2, result, block.timestamp);
        return result;
    }

    function mul(uint256 _num1, uint256 _num2) external returns (uint256) {
        uint256 result = _num1 * _num2;
        emit Calculation(msg.sender, "MUL", _num1, _num2, result, block.timestamp);
        return result;
    }

    function div(uint256 _num1, uint256 _num2) external returns (uint256) {
        require(_num2 > 0, "Division by zero");
        uint256 result = _num1 / _num2;
        emit Calculation(msg.sender, "DIV", _num1, _num2, result, block.timestamp);
        return result;
    }
}