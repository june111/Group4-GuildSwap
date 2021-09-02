import { Button, Input, Select } from "antd";
import React from "react";
import IconAdd from '../images/icon_add.png';
import IconBsc from '../images/icon_bsc.png';
import IconPlat from '../images/icon_plat.png';
import IconUni from '../images/icon_uni.png';
import IconYgg from '../images/icon_ygg.png';
import IconAxs from '../images/icon_axs.png';
import IconGoBack from '../images/icon_goback.png';
import { Pages } from "../App";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import abi from '../guildSwap.json';
import { approve, AXSContractAddress, BUSDContractAddress, contractAddress, PLANTContractAddress, UNIContractAddress, YGGContractAddress } from "../address";
import { ethers } from "ethers";

interface State {
    initTokenAmount: number;
    targetTokenAmount: number;
    selectItem?: Item;
    price: number;
}

interface Props {
    goback: (from?: string) => void;
    page: Pages;
    showLoading: () => void;
    hideLoading: () => void;
    address: string;
}

enum Item {
    PLANT = "PLANT",
    YGG = "YGG",
    AXS = "AXS",
    UNI = "UNI",
}

export class AddLiquidityPage extends React.PureComponent<Props, State> {

    // private contractAddress = "0x1964fe51eeCdAA5858214f286d4154Cafa5c5F68";
    private provider = new ethers.providers.JsonRpcProvider(
        "https://data-seed-prebsc-2-s3.binance.org:8545/"
    );
    private getGuildSwapContract = new ethers.Contract(
        contractAddress,
        abi,
        this.provider
    );

    constructor(props: Props) {
        super(props);
        this.state = {
            initTokenAmount: 0.0,
            targetTokenAmount: 0.0,
            price: 0.0,
        };
    }

    onChange = (value: any) => {
        this.setState({
            selectItem: value
        }, () => {
            if (this.props.page === Pages.AddLiquidity) {
                this.getPrice();
            }
        });
    }

    getPrice() {
        let targetContractAddress = '';
        switch (this.state.selectItem) {
            case Item.AXS:
                targetContractAddress = AXSContractAddress;
                break;
            case Item.PLANT:
                targetContractAddress = PLANTContractAddress;
                break;
            case Item.UNI:
                targetContractAddress = UNIContractAddress;
                break;
            case Item.YGG:
                targetContractAddress = YGGContractAddress;
                break;
            default:
                return '';
        }
        this.getGuildSwapContract.getPair(targetContractAddress).then((res: any) => {
            const amountArr = res.toString().split(',');
            this.setState({
                price: Number(new BigNumber(amountArr[0]).dividedBy(new BigNumber(amountArr[1])))
            }, () => {
                if (!!this.state.initTokenAmount) {
                    const targetTokenAmount = Number(new BigNumber(this.state.initTokenAmount).dividedBy(new BigNumber(this.state.price)));
                    this.setState({
                        targetTokenAmount
                    });
                } else if (!!this.state.targetTokenAmount) {
                    const initTokenAmount = Number(this.state.targetTokenAmount) * this.state.price;
                    this.setState({
                        initTokenAmount
                    });
                }
            });
        }).catch((err: any) => {
            console.log("getPair-------------err", err);
        });
    }

    addLiguidity = async () => {
        this.props.showLoading();
        try {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(abi as any, contractAddress);
            let targetContractAddress = '';
            switch (this.state.selectItem) {
                case Item.AXS:
                    targetContractAddress = AXSContractAddress;
                    break;
                case Item.PLANT:
                    targetContractAddress = PLANTContractAddress;
                    break;
                case Item.UNI:
                    targetContractAddress = UNIContractAddress;
                    break;
                case Item.YGG:
                    targetContractAddress = YGGContractAddress;
                    break;
                default:
                    return '';
            }
            const targetTokenAmount = new BigNumber(this.state.targetTokenAmount.toString()).multipliedBy(1000000000000000000);
            const initTokenAmount = new BigNumber(this.state.initTokenAmount.toString()).multipliedBy(1000000000000000000);
            const approveRes = await approve(this.state.targetTokenAmount, targetContractAddress, this.props.address);
            this.props.hideLoading();
            const approveRes2 = await approve(this.state.initTokenAmount, BUSDContractAddress, this.props.address);

            if (!approveRes || !approveRes2) {
                throw Error('approve Error');
            }
            console.log(targetContractAddress, targetTokenAmount.toFixed(), BUSDContractAddress, initTokenAmount.toFixed());
            const res = await contract.methods.addLiq(targetContractAddress,
                BUSDContractAddress,
                targetTokenAmount.toFixed(),
                initTokenAmount.toFixed()).send({ from: this.props.address });
            console.log('---------', res);
        } catch (err: any) {
            console.log('---------createPairErr', err);
        } finally {
            this.props.hideLoading();
        }
    }

    createPair = async () => {
        this.props.showLoading();
        try {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(abi as any, contractAddress);
            let targetContractAddress = '';
            switch (this.state.selectItem) {
                case Item.AXS:
                    targetContractAddress = AXSContractAddress;
                    break;
                case Item.PLANT:
                    targetContractAddress = PLANTContractAddress;
                    break;
                case Item.UNI:
                    targetContractAddress = UNIContractAddress;
                    break;
                case Item.YGG:
                    targetContractAddress = YGGContractAddress;
                    break;
                default:
                    return '';
            }
            const targetTokenAmount = new BigNumber(this.state.targetTokenAmount.toString()).multipliedBy(1000000000000000000);
            const initTokenAmount = new BigNumber(this.state.initTokenAmount.toString()).multipliedBy(1000000000000000000);
            const approveRes = await approve(this.state.targetTokenAmount, targetContractAddress, this.props.address);
            this.props.hideLoading();
            const approveRes2 = await approve(this.state.initTokenAmount, BUSDContractAddress, this.props.address);

            if (!approveRes || !approveRes2) {
                throw Error('approve Error');
            }
            console.log(targetContractAddress, targetTokenAmount.toFixed(), BUSDContractAddress, initTokenAmount.toFixed());
            const res = await contract.methods.createPair(targetContractAddress,
                BUSDContractAddress,
                targetTokenAmount.toFixed(),
                initTokenAmount.toFixed()).send({ from: this.props.address });
            console.log('---------', res);
        } catch (err: any) {
            console.log('---------createPairErr', err);
        } finally {
            this.props.hideLoading();
        }
    }

