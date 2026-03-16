import { useState } from 'react'
import { type Address, formatUnits, pad, parseUnits, stringToHex } from 'viem'
import {
  useAccount,
  useConnect,
  useConnectors,
  useDisconnect,
  useWatchBlockNumber,
} from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { alphaUsd } from './wagmi.config'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #1a1a24;
    --border: #2a2a3a;
    --accent: #00e5a0;
    --accent2: #7c5cfc;
    --accent3: #ff6b6b;
    --text: #f0f0f8;
    --muted: #6b6b8a;
    --success: #00e5a0;
    --error: #ff6b6b;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Mono', monospace;
    min-height: 100vh;
    background-image: 
      radial-gradient(ellipse at 20% 20%, rgba(124,92,252,0.08) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 80%, rgba(0,229,160,0.06) 0%, transparent 60%);
  }

  .app {
    max-width: 760px;
    margin: 0 auto;
    padding: 40px 24px 80px;
  }

  /* HEADER */
  .header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 48px;
    padding-bottom: 32px;
    border-bottom: 1px solid var(--border);
  }

  .logo {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--accent2), var(--accent));
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .header-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: var(--text);
  }

  .header-subtitle {
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .badge {
    margin-left: auto;
    background: rgba(0,229,160,0.1);
    border: 1px solid rgba(0,229,160,0.3);
    color: var(--accent);
    font-size: 10px;
    padding: 4px 10px;
    border-radius: 20px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  /* CARDS */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s;
  }

  .card:hover { border-color: #3a3a50; }

  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent2), transparent);
    opacity: 0.4;
  }

  .card-accent::before {
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    opacity: 0.6;
  }

  .section-label {
    font-size: 10px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .card-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .card-title .icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    background: var(--surface2);
  }

  /* CONNECT */
  .connect-wrapper {
    text-align: center;
    padding: 60px 24px;
  }

  .connect-hero {
    font-family: 'Syne', sans-serif;
    font-size: 42px;
    font-weight: 800;
    letter-spacing: -2px;
    line-height: 1.1;
    margin-bottom: 12px;
    background: linear-gradient(135deg, var(--text) 0%, var(--muted) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .connect-sub {
    color: var(--muted);
    font-size: 13px;
    margin-bottom: 40px;
    line-height: 1.6;
  }

  .connect-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* ACCOUNT BAR */
  .account-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .address-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 14px;
    flex: 1;
  }

  .address-dot {
    width: 8px;
    height: 8px;
    background: var(--accent);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--accent);
    flex-shrink: 0;
  }

  .address-text {
    font-size: 13px;
    color: var(--text);
    font-family: 'DM Mono', monospace;
  }

  /* BALANCE */
  .balance-display {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin: 8px 0;
  }

  .balance-amount {
    font-family: 'Syne', sans-serif;
    font-size: 32px;
    font-weight: 800;
    color: var(--accent);
    letter-spacing: -1px;
  }

  .balance-symbol {
    font-size: 14px;
    color: var(--muted);
    text-transform: uppercase;
  }

  /* INPUTS */
  .field {
    margin-bottom: 14px;
  }

  .field label {
    display: block;
    font-size: 10px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 6px;
  }

  .field input,
  .field select {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 11px 14px;
    color: var(--text);
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    appearance: none;
  }

  .field input:focus,
  .field select:focus {
    border-color: var(--accent2);
    box-shadow: 0 0 0 3px rgba(124,92,252,0.1);
  }

  .field input::placeholder { color: var(--muted); }

  .inline-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  /* BUTTONS */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 11px 20px;
    border-radius: 10px;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
    letter-spacing: 0.3px;
  }

  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none !important;
  }

  .btn:not(:disabled):hover { transform: translateY(-1px); }
  .btn:not(:disabled):active { transform: translateY(0); }

  .btn-primary {
    background: linear-gradient(135deg, var(--accent2), #9c7cff);
    color: white;
    box-shadow: 0 4px 14px rgba(124,92,252,0.3);
  }

  .btn-primary:not(:disabled):hover {
    box-shadow: 0 6px 20px rgba(124,92,252,0.4);
  }

  .btn-accent {
    background: linear-gradient(135deg, var(--accent), #00c988);
    color: #0a0a0f;
    font-weight: 600;
    box-shadow: 0 4px 14px rgba(0,229,160,0.25);
  }

  .btn-accent:not(:disabled):hover {
    box-shadow: 0 6px 20px rgba(0,229,160,0.35);
  }

  .btn-danger {
    background: rgba(255,107,107,0.15);
    border: 1px solid rgba(255,107,107,0.3);
    color: var(--error);
  }

  .btn-danger:not(:disabled):hover {
    background: rgba(255,107,107,0.25);
  }

  .btn-ghost {
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--muted);
  }

  .btn-ghost:not(:disabled):hover {
    border-color: var(--accent2);
    color: var(--text);
  }

  .btn-sm { padding: 7px 14px; font-size: 12px; }
  .btn-full { width: 100%; margin-top: 4px; }

  /* STATUS */
  .status-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-active { background: var(--success); box-shadow: 0 0 6px var(--success); }
  .status-paused { background: var(--error); }

  .receipt-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--accent2);
    text-decoration: none;
    font-size: 11px;
    margin-top: 12px;
    padding: 6px 12px;
    background: rgba(124,92,252,0.1);
    border-radius: 6px;
    border: 1px solid rgba(124,92,252,0.2);
    transition: all 0.15s;
  }

  .receipt-link:hover {
    background: rgba(124,92,252,0.2);
    color: #9c7cff;
  }

  .error-msg {
    margin-top: 12px;
    padding: 10px 14px;
    background: rgba(255,107,107,0.08);
    border: 1px solid rgba(255,107,107,0.2);
    border-radius: 8px;
    color: var(--error);
    font-size: 12px;
    line-height: 1.5;
  }

  .success-msg {
    margin-top: 12px;
    padding: 10px 14px;
    background: rgba(0,229,160,0.08);
    border: 1px solid rgba(0,229,160,0.2);
    border-radius: 8px;
    color: var(--accent);
    font-size: 12px;
  }

  /* POOL INFO */
  .pool-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 4px;
  }

  .pool-item {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px;
  }

  .pool-label {
    font-size: 10px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 6px;
  }

  .pool-value {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
  }

  /* DIVIDER */
  .section-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 28px 0 20px;
    font-size: 10px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .section-divider::before,
  .section-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .loading { animation: pulse 1.5s ease-in-out infinite; color: var(--muted); font-size: 13px; }
