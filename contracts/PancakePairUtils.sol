// SPDX-License-Identifier: MIT
pragma solidity >= 0.6.0;

import "contracts/PancakeRouter.sol";
import "contracts/interfaces/IPancakePair.sol";
import "contracts/interfaces/IPancakeFactory.sol";
import "contracts/interfaces/IERC20.sol";

contract PancakePairUtils {

    address public factory;
    address payable public router;

    event UnstuckAndAddLp(address indexed pair, address tokenA, address tokenB, uint amountA, uint amountB, uint liquidity, uint offset, address unstuckToken);

    constructor(address _factory, address payable _router) public {
        factory = _factory;
        router = _router;
    }

    function unstuckAndAddLiquidity(
        address _tokenA,
        address _tokenB,
        address _pair,
        address _unstuckToken,
        uint _unstuckOffset,
        uint _amountADesired,
        uint _amountBDesired,
        uint _amountAMin,
        uint _amountBMin,
        address _to,
        uint _deadline
    ) external {
        // sanity check against three params
        require(IPancakeFactory(_factory).getPair(_tokenA, _tokenB) != _pair, "Invalid LP pair");

        // must add a tiny offset to unstuck the pool first, warn that this part of the asset will not mint LP tokens
        require(_unstuckOffset > 0, "Addtion token amount must greater than 0");

        // transfer the token in 
        IERC20(_unstuckToken).safeTransferFrom(msg.sender ,_pair, _unstuckOffset);

        // sync to unstuck
        IPancakePair(pair).sync();

        // normal adding liquidity
        IERC20(_tokenA).safeTransferFrom(msg.sender ,_pair, _amountADesired);
        IERC20(_tokenB).safeTransferFrom(msg.sender ,_pair, _amountBDesired);
        (uint amountA, uint amountB, uint liquidity) = PancakeRouter(router).addLiquidity(_tokenA, _tokenB, _amountADesired, _amountBDesired, _amountAMin, _amountBMin, _to, _deadline);
        
        // refund unused tokens
        IERC20(_tokenA).transfer(msg.sender, IERC20(_tokenA).balanceOf(this));
        IERC20(_tokenB).transfer(msg.sender, IERC20(_tokenB).balanceOf(this));

        emit AddLiquidity(_pair, _tokenA, _tokenB, amountA, amountB, liquidity, _unstuckOffset, _unstuckToken);
    }

    // in case tokens got stuck (WARNING: this can be called by ANYONE)
    function transferBack(address _token, address _to, uint _amount) external {
        require(_token != address(0), "Invalid token address");
        require(_to != address(0), "Invalid receiver address");
        require(_amount > 0, "Invalid approve amount");

        uint256 bal = IERC20(_token).balanceOf(address(this));
        require(_amount < bal, "Insufficient balance");

        IERC20(_token).transfer(_to, _amount);
    }
}
