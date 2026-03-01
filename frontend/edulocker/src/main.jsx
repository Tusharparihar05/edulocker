import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { getContract } from "./contract";

function Root() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");

  useEffect(() => {
    const loadBlockchain = async () => {
      if (!window.ethereum) {
        alert("Install MetaMask");
        return;
      }

      // connect wallet
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);

      // load contract
      const ctr = await getContract();
      setContract(ctr);
    };

    loadBlockchain();
  }, []);

  return <App contract={contract} account={account} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);