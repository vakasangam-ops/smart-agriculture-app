import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  PieChart,
  Calendar,
  X,
  CreditCard,
  Layers,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

export function FinancesView() {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [finances, setFinances] = useState([]);
  const [summary, setSummary] = useState({ total_expenses: 0, total_income: 0, net_profit: 0, category_breakdown: {} });
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Transaction Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [modalType, setModalType] = useState('EXPENSE'); // 'EXPENSE' | 'INCOME'
  const [txForm, setTxForm] = useState({
    farm_id: '',
    crop_id: '',
    type: 'EXPENSE',
    category: 'FERTILIZER',
    amount_inr: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [finRes, farmsRes] = await Promise.all([
        api.getFinances(),
        api.getFarms()
      ]);
      setFinances(finRes.records || []);
      setSummary(finRes.summary || { total_expenses: 0, total_income: 0, net_profit: 0, category_breakdown: {} });
      setFarms(farmsRes.farms || []);
      if (farmsRes.farms && farmsRes.farms.length > 0 && !txForm.farm_id) {
        setTxForm(prev => ({ ...prev, farm_id: farmsRes.farms[0].id }));
      }
    } catch (err) {
      console.error('Failed to load finances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenModal = (type) => {
    setModalType(type);
    setTxForm({
      farm_id: farms[0]?.id || '',
      crop_id: '',
      type,
      category: type === 'EXPENSE' ? 'FERTILIZER' : 'HARVESTING_SALES',
      amount_inr: '',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0]
    });
    setShowLogModal(true);
  };

  const handleSaveTx = async (e) => {
    e.preventDefault();
    if (!txForm.farm_id || !txForm.amount_inr) return;
    try {
      await api.logFinance({
        ...txForm,
        type: modalType,
        amount_inr: parseFloat(txForm.amount_inr)
      });
      setShowLogModal(false);
      loadData();
    } catch (err) {
      alert('Failed to log entry: ' + err.message);
    }
  };

  const handleDeleteTx = async (id) => {
    if (!window.confirm('Delete this ledger record?')) return;
    try {
      await api.deleteFinance(id);
      loadData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* View Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={24} style={{ color: 'var(--primary-600)' }} />
            {t('financesTitle')}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Real-world farm profit and loss calculation, input cost breakdown, and DBT subsidy accounting.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleOpenModal('EXPENSE')} className="btn btn-secondary">
            <ArrowDownLeft size={16} style={{ color: '#dc2626' }} />
            <span>{t('logExpense')}</span>
          </button>
          <button onClick={() => handleOpenModal('INCOME')} className="btn btn-primary">
            <ArrowUpRight size={16} />
            <span>{t('logIncome')}</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid-cols-3">
        {/* Total Expenses */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('totalSpent')}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowDownLeft size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626' }}>
            ₹{summary.total_expenses?.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Seeds, Fertilizers, Labor, Machinery
          </div>
        </div>

        {/* Total Income */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('totalEarned')}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-700)' }}>
            ₹{summary.total_income?.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Mandi Sales & DBT Subsidies
          </div>
        </div>

        {/* Net Profit / Loss */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('netProfitLoss')}</span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: summary.net_profit >= 0 ? '#ecfdf5' : '#fffbeb',
              color: summary.net_profit >= 0 ? '#059669' : '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {summary.net_profit >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: summary.net_profit >= 0 ? '#059669' : '#d97706'
          }}>
            {summary.net_profit >= 0 ? '+' : ''}₹{summary.net_profit?.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {summary.net_profit >= 0 ? 'Profitable Standing Harvest' : 'Pre-harvest Input Phase'}
          </div>
        </div>
      </div>

      {/* Expenses Breakdown Pills */}
      {summary.category_breakdown && Object.keys(summary.category_breakdown).length > 0 && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PieChart size={16} />
            Input Cost Breakdown by Operation
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {Object.entries(summary.category_breakdown).map(([cat, amt]) => {
              const pct = summary.total_expenses > 0 ? Math.round((amt / summary.total_expenses) * 100) : 0;
              return (
                <div
                  key={cat}
                  style={{
                    background: 'var(--bg-card-subtle)',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{cat.replace(/_/g, ' ')}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    ₹{amt.toLocaleString()}
                  </span>
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Plot / Crop</th>
              <th>Description</th>
              <th>Amount (₹)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {finances.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                  No financial transactions recorded yet. Click "Log Expense" or "Log Income" above.
                </td>
              </tr>
            ) : (
              finances.map(tx => (
                <tr key={tx.id}>
                  <td>
                    <div style={{ fontSize: '0.84rem' }}>{tx.transaction_date}</div>
                  </td>
                  <td>
                    <span className={`badge ${tx.type === 'INCOME' ? 'badge-success' : 'badge-danger'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.84rem' }}>{tx.category.replace(/_/g, ' ')}</strong>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.84rem' }}>{tx.farm_name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{tx.crop_name}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>{tx.description}</div>
                  </td>
                  <td>
                    <strong style={{
                      fontSize: '0.96rem',
                      color: tx.type === 'INCOME' ? 'var(--primary-700)' : '#dc2626'
                    }}>
                      {tx.type === 'INCOME' ? '+' : '-'}₹{tx.amount_inr?.toLocaleString()}
                    </strong>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteTx(tx.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                      title="Delete Entry"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Log Transaction Modal */}
      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={20} style={{ color: modalType === 'INCOME' ? 'var(--primary-600)' : '#dc2626' }} />
                {modalType === 'INCOME' ? t('logIncome') : t('logExpense')}
              </h3>
              <button className="btn-icon" onClick={() => setShowLogModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveTx}>
              <div className="form-group">
                <label className="form-label">Target Farm Plot *</label>
                <select
                  className="form-select"
                  value={txForm.farm_id}
                  onChange={e => setTxForm({ ...txForm, farm_id: e.target.value })}
                  required
                >
                  {farms.map(f => (
                    <option key={f.id} value={f.id}>{f.farm_name} ({f.area_acres} Acres)</option>
                  ))}
                </select>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">{t('category')} *</label>
                  {modalType === 'EXPENSE' ? (
                    <select
                      className="form-select"
                      value={txForm.category}
                      onChange={e => setTxForm({ ...txForm, category: e.target.value })}
                    >
                      <option value="SEEDS">{t('catSeeds')}</option>
                      <option value="FERTILIZER">{t('catFertilizer')}</option>
                      <option value="PESTICIDE">{t('catPesticide')}</option>
                      <option value="LABOR">{t('catLabor')}</option>
                      <option value="MACHINERY">{t('catMachinery')}</option>
                      <option value="IRRIGATION">{t('catIrrigation')}</option>
                      <option value="OTHER">Other Miscellaneous</option>
                    </select>
                  ) : (
                    <select
                      className="form-select"
                      value={txForm.category}
                      onChange={e => setTxForm({ ...txForm, category: e.target.value })}
                    >
                      <option value="HARVESTING_SALES">{t('catSales')}</option>
                      <option value="SUBSIDY_RECEIPT">{t('catSubsidy')}</option>
                      <option value="OTHER_INCOME">Other Agricultural Revenue</option>
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">{t('amount')} *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="e.g. 4500"
                    className="form-input"
                    value={txForm.amount_inr}
                    onChange={e => setTxForm({ ...txForm, amount_inr: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Transaction Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={txForm.transaction_date}
                  onChange={e => setTxForm({ ...txForm, transaction_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Bill Memo</label>
                <input
                  type="text"
                  placeholder="e.g. 4 bags DAP from Tenali RBK subsidized counter"
                  className="form-input"
                  value={txForm.description}
                  onChange={e => setTxForm({ ...txForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowLogModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save to Ledger</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
