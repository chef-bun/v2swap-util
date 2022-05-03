// SPDX-License-Identifier: MIT
pragma solidity >= 0.6.0;

import "contracts/PancakeRouter.sol";
import "contracts/interfaces/IPancakePair.sol";
import "contracts/interfaces/IPancakeFactory.sol";
import "contracts/interfaces/IERC20.sol";

contract PancakePairUtils {

    address public factory;
    address payable public router;
    address public pair;
    address public tokenA;
    address public tokenB;

    event AddLiquidity(address indexed token0, address indexed token1, uint amount0, uint amount1, uint liquidity);

    constructor(address _tokenA, address _tokenB, address _factory, address payable _router, address _pair) public {
        tokenA = _tokenA;
        tokenB = _tokenB;
        factory = _factory;
        router = _router;
        require(IPancakeFactory(_factory).getPair(_tokenA, _tokenB) == _pair, "Invalid LP pair");
        pair = _pair;
    }

    function addRouterLiquidity(
        bool _tokenA,
        uint _addition,
        uint _amountADesired,
        uint _amountBDesired,
        uint _amountAMin,
        uint _amountBMin,
        address _to,
        uint _deadline
    ) external {

        require(_addition > 0, "Addtion token amount must greater than 0");

        if (_tokenA) {
            IERC20(tokenA).transfer(pair, _addition);
        } else {
            IERC20(tokenB).transfer(pair, _addition);
        }

        IPancakePair(pair).sync();

        (uint amountA, uint amountB, uint liquidity) = PancakeRouter(router).addLiquidity(tokenA, tokenB, _amountADesired, _amountBDesired, _amountAMin, _amountBMin, _to, _deadline);
        
        emit AddLiquidity(tokenA, tokenB, amountA, amountB, liquidity);
    }
    
    function approve(address _token, address _spender, uint256 _amount) external {
        require(_spender != address(0), "Invalid spender address");
        require(_amount > 0, "Invalid approve amount");

        IERC20(_token).approve(_spender, _amount);
    }

    function transferBack(address _token, address _to, uint _amount) external {
        require(_token != address(0), "Invalid token address");
        require(_to != address(0), "Invalid receiver address");
        require(_amount > 0, "Invalid approve amount");

        uint256 bal = IERC20(_token).balanceOf(address(this));
        require(_amount < bal, "Insufficient balance");

        IERC20(_token).transfer(_to, _amount);
    }
}