`

export function App() {
  const account = useAccount()

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="header">
          <div className="logo">⚡</div>
          <div>
          <div className="header-title">Tempo Forge</div>
          <div className="header-subtitle">Stablecoin Launchpad</div>
          </div>
          <span className="badge">Testnet</span>
        </div>

        {account.isConnected ? (
          <>
            <div className="section-label">Account</div>
            <div className="card card-accent">
              <Account />
            </div>

            <div className="section-label">Balance</div>
            <div className="card">
              <Balance />
            </div>

            <div className="section-label">Stablecoin</div>
            <CreateStablecoin />
          </>
        ) : (
          <Connect />
        )}
      </div>
    </>
  )
}

export function Connect() {
  const connect = useConnect()
  const connectors = useConnectors()
  const [showModal, setShowModal] = useState(false)

  const modalStyles = `
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    .modal {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 28px;
      width: 100%;
      max-width: 360px;
      position: relative;
    }
    .modal-title {
      font-family: 'Syne', sans-serif;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .modal-sub {
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 20px;
    }
    .modal-close {
      position: absolute;
      top: 16px; right: 16px;
      background: var(--surface2);
      border: 1px solid var(--border);
      color: var(--muted);
      width: 28px; height: 28px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .wallet-option {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 14px 16px;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 12px;
      color: var(--text);
      font-family: 'DM Mono', monospace;
      font-size: 13px;
      cursor: pointer;
      margin-bottom: 10px;
      transition: all 0.15s;
      text-align: left;
    }
    .wallet-option:hover {
      border-color: var(--accent2);
      background: rgba(124,92,252,0.08);
    }
    .wallet-option:last-child { margin-bottom: 0; }
    .wallet-icon {
      width: 36px; height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    .wallet-info { flex: 1; }
    .wallet-name { font-weight: 500; color: var(--text); }
    .wallet-desc { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .divider {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 14px 0;
      font-size: 10px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }
  `

  if (connect.isPending) return (
    <div className="connect-wrapper">
      <p className="loading">Connecting wallet...</p>
    </div>
  )

  // separate metamask from passkey
  const injectedConnectors = connectors.filter(c => c.type === 'injected')
  const passkeyConnector = connectors.find(c => c.type !== 'injected')

  return (
    <>
      <style>{modalStyles}</style>
      <div className="connect-wrapper">
        <div className="connect-hero">Launch your<br />stablecoin.</div>
        <p className="connect-sub">
          Deploy, mint, and manage TIP-20 tokens<br />on the Tempo testnet.
        </p>
        <div className="connect-buttons">
          <button
            className="btn btn-accent"
            onClick={() => setShowModal(true)}
            type="button"
          >
            Connect Wallet
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <div className="modal-title">Connect Wallet</div>
            <p className="modal-sub">Choose how you want to connect</p>

           {injectedConnectors.length > 0 && (
  <button
    className="wallet-option"
    onClick={() => { connect.connect({ connector: injectedConnectors[0] }); setShowModal(false) }}
  >
    <div className="wallet-icon" style={{ background: 'rgba(255,153,0,0.15)' }}>🦊</div>
    <div className="wallet-info">
      <div className="wallet-name">MetaMask</div>
      <div className="wallet-desc">Connect with your browser wallet</div>
    </div>
    <span style={{ color: 'var(--muted)', fontSize: 12 }}>→</span>
  </button>
)}

            {injectedConnectors.length === 0 && (
              <button
                className="wallet-option"
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
                disabled
              >
                <div className="wallet-icon" style={{ background: 'rgba(255,153,0,0.15)' }}>🦊</div>
                <div className="wallet-info">
                  <div className="wallet-name">MetaMask</div>
                  <div className="wallet-desc">Not detected — install MetaMask first</div>
                </div>
              </button>
            )}

            <div className="divider">or</div>

            {passkeyConnector && (
              <>
                <button
                  className="wallet-option"
                  onClick={() => { connect.connect({ connector: passkeyConnector, capabilities: { type: 'sign-up' } }); setShowModal(false) }}
                >
                  <div className="wallet-icon" style={{ background: 'rgba(0,229,160,0.15)' }}>🔑</div>
                  <div className="wallet-info">
                    <div className="wallet-name">Create Passkey Account</div>
                    <div className="wallet-desc">New to Tempo? Start here</div>
                  </div>
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>→</span>
                </button>

                <button
                  className="wallet-option"
                  onClick={() => { connect.connect({ connector: passkeyConnector }); setShowModal(false) }}
                >
                  <div className="wallet-icon" style={{ background: 'rgba(124,92,252,0.15)' }}>✦</div>
                  <div className="wallet-info">
                    <div className="wallet-name">Sign In with Passkey</div>
                    <div className="wallet-desc">Already have an account</div>
                  </div>
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>→</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export function Account() {
  const account = useAccount()
  const disconnect = useDisconnect()

  return (
    <div className="account-bar">
      <div className="address-chip">
        <div className="address-dot" />
        <span className="address-text">
          {account.address?.slice(0, 8)}...{account.address?.slice(-6)}
        </span>
      </div>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => disconnect.disconnect()}
        type="button"
      >
        Sign out
      </button>
    </div>
  )
}

export function Balance() {
  const account = useAccount()

  const balance = Hooks.token.useGetBalance({
    account: account.address,
    token: account.chain?.feeToken,
  })
  const metadata = Hooks.token.useGetMetadata({ token: account.chain?.feeToken })
  const addFunds = Hooks.faucet.useFund({
    mutation: { onSuccess() { balance.refetch() } },
  })

  useWatchBlockNumber({ onBlockNumber() { balance.refetch() } })

  if (balance.isLoading || metadata.isLoading)
    return <p className="loading">Loading balance...</p>

  if (!balance.data && !addFunds.isSuccess)
    return (
      <div>
        <div className="card-title">
          <span className="icon">💳</span> Fee Token Balance
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
          Fund your account to pay for transactions.
        </p>
        <button
          className="btn btn-accent"
          disabled={addFunds.isPending}
          onClick={() => addFunds.mutate({ account: account.address! })}
          type="button"
        >
          {addFunds.isPending ? 'Funding...' : '+ Add Funds'}
        </button>
      </div>
    )

  return (
    <div>
      <div className="card-title">
        <span className="icon">💳</span> Fee Token Balance
      </div>
      <div className="balance-display">
        <span className="balance-amount">
          {formatUnits(balance.data ?? 0n, metadata.data?.decimals ?? 6)}
        </span>
        <span className="balance-symbol">{metadata.data?.name}</span>
      </div>
    </div>
  )
}

export function CreateStablecoin() {
  const create = Hooks.token.useCreateSync()

  return (
    <div>
      <div className="card">
        <div className="card-title">
          <span className="icon">🪙</span> Create Stablecoin
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const formData = new FormData(event.target as HTMLFormElement)
            create.mutate({
              name: formData.get('name') as string,
              symbol: formData.get('symbol') as string,
              currency: 'USD',
            })
          }}
        >
          <div className="inline-fields">
            <div className="field">
              <label>Token Name</label>
              <input type="text" name="name" placeholder="NehemiahUSD" required />
            </div>
            <div className="field">
              <label>Symbol</label>
              <input type="text" name="symbol" placeholder="NHUSD" required />
            </div>
          </div>
          <button
            className="btn btn-accent btn-full"
            disabled={create.isPending}
            type="submit"
          >
            {create.isPending ? 'Deploying...' : '⚡ Deploy Token'}
          </button>
        </form>

        {create.isError && (
          <div className="error-msg">⚠ {create.error?.message}</div>
        )}
        {create.data && (
          <div className="success-msg">
            ✓ {create.data.name} deployed successfully!{' '}
            <a
              className="receipt-link"
              href={`https://explore.tempo.xyz/tx/${create.data.receipt.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View receipt ↗
            </a>
          </div>
        )}
      </div>

      {create.data?.token && (
        <GrantTokenRoles
          token={create.data.token}
          roles={['issuer', 'pause', 'unpause', 'burnBlocked']}
        />
      )}
    </div>
  )
}

