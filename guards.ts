const policy = {
  maxSlippage: 1,
  minOutput: 1000000,
  priceDeviationLimit: 2,
  liquidityDepthThreshold: 100000000,
};

export const checkGuard = (
  inputAmount: number,
  expectedOutput: number,
  currentPrice: number,
  avgPrice: number,
  liquidityDepth: number,
  slippage: number,
  addLog: (message: string) => void
): boolean => {
  const deviation = Math.abs((currentPrice - avgPrice) / avgPrice * 100) || 0;

  if (deviation > policy.priceDeviationLimit) {
    addLog(`Rejected: Deviation ${deviation.toFixed(2)}% > limit`);
    return false;
  }
  if (slippage > policy.maxSlippage) {
    addLog(`Rejected: Slippage ${slippage.toFixed(2)}% > limit`);
    return false;
  }
  if (expectedOutput * 1000000 < policy.minOutput) {
    addLog(`Rejected: Output low`);
    return false;
  }
  if (liquidityDepth < policy.liquidityDepthThreshold) {
    addLog(`Rejected: Liquidity low`);
    return false;
  }
  addLog('Passed. Proceeding.');
  return true;
};