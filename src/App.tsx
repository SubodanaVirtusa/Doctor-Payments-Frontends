import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

type PaymentRecord = {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientName: string;
  amount: number;
  paymentStatus: string;
  createdAtUtc: string;
};

const API_BASE =
  'https://microservice-doctor-payments-a4bkg5ghakeqf7d4.canadacentral-01.azurewebsites.net/api';

function App() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [detailId, setDetailId] = useState('');
  const [detailDoctorId, setDetailDoctorId] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detail, setDetail] = useState<PaymentRecord | null>(null);

  const totals = useMemo(() => {
    const totalAmount = payments.reduce((sum, item) => sum + item.amount, 0);
    return { count: payments.length, totalAmount };
  }, [payments]);

  const fetchPayments = async () => {
    setListLoading(true);
    setListError(null);
    try {
      const response = await fetch(`${API_BASE}/Payments`);
      if (!response.ok) {
        throw new Error(`Failed to load payments. Status ${response.status}.`);
      }
      const data = (await response.json()) as PaymentRecord[];
      setPayments(data);
    } catch (error) {
      setListError(error instanceof Error ? error.message : 'Unexpected error.');
    } finally {
      setListLoading(false);
    }
  };

  const fetchPaymentById = async () => {
    if (!detailId.trim() || !detailDoctorId.trim()) {
      setDetailError('Payment id and doctor id are required.');
      return;
    }
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);
    try {
      const encodedDoctorId = encodeURIComponent(detailDoctorId.trim());
      const response = await fetch(
        `${API_BASE}/Payments/${detailId.trim()}?doctorId=${encodedDoctorId}`
      );
      if (response.status === 404) {
        setDetailError('Payment not found.');
        return;
      }
      if (!response.ok) {
        throw new Error(`Failed to load payment. Status ${response.status}.`);
      }
      const data = (await response.json()) as PaymentRecord;
      setDetail(data);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : 'Unexpected error.');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">Doctor Payments</p>
          <h1>Payment control center</h1>
          <p className="hero-subtitle">
            Review every transaction, validate amounts, and look up payment records
            by doctor in seconds.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={fetchPayments}>
              {listLoading ? 'Refreshing...' : 'Refresh payments'}
            </button>
            <div className="hero-meta">
              <span>Total records: {totals.count}</span>
              <span>Total amount: ${totals.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="hero-panel">
          <div className="panel-card">
            <p className="panel-title">Lookup payment</p>
            <label>
              Payment id
              <input
                value={detailId}
                onChange={(event) => setDetailId(event.target.value)}
                placeholder="e.g. 5fa12a9b..."
              />
            </label>
            <label>
              Doctor id
              <input
                value={detailDoctorId}
                onChange={(event) => setDetailDoctorId(event.target.value)}
                placeholder="e.g. DR-102"
              />
            </label>
            <button className="secondary" onClick={fetchPaymentById}>
              {detailLoading ? 'Loading...' : 'Get payment'}
            </button>
            {detailError && <p className="error">{detailError}</p>}
            {detail && (
              <div className="detail-card">
                <div>
                  <span>Patient</span>
                  <strong>{detail.patientName}</strong>
                </div>
                <div>
                  <span>Amount</span>
                  <strong>${detail.amount.toFixed(2)}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{detail.paymentStatus}</strong>
                </div>
                <div>
                  <span>Created</span>
                  <strong>{new Date(detail.createdAtUtc).toLocaleString()}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="content">
        <section className="list-section">
          <div className="section-header">
            <h2>Payments ledger</h2>
            {listError && <span className="error">{listError}</span>}
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Payment id</th>
                  <th>Doctor id</th>
                  <th>Appointment</th>
                  <th>Patient</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created (UTC)</th>
                </tr>
              </thead>
              <tbody>
                {listLoading && (
                  <tr>
                    <td colSpan={7} className="empty">
                      Loading payments...
                    </td>
                  </tr>
                )}
                {!listLoading && payments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty">
                      No payments found yet.
                    </td>
                  </tr>
                )}
                {!listLoading &&
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="mono">{payment.id}</td>
                      <td>{payment.doctorId}</td>
                      <td>{payment.appointmentId}</td>
                      <td>{payment.patientName}</td>
                      <td>${payment.amount.toFixed(2)}</td>
                      <td>
                        <span className={`status ${payment.paymentStatus.toLowerCase()}`}>
                          {payment.paymentStatus}
                        </span>
                      </td>
                      <td>{new Date(payment.createdAtUtc).toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
