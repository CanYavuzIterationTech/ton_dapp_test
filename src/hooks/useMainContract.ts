import { useEffect, useState } from "react";
import { MainContract } from "../contracts/MainContract";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract } from "ton-core";
import { toNano } from "ton-core";
import { useTonConnect } from "./useTonConnect";

export function useMainContract() {
  const client = useTonClient();
  const { sender } = useTonConnect();

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const [contractData, setContractData] = useState<null | {
    counterValue: number;
    recentSender: Address;
    ownerAddress: Address;
  }>();

  const [balance, setBalance] = useState<null | bigint>(null);
  const [version, setVersion] = useState<null | bigint>(null);

  const mainContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = new MainContract(
      Address.parse("EQD8Q0NE4gFvNtI4OE0gedYM9Lx0_2lOSVAbv6BIeyV90qpi")
    );
    return client.open(contract) as OpenedContract<MainContract>;
  }, [client]);

  useEffect(() => {
    async function getValue() {
      if (!mainContract) return;
      //setContractData(null);

      const val = await mainContract.getData();
      const bal = await mainContract.getBalance();
      const ver = await mainContract.getVersion();
      setVersion(ver.version);
      setBalance(bal.balance);
      setContractData({
        counterValue: val.number,
        recentSender: val.recentSender,
        ownerAddress: val.ownerAddress,
      });

      await sleep(5000); // Sleep 5s
      getValue();
    }
    getValue();
  }, [mainContract]);

  return {
    ...contractData,
    contractBalance: balance,
    contractAddress: mainContract?.address.toString(),
    contractVersion: version,
    sendIncrement: async () => {
      return mainContract?.sendIncrement(sender, toNano("0.01"), 5);
    },
    sendDeposit: async () => {
      return mainContract?.sendDeposit(sender, toNano("0.5"));
    },
    sendWithdrawal: async () => {
      return mainContract?.sendWithdrawalRequest(
        sender,
        toNano("0.01"),
        toNano("0.5")
      );
    },
  };
}