export function GrantTokenRoles(props: {
  token: Address
  roles: Array<'issuer' | 'pause' | 'unpause' | 'burnBlocked'>
}) {
  const { token, roles } = props
  const { address } = useAccount()
  const grant = Hooks.token.useGrantRolesSync()

  return (
    <div>
      <div className="card">
        <div className="card-title"><span className="icon">🔑</span> Grant Token Roles</div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const formData = new FormData(event.target as HTMLFormElement)
            const recipient = formData.get('recipient') as `0x${string}`
            if (!recipient) throw new Error('Recipient is required')
            grant.mutate({ token, roles, to: recipient, feeToken: alphaUsd })
          }}
        >
          <div className="field">
            <label>Grant roles to address</label>
            <input type="text" name="recipient" placeholder="0x..." defaultValue={address} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 14 }}>
            Roles: {roles.join(' · ')}
          </p>
          <button className="btn btn-primary btn-full" disabled={!address || grant.isPending} type="submit">
            {grant.isPending ? 'Granting...' : '🔑 Grant Roles'}
          </button>
          {grant.data && (
            <a className="receipt-link" href={`https://explore.tempo.xyz/tx/${grant.data.receipt.transactionHash}`} target="_blank" rel="noopener noreferrer">
              View receipt ↗
            </a>
          )}
        </form>
      </div>

      {(grant.isSuccess || grant.data) && (
        <>
          <div className="section-divider">Token Management</div>
          <SetSupplyCap token={token} />
          <MintToken token={token} />
          <BurnToken token={token} />
          <CreateTokenPolicy token={token} />
          <PauseUnpauseTransfers token={token} />
          <RevokeTokenRoles token={token} roles={roles} />
          <div className="section-divider">Fee AMM</div>
          <CheckFeeAmmPool token={token} />
          <MintFeeAmmLiquidity token={token} />
          <BurnFeeAmmLiquidity token={token} />
          <div className="section-divider">Rewards</div>
          <OptInToRewards token={token} />
          <StartReward token={token} />
          <ClaimReward token={token} />
        </>
      )}
    </div>
  )
}

