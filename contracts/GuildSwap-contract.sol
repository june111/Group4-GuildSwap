pragma solidity ^0.5.16;

/**
 * @dev Wrappers over Solidity's arithmetic operations with added overflow
 * checks.
 *
 * Arithmetic operations in Solidity wrap on overflow. This can easily result
 * in bugs, because programmers usually assume that an overflow raises an
 * error, which is the standard behavior in high level programming languages.
 * `SafeMath` restores this intuition by reverting the transaction when an
 * operation overflows.
 *
 * Using this library instead of the unchecked operations eliminates an entire
 * class of bugs, so it's recommended to use it always.
 */
library SafeMath {
  /**
   * @dev Returns the addition of two unsigned integers, reverting on
   * overflow.
   *
   * Counterpart to Solidity's `+` operator.
   *
   * Requirements:
   * - Addition cannot overflow.
   */
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    require(c >= a, "SafeMath: addition overflow");

    return c;
  }

  /**
   * @dev Returns the subtraction of two unsigned integers, reverting on
   * overflow (when the result is negative).
   *
   * Counterpart to Solidity's `-` operator.
   *
   * Requirements:
   * - Subtraction cannot overflow.
   */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    return sub(a, b, "SafeMath: subtraction overflow");
  }

  /**
   * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
   * overflow (when the result is negative).
   *
   * Counterpart to Solidity's `-` operator.
   *
   * Requirements:
   * - Subtraction cannot overflow.
   */
  function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
    require(b <= a, errorMessage);
    uint256 c = a - b;

    return c;
  }

  /**
   * @dev Returns the multiplication of two unsigned integers, reverting on
   * overflow.
   *
   * Counterpart to Solidity's `*` operator.
   *
   * Requirements:
   * - Multiplication cannot overflow.
   */
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
    if (a == 0) {
      return 0;
    }

    uint256 c = a * b;
    require(c / a == b, "SafeMath: multiplication overflow");

    return c;
  }

  /**
   * @dev Returns the integer division of two unsigned integers. Reverts on
   * division by zero. The result is rounded towards zero.
   *
   * Counterpart to Solidity's `/` operator. Note: this function uses a
   * `revert` opcode (which leaves remaining gas untouched) while Solidity
   * uses an invalid opcode to revert (consuming all remaining gas).
   *
   * Requirements:
   * - The divisor cannot be zero.
   */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    return div(a, b, "SafeMath: division by zero");
  }

  /**
   * @dev Returns the integer division of two unsigned integers. Reverts with custom message on
   * division by zero. The result is rounded towards zero.
   *
   * Counterpart to Solidity's `/` operator. Note: this function uses a
   * `revert` opcode (which leaves remaining gas untouched) while Solidity
   * uses an invalid opcode to revert (consuming all remaining gas).
   *
   * Requirements:
   * - The divisor cannot be zero.
   */
  function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
    // Solidity only automatically asserts when dividing by 0
    require(b > 0, errorMessage);
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold

    return c;
  }

  /**
   * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
   * Reverts when dividing by zero.
   *
   * Counterpart to Solidity's `%` operator. This function uses a `revert`
   * opcode (which leaves remaining gas untouched) while Solidity uses an
   * invalid opcode to revert (consuming all remaining gas).
   *
   * Requirements:
   * - The divisor cannot be zero.
   */
  function mod(uint256 a, uint256 b) internal pure returns (uint256) {
    return mod(a, b, "SafeMath: modulo by zero");
  }

  /**
   * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
   * Reverts with custom message when dividing by zero.
   *
   * Counterpart to Solidity's `%` operator. This function uses a `revert`
   * opcode (which leaves remaining gas untouched) while Solidity uses an
   * invalid opcode to revert (consuming all remaining gas).
   *
   * Requirements:
   * - The divisor cannot be zero.
   */
  function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
    require(b != 0, errorMessage);
    return a % b;
  }
}


contract BEP20Token{      //interface也可以，目前还不知道其中区别，后期更新
    //以下是该合约实现的方法和公用变量
    uint256 public totalSupply;

    // mapping (address => uint256) public balanceOf;
    // mapping (address => mapping (address => uint256)) public allowance;

    function allowance(address _owner, address spender) external view returns (uint256);
    function increaseAllowance(address spender, uint256 addedValue) public returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}


