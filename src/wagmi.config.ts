import { QueryClient } from '@tanstack/react-query'
import { tempoModerato } from 'viem/chains'
import { createConfig, injected, webSocket } from 'wagmi'
import { KeyManager, webAuthn } from 'wagmi/tempo'

export const pathUsd = '0x20c0000000000000000000000000000000000000'
export const alphaUsd = '0x20c0000000000000000000000000000000000001'

export const queryClient = new QueryClient()

export const config = createConfig({
  connectors: [
    injected(), // MetaMask + any browser wallet
    webAuthn({
      keyManager: KeyManager.localStorage(),
    }),
  ],
  chains: [tempoModerato.extend({ feeToken: alphaUsd })],
  multiInjectedProviderDiscovery: true,
  transports: {
    [tempoModerato.id]: webSocket(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}