export function MintToken(props: { token: Address }) {
  const { token } = props
  const { address } = useAccount()
  const metadata = Hooks.token.useGetMetadata({ token })
  const mint = Hooks.token.useMintSync()

  return (
    <div className="card">
      <div className="card-title"><span className="icon">✦</span> Mint Tokens</div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.target as HTMLFormElement)
          const recipient = formData.get('recipient') as `0x${string}`
          const memo = formData.get('memo') as string
          if (!recipient) throw new Error('Recipient is required')
          if (!metadata.data?.decimals) throw new Error('metadata.decimals not found')
          mint.mutate({
            amount: parseUnits('100', metadata.data.decimals),
            to: recipient,
            token,
            memo: memo ? pad(stringToHex(memo), { size: 32 }) : undefined,
            feeToken: alphaUsd,
          })
        }}
      >
        <div className="field">
          <label>Recipient Address</label>
          <input type="text" name="recipient" placeholder="0x..." />
        </div>
        <div className="field">
          <label>Memo (optional)</label>
          <input type="text" name="memo" placeholder="INV-12345" />
        </div>
        <button className="btn btn-accent btn-full" disabled={!address || mint.isPending} type="submit">
          {mint.isPending ? 'Minting...' : '✦ Mint 100 Tokens'}
        </button>
        {mint.data && (
          <a className="receipt-link" href={`https://explore.tempo.xyz/tx/${mint.data.receipt.transactionHash}`} target="_blank" rel="noopener noreferrer">
            View receipt ↗
          </a>
        )}
      </form>
    </div>
  )
}

