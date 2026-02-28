import React, { useState } from 'react';
import { useWallet } from '@meshsdk/react';
import { BlockfrostProvider, MeshTxBuilder } from '@meshsdk/core';
import { checkGuard } from '../utils/guards';
import { fetchCurrentPrice, fetch24hAvg, fetchCurrentTvl } from '../utils/api';

const USDM_POLICY = 'c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d'; // USDM policy + asset

const SwapForm: React.FC = () => {
  const { wallet, connected, connect, name } = useWallet();
  const [inputAmount, setInputAmount] = useState<number>(2);
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>('');

  const tokenPair = 'Aggregate.USDM_ADA';
  const blockfrostProvider = new BlockfrostProvider(process.env.REACT_APP_BLOCKFROST_ID || '');

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  const handleSafeSwap = async () => {
    if (!connected) return addLog('Connect wallet first.');
    if (!recipientAddress) return addLog('Enter recipient address.');
    setLoading(true);
    setTxHash('');
    try {
      const currentPrice = await fetchCurrentPrice(USDM_POLICY);
      const avgPrice = await fetch24hAvg(tokenPair);
      const tvl = await fetchCurrentTvl(USDM_POLICY);
      const expectedOutput = inputAmount / currentPrice;
      const liquidityIn = tvl / 2; // Approx for ADA side
      const effectiveOutput = liquidityIn * inputAmount / (liquidityIn + inputAmount);
      const slippage = Math.abs((expectedOutput - effectiveOutput) / expectedOutput * 100);

      const isSafe = checkGuard(inputAmount, expectedOutput, currentPrice, avgPrice, tvl, slippage, addLog);
      if (!isSafe) return addLog('Swap rejected.');

      const changeAddress = await wallet.getChangeAddress();

      const tx = new MeshTxBuilder({ fetcher: blockfrostProvider, submitter: blockfrostProvider });
      tx.txOut(recipientAddress, [{ unit: 'lovelace', quantity: (inputAmount * 1000000).toString() }]);
      tx.changeAddress(changeAddress);
      const unsignedTx = await tx.complete();
      addLog('Tx built.');

      const signedTx = await wallet.signTx(unsignedTx, false);
      const hash = await wallet.submitTx(signedTx);
      setTxHash(hash);
      addLog(`Executed! Hash: ${hash}`);
    } catch (error) {
      addLog(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!connected ? (
        <button onClick={() => connect('eternl')}>Connect Eternl</button>
      ) : (
        <p>Connected: {name}</p>
      )}
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          ADA Input:
          <input type="number" value={inputAmount} onChange={(e) => setInputAmount(parseFloat(e.target.value))} min={0.1} />
        </label>
        <br />
        <label>
          Recipient:
          <input type="text" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} placeholder="addr_test1..." />
        </label>
        <br />
        <button onClick={handleSafeSwap} disabled={loading || !connected}>
          {loading ? 'Processing...' : 'Safe Swap'}
        </button>
      </form>
      <div>
        <h3>Logs:</h3>
        <ul>{logs.map((log, i) => <li key={i}>{log}</li>)}</ul>
        {txHash && <p>View: <a href={`https://preprod.cardanoscan.io/transaction/${txHash}`} target="_blank" rel="noopener noreferrer">Here</a></p>}
      </div>
    </div>
  );
};

export default SwapForm;