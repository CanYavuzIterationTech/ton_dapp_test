import "./App.css";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useMainContract } from "./hooks/useMainContract";
import { fromNano } from "ton-core";
import { useTonConnect } from "./hooks/useTonConnect";
function App() {
  const {
    contractVersion,
    counterValue,
    contractAddress,
    contractBalance,
    ownerAddress,
    recentSender,
    sendIncrement,
    sendDeposit,
    sendWithdrawal,
  } = useMainContract();

  const { connected } = useTonConnect();

  return (
    <div>
      <div>
        <TonConnectButton />
      </div>
      <div>
        <div className="Card">
          <b>Our contract Address</b>
          <div className="Hint">{contractAddress?.slice(0, 38) + "..."}</div>
          <b>Our contract Balance</b>
          <div className="Hint">
            {" "}
            {contractBalance ? fromNano(contractBalance) : "Loading..."}
          </div>
          <b>Our contract Version</b>
          <div className="Hint">
            {contractVersion ? contractVersion.toString() : "Loading..."}
          </div>
        </div>
        <div className="Card">
          <b>Counter value</b>
          <div>{counterValue ?? "Loading..."}</div>
          <b>Owner address</b>
          <div className="Hint">
            {ownerAddress
              ? ownerAddress.toString().slice(0, 38) + "..."
              : "Loading..."}
          </div>
          <b>Recent sender</b>
          <div className="Hint">
            {recentSender
              ? recentSender.toString().slice(0, 38) + "..."
              : "Loading..."}
          </div>
        </div>

        {connected && (
          <>
            <button onClick={sendIncrement}>Send Increment by 5</button>
            <button onClick={sendDeposit}>Send Deposit</button>
            <button onClick={sendWithdrawal}>Send Withdrawal</button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