export function BurnToken(props: { token: Address }) {
  const { token } = props
  const { address } = useAccount()
  const metadata = Hooks.token.useGetMetadata({ token })
  const burn = Hooks.token.useBurnSync()

  return (
    <div className="card">
      <div className="card-title"><span className="icon">🔥</span> Burn Tokens</div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.target as HTMLFormElement)
          const memo = formData.get('memo') as string
          if (!metadata.data?.decimals) throw new Error('metadata.decimals not found')
          burn.mutate({
            amount: parseUnits('100', metadata.data.decimals),
            token,
            memo: memo ? pad(stringToHex(memo), { size: 32 }) : undefined,
            feeToken: alphaUsd,
          })
        }}
      >
        <div className="field">
          <label>Memo (optional)</label>
          <input type="text" name="memo" placeholder="INV-12345" />
        </div>
        <button className="btn btn-danger btn-full" disabled={!address || burn.isPending} type="submit">
          {burn.isPending ? 'Burning...' : '🔥 Burn 100 Tokens'}
        </button>
        {burn.data && (
          <a className="receipt-link" href={`https://explore.tempo.xyz/tx/${burn.data.receipt.transactionHash}`} target="_blank" rel="noopener noreferrer">
            View receipt ↗
          </a>
        )}
      </form>
    </div>
  )
}

export function RevokeTokenRoles(props: {
  token: Address
  roles: Array<'issuer' | 'pause' | 'unpause' | 'burnBlocked'>
}) {
  const { token, roles } = props
  const { address } = useAccount()
  const revoke = Hooks.token.useRevokeRolesSync()

  return (
    <div className="card">
      <div className="card-title"><span className="icon">🚫</span> Revoke Token Roles</div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.target as HTMLFormElement)
          const from = formData.get('from') as `0x${string}`
          if (!from) throw new Error('Address is required')
          revoke.mutate({ token, roles, from, feeToken: alphaUsd })
        }}
      >
        <div className="field">
          <label>Revoke roles from address</label>
          <input type="text" name="from" placeholder="0x..." defaultValue={address} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 14 }}>Roles: {roles.join(' · ')}</p>
        <button className="btn btn-danger btn-full" disabled={!address || revoke.isPending} type="submit">
          {revoke.isPending ? 'Revoking...' : 'Revoke Roles'}
        </button>
        {revoke.data && (
          <a className="receipt-link" href={`https://explore.tempo.xyz/tx/${revoke.data.receipt.transactionHash}`} target="_blank" rel="noopener noreferrer">
            View receipt ↗
          </a>
        )}
      </form>
    </div>
  )
}

export function SetSupplyCap(props: { token: Address }) {
  const { token } = props
  const { address } = useAccount()
  const { data: metadata, refetch } = Hooks.token.useGetMetadata({ token })
  const setSupplyCap = Hooks.token.useSetSupplyCapSync({ mutation: { onSettled() { refetch() } } })

  return (
    <div className="card">
      <div className="card-title"><span className="icon">📊</span> Supply Cap</div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.target as HTMLFormElement)
          const cap = formData.get('cap') as string
          if (!cap) throw new Error('Supply cap is required')
          if (!metadata?.decimals) throw new Error('metadata.decimals not found')
          setSupplyCap.mutate({ token, supplyCap: parseUnits(cap, metadata.decimals), feeToken: alphaUsd })
        }}
      >
        <div className="field">
          <label>Supply cap amount</label>
          <input type="text" name="cap" placeholder="1000" defaultValue="1000" />
        </div>
        <button className="btn btn-primary btn-full" disabled={!address || setSupplyCap.isPending} type="submit">
          {setSupplyCap.isPending ? 'Setting...' : 'Set Supply Cap'}
        </button>
        {setSupplyCap.data && (
          <a className="receipt-link" href={`https://explore.tempo.xyz/tx/${setSupplyCap.data.receipt.transactionHash}`} target="_blank" rel="noopener noreferrer">
            View receipt ↗
          </a>
        )}
      </form>
    </div>
  )
}

