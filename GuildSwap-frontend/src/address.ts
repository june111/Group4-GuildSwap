import BigNumber from "bignumber.js";
import Web3 from "web3";
import bep20_abi from './bep20abi.json';

export const contractAddress = "0x1964fe51eeCdAA5858214f286d4154Cafa5c5F68";
export const BUSDContractAddress = "0xdA9c9d10130d84f49898aF81D5beF7AA67077834";
export const PLANTContractAddress = "0x1d59AC95be8becA40C295Ea049ad31C19959Ef19";
export const UNIContractAddress = "0xA75f472BA6F52F1D080f080526092A1ecD26125a";
export const YGGContractAddress = "0xE745600b2960C5F7cCc68054223aA79DE0207F51";
export const AXSContractAddress = "0x354b06C1ab529BDbfbD11F984Cb2385243e8Fb76";
export const OwnerAddress = "0x8844fcde9037a54a8E48c5a6fd1728C31661BE3A";

export const approve = (amount: number, tokenContractAddress: string, fromAddress: string) => {
    const value = new BigNumber(amount.toString()).multipliedBy(1000000000000000000).toFixed();
    const web3 = new Web3(window.ethereum);
    const erc20Instance = new web3.eth.Contract(bep20_abi as any, tokenContractAddress, {
      gasPrice: "21000000000"
    });
    return new Promise<boolean>((fulfill, reject) => {
      erc20Instance.methods.approve(contractAddress, value).send({ from: fromAddress }, (err: any, transactionHash: any) => {
        if (err) {
          fulfill(false);
        } else {
          fulfill(true);
        }
      });
    });
  }

