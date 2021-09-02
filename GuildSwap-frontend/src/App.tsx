import React from 'react';
import IconBsc from './images/icon_bsc.png';
import IconPlat from './images/icon_plat.png';
import IconArrow from './images/icon_arrow.png';
import Icon from './images/icon.png';
import './App.css';
import Web3 from "web3";
import { Button, Input, message, Spin } from 'antd';
import { ethers } from 'ethers';
import abi from './guildSwap.json';
import { BigNumber } from 'bignumber.js';
import { AddLiquidityPage } from './components/addLiquidity';
import { approve, contractAddress, UNIContractAddress } from './address';
import IconUni from './images/icon_uni.png';

enum Items {
  Swap = "Swap",
  Pool = "Pool",
  Charts = "Charts"
}

export enum Pages {
  Liquidity = "Liquidity",
  AddLiquidity = "AddLiquidity",
  CreatePairs = "CreatePairs"
}

interface State {
  selectedItem: Items;
  address: string;
  fromContractAmount: number;
  toContractAmount: number;
  price: number;
  page: Pages;
  isLoading: boolean;
  liquidityList: any[] | null;
}

export class App extends React.PureComponent<any, State> {

  private isMetamask = false;
  private provider = new ethers.providers.JsonRpcProvider(
    "https://data-seed-prebsc-2-s3.binance.org:8545/"
  );
  // private contractAddress = "0x1964fe51eeCdAA5858214f286d4154Cafa5c5F68";
  private exchangeContractAddress = "0xdA9c9d10130d84f49898aF81D5beF7AA67077834";// 计价货币
  private targetContractAddress = "0x1d59AC95be8becA40C295Ea049ad31C19959Ef19";// 目标货币
  private getGuildSwapContract = new ethers.Contract(
    contractAddress,
    abi,
    this.provider
  );

  constructor(props: any) {
    super(props);
    this.state = {
      selectedItem: Items.Swap,
      address: '',
      fromContractAmount: 0.0,
      toContractAmount: 0.0,
      price: 0,
      page: Pages.Liquidity,
      isLoading: false,
      liquidityList: null,
    }
  }

  showLoading = () => {
    this.setState({
      isLoading: true
    });
  }

  hideLoading = () => {
    this.setState({
      isLoading: false
    });
  }