export function CreateTokenPolicy(props: { token: Address }) {
  const { token } = props
  const { address } = useAccount()
  const createPolicy = Hooks.policy.useCreateSync()

  return (
    <div className="card">
      <div className="card-title"><span className="icon">🛡</span> Transfer Policy</div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.target as HTMLFormElement)
          const addresses = formData.get('addresses') as string
          const type = formData.get('type') as 'blacklist' | 'whitelist'
          if (!addresses) throw new Error('Addresses are required')
          const addressList = addresses.split(',').map(a => a.trim() as `0x${string}`)
          createPolicy.mutate({ addresses: addressList, type, feeToken: alphaUsd })
        }}
      >
        <div className="field">
          <label>Addresses (comma-separated)</label>
          <input type="text" name="addresses" placeholder="0x..., 0x..." />
        </div>
        <div className="field">
          <label>Policy type</label>
          <select name="type" defaultValue="blacklist">
            <option value="blacklist">Blacklist</option>
            <option value="whitelist">Whitelist</option>
          </select>
        </div>
        <button className="btn btn-primary btn-full" disabled={!address || createPolicy.isPending} type="submit">
          {createPolicy.isPending ? 'Creating...' : 'Create Policy'}
        </button>
        {createPolicy.data && (
          <>
            <div className="success-msg">Policy ID: {createPolicy.data.policyId.toString()}</div>
            <a className="receipt-link" href={`https://explore.tempo.xyz/tx/${createPolicy.data.receipt.transactionHash}`} target="_blank" rel="noopener noreferrer">
              View receipt ↗
            </a>
          </>
        )}
      </form>
      {createPolicy.isSuccess && createPolicy.data && (
        <LinkTokenPolicy token={token} policyId={createPolicy.data.policyId} />
      )}
    </div>
  )
}

export function LinkTokenPolicy(props: { token: Address; policyId: bigint }) {
  const { token, policyId } = props
  const { address } = useAccount()
  const { data: metadata, refetch } = Hooks.token.useGetMetadata({ token })
  const linkPolicy = Hooks.token.useChangeTransferPolicySync({ mutation: { onSuccess() { refetch() } } })

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
        Token: {metadata?.name || token} · Policy ID: {policyId.toString()}
      </p>
      <button
        className="btn btn-ghost btn-full"
        disabled={!address || linkPolicy.isPending}
        onClick={() => linkPolicy.mutate({ policyId, token, feeToken: alphaUsd })}
        type="button"
      >
        {linkPolicy.isPending ? 'Linking...' : 'Link Policy to Token'}
      </button>
      {linkPolicy.data && <BurnTokenBlocked token={token} />}
    </div>
  )
}

export function PauseUnpauseTransfers(props: { token: Address }) {
  const { token } = props
  const { address } = useAccount()
  const [hash, setHash] = useState('')
  const { data: metadata, refetch } = Hooks.token.useGetMetadata({ token })
  const pause = Hooks.token.usePauseSync({ mutation: { onSettled(data) { refetch(); setHash((data?.receipt?.transactionHash as string) || '') } } })
  const unpause = Hooks.token.useUnpauseSync({ mutation: { onSettled(data) { refetch(); setHash((data?.receipt?.transactionHash as string) || '') } } })
  const paused = metadata?.paused || false
  const isProcessing = pause.isPending || unpause.isPending

  return (
    <div className="card">
      <div className="card-title"><span className="icon">⏸</span> Pause Transfers</div>
      <div className="status-row" style={{ marginBottom: 16 }}>
        <div className={`status-dot ${paused ? 'status-paused' : 'status-active'}`} />
        <span style={{ fontSize: 13 }}>Status: {paused ? 'Paused' : 'Active'}</span>
      </div>
      <button
        className={`btn btn-full ${paused ? 'btn-accent' : 'btn-danger'}`}
        disabled={!address || isProcessing}
        onClick={() => paused ? unpause.mutate({ token, feeToken: alphaUsd }) : pause.mutate({ token, feeToken: alphaUsd })}
        type="button"
      >
        {isProcessing ? 'Processing...' : paused ? '▶ Unpause' : '⏸ Pause'}
      </button>
      {!!hash && (
        <a className="receipt-link" href={`https://explore.tempo.xyz/tx/${hash}`} target="_blank" rel="noopener noreferrer">
          View receipt ↗
        </a>
      )}
    </div>
  )
}

