import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode,
} from "ton-core";

export type MainContractConfig = {
  number: number;
  address: Address;
  ownerAddress: Address;
};

export function mainContractConfigToCell(config: MainContractConfig): Cell {
  return beginCell()
    .storeUint(config.number, 32)
    .storeAddress(config.address)
    .storeAddress(config.ownerAddress)
    .endCell();
}

export class MainContract implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}
  static createFromConfig(
    config: MainContractConfig,
    code: Cell,
    workchain = 0
  ) {
    const data = mainContractConfigToCell(config);
    const init = { code, data };

    const address = contractAddress(workchain, init);

    return new MainContract(address, init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
      .storeUint(2,32) // Debouncer OP code
      .endCell(),
    });
  }

  async sendIncrement(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    incrementBy: number
  ) {
    const msgBody = beginCell()
      .storeUint(1, 32) // OP code for the method
      .storeUint(incrementBy, 32)
      .endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msgBody,
    });
  }

  async getData(provider: ContractProvider) {
    const { stack } = await provider.get("get_contract_storage_data", []);

    const number = stack.readNumber();
    const recentSender = stack.readAddress();
    const ownerAddress = stack.readAddress();

    return {
      number,
      recentSender,
      ownerAddress,
    };
  }

  async getBalance(provider: ContractProvider) {
    const { stack } = await provider.get("balance", []);


    return {
      balance: stack.readBigNumber(),
    };
  }

  async getVersion(provider: ContractProvider) {
    const { stack } = await provider.get("contract_version", []);

    return {
      version: stack.readBigNumber(),
    };
  }



  async sendDeposit(provider: ContractProvider, sender: Sender, value: bigint) {
    const msgBody = beginCell()
      .storeUint(2, 32) // OP code for the method
      .endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msgBody,
    });
  }
  async sendNoCodeDeposit(
    provider: ContractProvider,
    sender: Sender,
    value: bigint
  ) {
    const msgBody = beginCell().endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msgBody,
    });
  }
  async sendWithdrawalRequest(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    amount: bigint
  ) {
    const msgBody = beginCell().storeUint(3, 32).storeCoins(amount).endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msgBody,
    });
  }


}