contract GuildSwapRouter {
    
    using SafeMath for uint256;
    
    struct PoolItem {
        uint256 exchangeValue;
        uint256 targetTokenValue;
        uint256 currentExchangeValue;
        uint256 currentTargetTokenValue;
    }

    struct TokenValuePair {
        uint256 exchangeTotalValue;
        uint256 targetTokenTotalValue;
        bool isValid;
    }
    
    struct TradeWrap{
        uint256 blockNumber;
        uint256 tradePrice;
    }
    
    struct TokenPair {
        address targetTokenContractAddress;
        address exchangeTokenContractAddress;
    }
    

    // address private EXCHANGE_CONTRACT_ADDRESS = 0xdA9c9d10130d84f49898aF81D5beF7AA67077834;
    address private owner;
    
    uint256 public balance;
    // bool public allow;


    

    mapping(address => TokenValuePair) private pairMap;  // targetContactAddress => TokenPair
    mapping(uint256 => PoolItem) private pool;  // poolKeyIndex => PoolItem  为了做提供流动性的收益分配
    mapping(address => mapping(address => uint256[])) private poolKeyIndexMap;  // msg.sender => (targetContactAddress => [poolKeyIndex]) 为了做提供流动性的收益分配
    mapping(address => TradeWrap[]) private priceHistory;  // targetContactAddress => TradeWrap[]
    TokenPair[] tokenPair;
    uint256 poolKeyIndex = 0;
    uint256 feeBox = 0;
    
    constructor() public {
        owner = msg.sender;
    }

    function createPair(address targetContractAddress, address exchangeContractAddress, uint256 targetTokenValue, uint256 exchangeValue) external returns(bool) {
        require(pairMap[targetContractAddress].isValid != true);
        
        BEP20Token(targetContractAddress).transferFrom(msg.sender, address(this), targetTokenValue);
        BEP20Token(exchangeContractAddress).transferFrom(msg.sender, address(this), exchangeValue);

        poolKeyIndex += 1;
        pairMap[targetContractAddress] = TokenValuePair({
            targetTokenTotalValue: targetTokenValue,
            exchangeTotalValue: exchangeValue,
            isValid: true
        });
        pool[poolKeyIndex] = PoolItem({
            exchangeValue: exchangeValue,
            targetTokenValue: targetTokenValue,
            currentExchangeValue: exchangeValue,
            currentTargetTokenValue: targetTokenValue
        });
        poolKeyIndexMap[msg.sender][targetContractAddress].push(poolKeyIndex);
        
        tokenPair.push(TokenPair({
            targetTokenContractAddress: targetContractAddress,
            exchangeTokenContractAddress: exchangeContractAddress
        }));

        return true;
    }
    
    function countPrice(uint256 targetTokenValue, uint256 universalTokenValue) private pure returns(uint256, bool) {
        if (targetTokenValue >= universalTokenValue) {
            return (targetTokenValue.div(universalTokenValue), true);
        } else {
            return (universalTokenValue.div(targetTokenValue), false);
        }
    }
    
    function getTokenAddresses() external view returns(address[] memory, address[] memory) {
        address[] memory targetTokens = new address[](tokenPair.length);
        address[] memory exchangeTokens = new address[](tokenPair.length);
        for (uint i=0; i<tokenPair.length; i++) {
            targetTokens[i] = tokenPair[i].targetTokenContractAddress;
            exchangeTokens[i] = tokenPair[i].exchangeTokenContractAddress;
        }
        return (targetTokens, exchangeTokens);
    }
    
    function getPair(address contractAddress) external view returns(uint256 exchangeTotalValue, uint256 targetTokenValue) {
        TokenValuePair memory tokenValuePair = pairMap[contractAddress];
        exchangeTotalValue = tokenValuePair.exchangeTotalValue;
        targetTokenValue = tokenValuePair.targetTokenTotalValue;
    }
    
    function getOwnerPools(address contractAddress) external view returns(uint256 [] memory, uint256 [] memory) {
        uint256[] memory keyIndexs = poolKeyIndexMap[msg.sender][contractAddress];
        uint256[] memory exchangeTokenValues = new uint256[](keyIndexs.length);
        uint256[] memory targetTokenValues = new uint256[](keyIndexs.length);
        
        for (uint i=0; i<keyIndexs.length; i++) {
            PoolItem memory poolItem = pool[keyIndexs[i]];
            exchangeTokenValues[i] = poolItem.exchangeValue;
            targetTokenValues[i] = poolItem.targetTokenValue;
        }
        
        return (exchangeTokenValues, targetTokenValues);
    }
    
    function getOwner() external view returns(address) {
        return owner;
    }
    
    function getContractBalance(address tokenContractAddress, address walletAddress) public payable returns(int256) {
        BEP20Token tokenContract = BEP20Token(tokenContractAddress);
        balance = tokenContract.balanceOf(walletAddress);
    }

    // swap
    function swap(address fromContractAddress, address toContractAddress, uint256 amount) public payable returns(bool) {
        require(fromContractAddress != toContractAddress);
        require(amount > 0);
        TokenValuePair memory toTokenValuePair = pairMap[toContractAddress];
        
        uint256 toPrice;
        bool flag;
        (toPrice, flag) = countPrice(toTokenValuePair.targetTokenTotalValue, toTokenValuePair.exchangeTotalValue);
        uint256 tradeFee = calFee(amount);
        amount = amount.sub(tradeFee);
        uint256 targetTokenAmount;
        if (flag == true){
            targetTokenAmount = amount.mul(toPrice);
        } else {
            targetTokenAmount = amount.div(toPrice);
        }
         
        
        BEP20Token(fromContractAddress).transferFrom(msg.sender, address(this), amount);
        // balance = targetTokenAmount;
        BEP20Token tokenContract = BEP20Token(toContractAddress);
        // 转账 给 msg.sender
        tokenContract.transfer(msg.sender, targetTokenAmount);
        // // - fromContractAddress amount  + toContractAddress EXCHANGE_TOKEN amount 流动性 相当与用 EXCHANGE_TOKEN 买 toToken
        pairMap[toContractAddress] = TokenValuePair({
            targetTokenTotalValue: toTokenValuePair.targetTokenTotalValue.sub(targetTokenAmount),
            exchangeTotalValue: toTokenValuePair.exchangeTotalValue.add(amount),
            isValid: true
        });

        feeBox = feeBox.add(tradeFee);
        addTradeHistory(toContractAddress, toPrice);
        return true;
    }
    
    // add liq
    function addLiq(address targetContractAddress, address exchangeContractAddress, uint256 targetTokenValue, uint256 exchangeValue) external returns(bool) {
        require(pairMap[targetContractAddress].isValid == true);
        
        BEP20Token(targetContractAddress).transferFrom(msg.sender, address(this), targetTokenValue);
        BEP20Token(exchangeContractAddress).transferFrom(msg.sender, address(this), exchangeValue);
        
        poolKeyIndex += 1;
        TokenValuePair memory tokenValuePair = pairMap[targetContractAddress];
        
        pairMap[targetContractAddress] = TokenValuePair({
            targetTokenTotalValue: tokenValuePair.targetTokenTotalValue.add(targetTokenValue),
            exchangeTotalValue: tokenValuePair.exchangeTotalValue.add(exchangeValue),
            isValid: true
        });
        
        pool[poolKeyIndex] = PoolItem({
            exchangeValue: exchangeValue,
            targetTokenValue: targetTokenValue,
            currentExchangeValue: exchangeValue,
            currentTargetTokenValue: targetTokenValue
        });
        poolKeyIndexMap[msg.sender][targetContractAddress].push(poolKeyIndex);
         
        return true;
    }
    
    function calFee(uint256 amount) private pure returns(uint256) {
        return amount.mul(3).div(1000);  // 0.3% 收续费
    }
    
    function addTradeHistory(address contractAddress, uint256 price) private {
        priceHistory[contractAddress].push(TradeWrap({
            blockNumber: block.number,
            tradePrice: price
        }));
    }
    
    function getTotalFee() external view returns(uint256) {
        return feeBox;
    }
    
    function getTradeHistory(address contractAddress) external view returns(uint256 [] memory, uint256 [] memory) {
        TradeWrap[] memory tradeWraps = priceHistory[contractAddress];
        uint256[] memory blocks = new uint256[](tradeWraps.length);
        uint256[] memory prices = new uint256[](tradeWraps.length);
        for (uint i=0; i<tradeWraps.length; i++) {
            blocks[i] = tradeWraps[i].blockNumber;
            prices[i] = tradeWraps[i].tradePrice;
        }
        return (blocks, prices);
    }
    
}