export function BurnTokenBlocked(props: { token: Address }) {
  const { token } = props
  const { address } = useAccount()
  const metadata = Hooks.token.useGetMetadata({ token })
  const burnBlocked = Hooks.token.useBurnBlockedSync()

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
      <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>Burn Blocked Tokens</p>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.target as HTMLFormElement)
          const from = formData.get('from') as `0x${string}`
          if (!from) throw new Error('Blocked address is required')
          if (!metadata.data?.decimals) throw new Error('metadata.decimals not found')
          burnBlocked.mutate({ amount: parseUnits('100', metadata.data.decimals), from, token, feeToken: alphaUsd })
        }}
      >
        <div className="field">
          <label>Blocked address</label>
          <input type="text" name="from" placeholder="0x..." />
        </div>
        <button className="btn btn-danger btn-full" disabled={!address || burnBlocked.isPending} type="submit">
          {burnBlocked.isPending ? 'Burning...' : 'Burn Blocked Tokens'}
        </button>
      </form>
    </div>
  )
}

export function CheckFeeAmmPool(props: { token: Address }) {
  const { token } = props
  const { address } = useAccount()
  const { data: pool } = Hooks.amm.usePool({ userToken: token, validatorToken: alphaUsd })
  const { data: lpBalance } = Hooks.amm.useLiquidityBalance({ address, userToken: token, validatorToken: alphaUsd })
  const { data: metadata } = Hooks.token.useGetMetadata({ token })
  const { data: validatorMetadata } = Hooks.token.useGetMetadata({ token: alphaUsd })

  return (
    <div className="card">
      <div className="card-title"><span className="icon">🌊</span> Fee AMM Pool</div>
      {address && pool && lpBalance !== undefined ? (
        <div className="pool-grid">
          <div className="pool-item">
            <div className="pool-label">Your LP</div>
            <div className="pool-value">{formatUnits(lpBalance, validatorMetadata?.decimals || 6)}</div>
          </div>
          <div className="pool-item">
            <div className="pool-label">AlphaUSD</div>
            <div className="pool-value">{formatUnits(pool.reserveValidatorToken, validatorMetadata?.decimals || 6)}</div>
          </div>
          <div className="pool-item">
            <div className="pool-label">{metadata?.symbol || 'Token'}</div>
            <div className="pool-value">{formatUnits(pool.reserveUserToken, metadata?.decimals || 6)}</div>
          </div>
        </div>
      ) : (
        <p className="loading">Loading pool info...</p>
      )}
    </div>
  )
}

export function MintFeeAmmLiquidity(props: { token: Address }) {
  const { token } = props
  const { address } = useAccount()
  const mintFeeLiquidity = Hooks.amm.useMintSync()

  return (
    <div className="card">
      <div className="card-title"><span className="icon">💧</span> Add Liquidity</div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.target as HTMLFormElement)
          const amount = formData.get('amount') as string
          if (!amount) throw new Error('Amount is required')
          mintFeeLiquidity.mutate({ userTokenAddress: token, validatorTokenAddress: alphaUsd, validatorTokenAmount: parseUnits(amount, 6), to: address!, feeToken: alphaUsd })
        }}
      >
        <div className="field">
          <label>AlphaUSD amount</label>
          <input type="text" name="amount" placeholder="100" defaultValue="100" />
        </div>
        <button className="btn btn-accent btn-full" disabled={!address || mintFeeLiquidity.isPending} type="submit">
          {mintFeeLiquidity.isPending ? 'Adding...' : '+ Add Liquidity'}
        </button>
        {mintFeeLiquidity.data && (
          <a className="receipt-link" href={`https://explore.tempo.xyz/tx/${mintFeeLiquidity.data.receipt.transactionHash}`} target="_blank" rel="noopener noreferrer">
            View receipt ↗
          </a>
        )}
      </form>
    </div>
  )
}