  getWeb3 = async () => {
    this.setState({
      isLoading: true
    });
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        const res = await window.ethereum.enable();
        this.setState({
          address: res[0]
        });
        // Acccounts now exposed
        this.isMetamask = true
      } catch (error: any) {
        const errMsg = error.message;
        alert(errMsg as string);
        // User denied account access...
        this.isMetamask = false
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      // Acccounts always exposed
      this.isMetamask = true
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      this.isMetamask = false
    }
    console.log('Get Web3!');
    this.setState({
      isLoading: false
    });
  };

  getPrice() {
    this.getGuildSwapContract.getPair(this.targetContractAddress).then((res: any) => {
      const amountArr = res.toString().split(',');
      this.setState({
        price: Number(new BigNumber(amountArr[0]).dividedBy(new BigNumber(amountArr[1])))
      });
    }).catch((err: any) => {
      console.log("getPair-------------err", err);
    });
  }

  async swap() {
    try {
      this.showLoading();
      if (!this.state.fromContractAmount || !this.state.toContractAmount) {
        alert("input must be not empty");
        return;
      }
      const amount = new BigNumber(this.state.fromContractAmount.toString()).multipliedBy(1000000000000000000).toNumber();
      const approveRes = await approve(this.state.fromContractAmount, this.exchangeContractAddress, this.state.address);
      this.hideLoading();
      if (!approveRes) {
        throw Error('approveError');
      }
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(abi as any, contractAddress);
      const res = await contract.methods.swap(this.exchangeContractAddress, this.targetContractAddress, amount.toString()).send({ from: this.state.address });
      console.log('---------', res);
    } catch (err) {
      console.log('----------swapErr', err);
    } finally {
      this.hideLoading();
      this.setState({
        fromContractAmount: 0.0,
        toContractAmount: 0.0
      });
    }
  }

  goBack = (from?: string) => {
    if (!!from) {
      this.getLiquidity();
    }
    this.setState({
      page: Pages.Liquidity
    });
  }

  getPage() {
    switch (this.state.page) {
      case Pages.Liquidity:
        return this.renderLiquidity();
      case Pages.AddLiquidity:
        return <AddLiquidityPage page={Pages.AddLiquidity} address={this.state.address} showLoading={this.showLoading} hideLoading={this.hideLoading} goback={this.goBack} />;
      case Pages.CreatePairs:
        return <AddLiquidityPage page={Pages.CreatePairs} address={this.state.address} showLoading={this.showLoading} hideLoading={this.hideLoading} goback={this.goBack} />;
    }
  }

  getLiquidity = async () => {
    try {
      this.setState({
        liquidityList: []
      });
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(abi as any, contractAddress);
      const res = await contract.methods.getOwnerPools(UNIContractAddress);
      console.log('---------', res);
    } catch (err: any) {
      message.info(err);
      console.log('getLiquidity--------err', err);
    }
  }

  renderLiquidity() {
    return (<React.Fragment>
      <span style={{ display: 'inline-block', fontWeight: 'bold', fontSize: "18px", marginBottom: '30px' }}>{"Your Liquidity"}</span>
      {this.state.liquidityList === null ? <div style={{ backgroundColor: 'whitesmoke', height: '100px', textAlign: 'center', paddingTop: '20px', margin: '0 -10px' }}>
        <span>No liquidity found</span>
      </div> :
        <div style={{ backgroundColor: "rgb(236, 245, 255)", padding: '20px' }}>
          <div style={{ display: 'flex' }}>
            <img width={20} height={20} src={IconUni} alt=""/>
            <img width={20} height={20} src={IconBsc} alt=""/>
            <span style={{ marginLeft: '10px' }}>UNI/</span>
            <span>BUSD</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <span>Your total pool tokens</span>
            <span>{Math.sqrt(10 * 2) }</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <span>Pooled UNI</span>
            <span>10</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <span>Pooled BUSD</span>
            <span>2</span>
          </div>
        </div>}
      <Button
        onClick={() => this.setState({
          page: Pages.AddLiquidity
        })}
        style={{ width: "100%", height: '40px', backgroundColor: '#1F2F56', marginTop: '20px', borderRadius: '20px', color: 'white', border: 'none' }}
      >{"Add Liquidity"}
      </Button>
      <Button
        onClick={() => this.setState({
          page: Pages.CreatePairs
        })}
        style={{ width: "100%", height: '40px', backgroundColor: 'rgb(236, 245, 255)', marginTop: '20px', borderRadius: '20px', border: '1px solid rgb(216, 234, 251)', color: '#1F2F56' }}
      >{"Create a pair"}
      </Button>

    </React.Fragment>);
  }

  componentDidMount() {
    this.getPrice();
    this.getWeb3();
  }

  render() {
    return (<div className={"container"}>
      <div className={"titleContainer"}>
        <span className={`title ${this.state.selectedItem === Items.Swap ? 'selected' : ''}`} onClick={() => this.setState({
          selectedItem: Items.Swap
        })}>{"Swap"}</span>
        <span className={`title ${this.state.selectedItem === Items.Pool ? 'selected' : ''}`}
          onClick={() => {
            this.setState({
              selectedItem: Items.Pool
            })
          }}
        >{"Liquidity"}</span>
      </div>
      {this.state.selectedItem === Items.Swap ? <div style={{ borderRadius: "10px", backgroundColor: 'white', padding: '20px', width: "400px", marginTop: "20px" }}>
        <div style={{ paddingBottom: "20px", borderBottom: "1px solid #f1f1f1", display: 'flex', flexDirection: 'column' }}>
          <span style={{ display: 'inline-block', fontWeight: 'bold', fontSize: "18px" }}>{"Exchange"}</span>
          <span style={{ display: 'inline-block' }}>{"Trade tokens in an instant"}</span>
        </div>
        <div style={{ padding: '10px', backgroundColor: 'rgb(236 245 255)', borderRadius: "10px", marginTop: "30px" }}>
          <span>{"From"}</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
            <Input
              className={'inputStyle'}
              placeholder={'0.0'}
              style={{ backgroundColor: 'rgb(236 245 255)', border: 'none' }}
              bordered={false}
              type={'number'}
              min={0}
              value={this.state.fromContractAmount.toString()}
              onChange={(event) => {
                const toContractAmount = Number(new BigNumber(event.target.value).dividedBy(new BigNumber(this.state.price)));
                this.setState({
                  fromContractAmount: Number(event.target.value),
                  toContractAmount
                })
              }} />
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img width={15} height={15} style={{ marginRight: '5px' }} src={IconBsc} alt="" />
              <span>BUSD</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <img width={10} height={15} src={IconArrow} alt="" />
        </div>
        <div style={{ padding: '10px', backgroundColor: 'rgb(236 245 255)', borderRadius: "10px", marginTop: "10px" }}>
          <span>{"To"}</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
            <Input
              className={'inputStyle'}
              placeholder={'0.0'}
              style={{ backgroundColor: 'rgb(236 245 255)', border: 'none' }}
              bordered={false}
              type={'number'}
              min={0}
              value={this.state.toContractAmount.toString()}
              onChange={(event) => {
                const fromContractAmount = Number(event.target.value) * this.state.price;
                this.setState({
                  toContractAmount: Number(event.target.value),
                  fromContractAmount
                })
              }} />
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img width={15} height={15} style={{ marginRight: '5px' }} src={IconPlat} alt="" />
              <span>PLANT</span>
            </div>
          </div>
        </div>
        {!!(this.state.fromContractAmount && this.state.toContractAmount) && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '10px' }}>
          <span>Price</span>
          <span>{this.state.price + "  BUSD per PLANT"}</span>
        </div>}
        <Button
          onClick={this.state.address ? () => this.swap() : this.getWeb3}
          style={{ width: "100%", height: '40px', backgroundColor: '#1F2F56', marginTop: '20px', borderRadius: '20px', color: 'white', border: 'none' }}
        >
          {this.state.address ? "Swap" : "Connect Wallet"}
        </Button>
      </div> : <div style={{ borderRadius: "10px", backgroundColor: 'white', padding: '20px', width: "400px", marginTop: "20px" }}>
          {this.getPage()}
        </div>}
      <img style={{ position: 'absolute', top: '10px', left: '10px' }} src={Icon} alt="" />
      <Button
        type="primary"
        className={'connectBtn'}
        onClick={this.state.address ? undefined : () => this.getWeb3()}
      >
        <div style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'black' }}>
          {this.state.address === '' ? 'Connect Wallet' : this.state.address}
        </div>
      </Button>
      {this.state.isLoading && <Spin style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999, position: 'absolute', backgroundColor: '#00000033' }} spinning={this.state.isLoading} />}
    </div>);
  }
}