    goBack = () => {
        const fromCreate = this.props.page === Pages.CreatePairs ? 'fromCreate' : undefined;
        this.props.goback(fromCreate);
    }

    render() {
        return (<React.Fragment>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img width={20} height={20} style={{ marginRight: '10px' }} onClick={this.goBack} src={IconGoBack} alt="" />
                    <span style={{ display: 'inline-block', fontWeight: 'bold', fontSize: "18px" }}>{this.props.page === Pages.AddLiquidity ? "Add Liquidity" : "Create Pair"}</span>
                </div>
                <span style={{ display: 'inline-block', backgroundColor: 'rgb(236, 245, 255)', borderRadius: '4px', padding: '10px', marginTop: '10px' }}>
                    {"Tip: When you add liquidity, you will receive pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time."}</span>
            </div>
            <div style={{ padding: '10px', backgroundColor: 'rgb(236 245 255)', borderRadius: "10px", marginTop: "20px" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                    <Input
                        className={'inputStyle'}
                        placeholder={'0.0'}
                        style={{ backgroundColor: 'rgb(236 245 255)', border: 'none' }}
                        type={'number'}
                        min={0}
                        value={this.state.initTokenAmount.toString()}
                        onChange={(event) => {
                            const targetTokenAmount = Number(new BigNumber(event.target.value).dividedBy(new BigNumber(this.state.price)));
                            this.setState({
                                initTokenAmount: Number(event.target.value),
                                targetTokenAmount: this.props.page === Pages.CreatePairs ? this.state.targetTokenAmount : targetTokenAmount
                            })
                        }} />
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img width={15} height={15} style={{ marginRight: '5px' }} src={IconBsc} alt="" />
                        <span>BUSD</span>
                    </div>
                </div>
            </div>
            <div style={{ textAlign: 'center', margin: '10px 0' }}>
                <img width={15} height={15} src={IconAdd} alt="" />
            </div>
            <div style={{ padding: '10px', backgroundColor: 'rgb(236 245 255)', borderRadius: "10px", marginTop: "10px" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                    <Input
                        className={'inputStyle'}
                        placeholder={'0.0'}
                        style={{ backgroundColor: 'rgb(236 245 255)', border: 'none' }}
                        bordered={false}
                        type={'number'}
                        min={0}
                        value={this.state.targetTokenAmount.toString()}
                        onChange={(event) => {
                            const initTokenAmount = Number(event.target.value) * this.state.price;
                            this.setState({
                                targetTokenAmount: Number(event.target.value),
                                initTokenAmount: this.props.page === Pages.CreatePairs ? this.state.initTokenAmount : initTokenAmount,
                            })
                        }} />
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Select
                            placeholder={"Select a token"}
                            onChange={this.onChange}
                            value={this.state.selectItem}
                            bordered={false}
                            style={{ width: 150, backgroundColor: 'white' }}>
                            <Select.Option value={'UNI'}>
                                <div>
                                    <img width={15} height={15} style={{ marginRight: '5px' }} src={IconUni} alt="" />
                                    <span>UNI</span>
                                </div>
                            </Select.Option>
                            <Select.Option value={'YGG'}>
                                <div>
                                    <img width={15} height={15} style={{ marginRight: '5px' }} src={IconYgg} alt="" />
                                    <span>YGG</span>
                                </div>
                            </Select.Option>
                            <Select.Option value={'AXS'}>
                                <div>
                                    <img width={15} height={15} style={{ marginRight: '5px' }} src={IconAxs} alt="" />
                                    <span>AXS</span>
                                </div>
                            </Select.Option>
                            <Select.Option value={'PLANT'}>
                                <div>
                                    <img width={15} height={15} style={{ marginRight: '5px' }} src={IconPlat} alt="" />
                                    <span>PLANT</span>
                                </div>
                            </Select.Option>
                        </Select>
                    </div>
                </div>
            </div>
            {!!(this.state.initTokenAmount && this.state.targetTokenAmount && this.state.selectItem !== undefined) && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '10px' }}>
                <span>Price</span>
                <span>{(this.props.page === Pages.CreatePairs ? Number(new BigNumber(this.state.initTokenAmount).dividedBy(new BigNumber(this.state.targetTokenAmount))) : this.state.price) + "  BUSD per " + this.state.selectItem}</span>
                {/* <span>{Number(new BigNumber(this.state.initTokenAmount).dividedBy(new BigNumber(this.state.targetTokenAmount))) + "  BUSD per " + this.state.selectItem}</span> */}
            </div>}
            <Button
                disabled={!this.state.targetTokenAmount || this.state.selectItem === undefined}
                onClick={this.props.page === Pages.AddLiquidity ? this.addLiguidity : this.createPair}
                style={{ width: "100%", height: '40px', backgroundColor: '#1F2F56', marginTop: '20px', borderRadius: '20px', color: 'white', border: 'none' }}
            >
                {this.state.targetTokenAmount ? (this.props.page === Pages.AddLiquidity ? "Add Liquidity" : "Create a Pair") : "Invalid pair"}
            </Button>
        </React.Fragment>);
    }
}