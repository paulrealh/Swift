import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUser(response.data.data.user);
    } catch (err) {
      setError('Failed to load user data');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Swift Investment</h1>
          <div className="user-info">
            <span>{user?.firstName} {user?.lastName}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        <nav className="sidebar">
          <ul>
            <li onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'active' : ''}>
              Overview
            </li>
            <li onClick={() => setActiveTab('deposit')} className={activeTab === 'deposit' ? 'active' : ''}>
              Deposit
            </li>
            <li onClick={() => setActiveTab('withdraw')} className={activeTab === 'withdraw' ? 'active' : ''}>
              Withdraw
            </li>
            <li onClick={() => setActiveTab('savings')} className={activeTab === 'savings' ? 'active' : ''}>
              Savings Plans
            </li>
            <li onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'active' : ''}>
              History
            </li>
          </ul>
        </nav>

        <main className="dashboard-content">
          {error && <div className="error-message">{error}</div>}

          {activeTab === 'overview' && (
            <div className="tab-content">
              <h2>Dashboard Overview</h2>
              <div className="balance-card">
                <h3>Wallet Balance</h3>
                <div className="balance-amount">${user?.walletBalance?.usdt || 0}</div>
                <p>USDT</p>
                <div className="kyc-status">
                  KYC Status: {user?.kycVerified ? '✓ Verified' : '✗ Pending'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deposit' && <DepositTab />}
          {activeTab === 'withdraw' && <WithdrawTab />}
          {activeTab === 'savings' && <SavingsTab />}
          {activeTab === 'history' && <HistoryTab />}
        </main>
      </div>
    </div>
  );
};

const DepositTab = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USDT');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/deposits/initiate`,
        { amount: parseFloat(amount), currency },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Deposit initiated successfully!');
      setAmount('');
    } catch (err) {
      setMessage(err.response?.data?.error?.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content">
      <h2>Deposit Funds</h2>
      {message && <div className="success-message">{message}</div>}
      <form onSubmit={handleDeposit}>
        <div className="form-group">
          <label>Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USDT">USDT</option>
            <option value="NGN">NGN</option>
          </select>
        </div>
        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            step="0.01"
            min="10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Deposit'}
        </button>
      </form>
    </div>
  );
};

const WithdrawTab = () => {
  const [amount, setAmount] = useState('');
  const [destinationType, setDestinationType] = useState('wallet');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/withdrawals/initiate`,
        {
          amount: parseFloat(amount),
          currency: 'USDT',
          destinationType,
          walletAddress: destinationType === 'wallet' ? walletAddress : undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Withdrawal request submitted!');
      setAmount('');
      setWalletAddress('');
    } catch (err) {
      setMessage(err.response?.data?.error?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content">
      <h2>Withdraw Funds</h2>
      {message && <div className="success-message">{message}</div>}
      <form onSubmit={handleWithdraw}>
        <div className="form-group">
          <label>Destination</label>
          <select value={destinationType} onChange={(e) => setDestinationType(e.target.value)}>
            <option value="wallet">Crypto Wallet</option>
            <option value="bank">Bank Account</option>
          </select>
        </div>
        {destinationType === 'wallet' && (
          <div className="form-group">
            <label>Wallet Address</label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter wallet address"
              required
            />
          </div>
        )}
        <div className="form-group">
          <label>Amount (USDT)</label>
          <input
            type="number"
            step="0.01"
            min="50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Withdraw'}
        </button>
      </form>
    </div>
  );
};

const SavingsTab = () => {
  const [planType, setPlanType] = useState('flexible');
  const [principal, setPrincipal] = useState('');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const savingPlans = [
    { type: 'flexible', name: 'Flexible Savings', bonus: '5%', duration: 'Anytime' },
    { type: 'fixed_30', name: '30-Day Fixed', bonus: '8%', duration: '30 days' },
    { type: 'fixed_60', name: '60-Day Fixed', bonus: '12%', duration: '60 days' },
    { type: 'fixed_90', name: '90-Day Fixed', bonus: '15%', duration: '90 days' }
  ];

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/savings/create-plan`,
        { planType, principal: parseFloat(principal) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Savings plan created successfully!');
      setPrincipal('');
      fetchMyPlans();
    } catch (err) {
      setMessage(err.response?.data?.error?.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/savings/my-plans`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlans(response.data.data.plans);
    } catch (err) {
      console.error('Failed to fetch plans');
    }
  };

  return (
    <div className="tab-content">
      <h2>Savings Plans</h2>
      {message && <div className="success-message">{message}</div>}

      <div className="plans-grid">
        {savingPlans.map((plan) => (
          <div key={plan.type} className="plan-card">
            <h3>{plan.name}</h3>
            <div className="plan-bonus">{plan.bonus}</div>
            <p>{plan.duration}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreatePlan} className="savings-form">
        <div className="form-group">
          <label>Plan Type</label>
          <select value={planType} onChange={(e) => setPlanType(e.target.value)}>
            {savingPlans.map((plan) => (
              <option key={plan.type} value={plan.type}>
                {plan.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Principal Amount</label>
          <input
            type="number"
            step="0.01"
            min="100"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="Enter amount"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Plan'}
        </button>
      </form>

      {plans.length > 0 && (
        <div className="my-plans">
          <h3>My Plans</h3>
          {plans.map((plan) => (
            <div key={plan._id} className="plan-item">
              <div>{plan.planType} - ${plan.principal}</div>
              <div className="plan-status">{plan.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HistoryTab = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/deposits/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransactions(response.data.data.deposits);
    } catch (err) {
      console.error('Failed to fetch transactions');
    }
  };

  return (
    <div className="tab-content">
      <h2>Transaction History</h2>
      <table className="history-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx._id}>
              <td>{tx.type}</td>
              <td>${tx.amount}</td>
              <td className={`status-${tx.status}`}>{tx.status}</td>
              <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;