export function BurnFeeAmmLiquidity(props: { token: Address }) {
  const { token } = props
  const { address } = useAccount()
  const { data: lpBalance } = Hooks.amm.useLiquidityBalance({ address, userToken: token, validatorToken: alphaUsd })
  const { data: validatorMetadata } = Hooks.token.useGetMetadata({ token: alphaUsd })
  const burnLiquidity = Hooks.amm.useBurnSync()

  return (
    <div className="card">
      <div className="card-title"><span className="icon">🔥</span> Remove Liquidity</div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.target as HTMLFormElement)
          const amount = formData.get('amount') as string
          if (!amount) throw new Error('Amount is required')
          burnLiquidity.mutate({ userToken: token, validatorToken: alphaUsd, liquidity: parseUnits(amount, validatorMetadata?.decimals || 6), to: address!, feeToken: alphaUsd })
        }}
      >
        <div className="field">
          <label>LP tokens to burn</label>
          <input type="text" name="amount" placeholder="10" defaultValue="10" />
        </div>
        {lpBalance !== undefined && (
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 14 }}>
            Available: {formatUnits(lpBalance, validatorMetadata?.decimals || 6)} LP
          </p>
        )}
        <button className="btn btn-danger btn-full" disabled={!address || burnLiquidity.isPending} type="submit">
          {burnLiquidity.isPending ? 'Removing...' : 'Remove Liquidity'}
        </button>
        {burnLiquidity.data && (
          <a className="receipt-link" href={`https://explore.tempo.xyz/tx/${burnLiquidity.data.receipt.transactionHash}`} target="_blank" rel="noopener noreferrer">
            View receipt ↗
          </a>
        )}
      </form>
    </div>
  )
}

export function OptInToRewards(props: { token: Address }) {
  const { token } = props
  const { address } = useAccount()
  const setRecipient = Hooks.reward.useSetRecipientSync()

  return (
    <div className="card">
      <div className="card-title"><span className="icon">🎁</span> Opt In to Rewards</div>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
        Register your address to receive token rewards.
      </p>
      <button
        className="btn btn-primary btn-full"
        type="button"
        disabled={!address || setRecipient.isPending}
        onClick={() => {
          if (!address) throw new Error('Address is required')
          setRecipient.mutate({ recipient: address, token, feeToken: alphaUsd })
        }}
      >
        {setRecipient.isPending ? 'Opting in...' : '🎁 Opt In'}
      </button>
      {setRecipient.data && (
        <a className="receipt-link" href={`https://explore.tempo.xyz/tx/${setRecipient.data.receipt.transactionHash}`} target="_blank" rel="noopener noreferrer">
          View receipt ↗
        </a>
      )}
    </div>
  )
}

export function StartReward(props: { token: Address }) {
  const { token } = props
  const { address } = useAccount()
  const metadata = Hooks.token.useGetMetadata({ token })
  const start = Hooks.reward.useDistributeSync()

  return (
    <div className="card">
      <div className="card-title"><span className="icon">🚀</span> Distribute Rewards</div>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
        Distribute 50 {metadata.data?.name} to all opted-in holders.
      </p>
      <button
        className="btn btn-accent btn-full"
        type="button"
        disabled={!address || start.isPending || !metadata.data?.decimals}
        onClick={() => {
          if (!metadata?.data?.decimals) throw new Error('metadata.decimals not found')
          start.mutate({ amount: parseUnits('50', metadata.data.decimals), token, feeToken: alphaUsd })
        }}
      >
        {start.isPending ? 'Distributing...' : '🚀 Start Reward'}
      </button>
      {start.data && (
        <a className="receipt-link" href={`https://explore.tempo.xyz/tx/${start.data.receipt.transactionHash}`} target="_blank" rel="noopener noreferrer">
          View receipt ↗
        </a>
      )}
    </div>
  )
}

export function ClaimReward(props: { token: Address }) {
  const { token } = props
  const { address } = useAccount()
  const claim = Hooks.reward.useClaimSync()

  return (
    <div className="card">
      <div className="card-title"><span className="icon">💰</span> Claim Reward</div>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
        Claim your pending token rewards.
      </p>
      <button
        className="btn btn-accent btn-full"
        type="button"
        disabled={!address || claim.isPending}
        onClick={() => claim.mutate({ token, feeToken: alphaUsd })}
      >
        {claim.isPending ? 'Claiming...' : '💰 Claim Rewards'}
      </button>
      {claim.data && (
        <a className="receipt-link" href={`https://explore.tempo.xyz/tx/${claim.data.receipt.transactionHash}`} target="_blank" rel="noopener noreferrer">
          View receipt ↗
        </a>
      )}
    </div>
  )
}