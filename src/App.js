import { useState, useEffect } from 'react';
import './App.css';
import logo from './assets/WiSPR_logo_clean.png';
import { useFakeEnvData } from './useFakeEnvData';

/* ---------------- Icons ---------------- */
const AlertDot = () => (
  <svg className="icon-alert" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="10" fill="#D94545" />
    <rect x="9" y="4.5" width="2" height="8" rx="1" fill="white" />
    <rect x="9" y="14" width="2" height="2" rx="1" fill="white" />
  </svg>
);

const ReceiptIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    className="icon-receipt"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M6 2h12l2 2v16l-2-2-2 2-2-2-2 2-2-2-2 2-2-2V4l2-2z" />
    <path d="M8 7h8M8 11h8M8 15h5" />
  </svg>
);

const CheckIcon = () => (
  <span className="icon-check" aria-hidden="true">✓</span>
);

/* ------------- Env helpers (30°C / 70% thresholds) ------------- */
const toC = (f) => (f - 32) * (5 / 9);

// Returns 'emergency' | 'warning' | 'safe'
function computeEnvState(tempF, humPct) {
  const tempC = toC(tempF);

  // Emergency when ≥ 30°C or ≥ 70% RH
  if (tempC >= 30 || humPct >= 70) return 'emergency';

  // Warning when ≥ 27°C or ≥ 60% RH
  if (tempC >= 27 || humPct >= 60) return 'warning';

  return 'safe';
}

function stateSubtitle(state) {
  if (state === 'emergency') return 'Immediate Action Required';
  if (state === 'warning')   return 'Monitor Area';
  return 'Conditions Normal';
}

/* ---------------- Modal wrapper ---------------- */
function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer}
      </div>
    </div>
  );
}

/* ---------------- Modal contents ---------------- */
function SendAlertForm({ onSubmit, onCancel }) {
  const [zone, setZone] = useState('Zone A');
  const [type, setType] = useState('Overheating');
  const [severity, setSeverity] = useState('Emergency');
  const [msg, setMsg] = useState('');

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ zone, type, severity, msg });
      }}
    >
      <div className="row">
        <div>
          <div className="label-inline">Zone</div>
          <select className="select" value={zone} onChange={(e) => setZone(e.target.value)}>
            <option>Zone A</option>
            <option>Zone B</option>
            <option>Zone C</option>
          </select>
        </div>
        <div>
          <div className="label-inline">Type</div>
          <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
            <option>Overheating</option>
            <option>Humidity Spike</option>
            <option>Door Open</option>
            <option>Power Loss</option>
          </select>
        </div>
      </div>

      <div>
        <div className="label-inline">Severity</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className={`badge inline ${severity === 'Emergency' ? 'em' : ''}`} onClick={() => setSeverity('Emergency')}>Emergency</button>
          <button type="button" className={`badge inline ${severity === 'Warning' ? 'wa' : ''}`} onClick={() => setSeverity('Warning')}>Warning</button>
          <button type="button" className={`badge inline ${severity === 'Safe' ? 'ok' : ''}`} onClick={() => setSeverity('Safe')}>Safe</button>
        </div>
      </div>

      <div>
        <div className="label-inline">Message</div>
        <textarea className="textarea" placeholder="Optional note for the team…" value={msg} onChange={(e) => setMsg(e.target.value)} />
      </div>

      <div className="form-actions">
        <button type="button" className="btn white" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn green">Send Alert</button>
      </div>
    </form>
  );
}

function ViewTicketPane({ ticket }) {
  return (
    <div className="form" style={{ gap: 18 }}>
      <div className="ticket-grid">
        <div className="ticket-box">
          <div className="ticket-title">Ticket #{ticket.id}</div>
          <div className="ticket-muted">Opened: {ticket.time}</div>
          <div className="ticket-muted">Type: {ticket.type}</div>
        </div>
        <div className="ticket-box">
          <div className="ticket-title">Status</div>
          <div className="ticket-muted">Severity: {ticket.sev}</div>
          <div className="ticket-muted">Assignee: {ticket.assignee}</div>
        </div>
      </div>
      <div className="ticket-box">
        <div className="ticket-title">Details</div>
        <div style={{ color: 'var(--ink)' }}>{ticket.details}</div>
      </div>
    </div>
  );
}

function ResolvePane({ ticket, onConfirm, onCancel, initialNotes = '' }) {
  const [notes, setNotes] = useState(initialNotes);
  const [checked, setChecked] = useState(false);

  useEffect(() => { setNotes(initialNotes); }, [initialNotes]);

  return (
    <div className="form">
      <div className="ticket-box" style={{ marginBottom: 8 }}>
        <div className="ticket-title">Resolve Ticket #{ticket.id}</div>
        <div className="ticket-muted">Type: {ticket.type}</div>
        <div className="ticket-muted">Severity: {ticket.sev}</div>
      </div>

      <div>
        <div className="label-inline">Resolution Notes</div>
        <textarea
          className="textarea"
          placeholder="What did you do to resolve the issue?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        <span style={{ color: 'var(--ink)' }}>I confirm this issue is resolved.</span>
      </label>

      <div className="form-actions">
        <button className="btn white" type="button" onClick={onCancel}>Cancel</button>
        <button
          className="btn green"
          type="button"
          disabled={!checked}
          onClick={() => onConfirm({ ticketId: ticket.id, notes })}
        >
          Mark as Resolved
        </button>
      </div>
    </div>
  );
}

/* Ticket picker with optional notes for resolve flow */
function SelectTicketPane({
  tickets, selectedId, onSelect, onContinue, onCancel,
  actionLabel, includeNotes = false, notes, onNotesChange,
}) {
  return (
    <div className="form" style={{ gap: 12 }}>
      <div className="ticket-box">
        <div className="ticket-title">Choose a ticket</div>
        <div className="ticket-muted">Select which ticket you want to {actionLabel}.</div>
      </div>

      <div className="ticket-box" style={{ padding: 0 }}>
        <table className="table" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} onClick={() => onSelect(t.id)} style={{ cursor: 'pointer' }}>
                <td style={{ width: 32, paddingLeft: 16 }}>
                  <input
                    type="radio"
                    name="ticket"
                    checked={selectedId === t.id}
                    onChange={() => onSelect(t.id)}
                  />
                </td>
                <td>{`#${t.id}`}</td>
                <td>{t.type}</td>
                <td>
                  <span
                    className={
                      'chip ' +
                      (t.sev === 'Emergency' ? 'red' : t.sev === 'Warning' ? 'amber' : '')
                    }
                    style={t.sev === 'Resolved' ? { background: '#e5e7eb', color: '#111' } : {}}
                  >
                    {t.sev}
                  </span>
                </td>
                <td>{t.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {includeNotes && (
        <div>
          <div className="label-inline">Resolution Notes</div>
          <textarea
            className="textarea"
            placeholder="Brief note about what was done…"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </div>
      )}

      <div className="form-actions">
        <button className="btn white" type="button" onClick={onCancel}>Cancel</button>
        <button className="btn green" type="button" disabled={!selectedId} onClick={onContinue}>Continue</button>
      </div>
    </div>
  );
}

/* ---------------- Main App ---------------- */
export default function App() {
  /* Live fake env data */
  const { temp, hum } = useFakeEnvData(); // temp (°F), hum (%)

  /* Rolling history for sparkline */
  const [tempHist, setTempHist] = useState([]);
  useEffect(() => {
    setTempHist((h) => [...h, temp].slice(-30));
  }, [temp]);

  // spark bar heights (16..64px)
  const heights = (() => {
    if (tempHist.length === 0) return [];
    const min = Math.min(...tempHist);
    const max = Math.max(...tempHist);
    const toH = (v) => (max === min ? 24 : 16 + ((v - min) / (max - min)) * 48);
    return tempHist.map(toH);
  })();

  /* Env state + last updated */
  const envState = computeEnvState(temp, hum);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  useEffect(() => { setLastUpdated(new Date()); }, [temp, hum]);

  /* Tickets (mock) */
  const [tickets, setTickets] = useState([
    {
      id: '1032',
      type: 'High Temp',
      sev: 'Emergency',
      time: '9:41 AM',
      assignee: 'Alex',
      details:
        'Zone C temperature exceeded 95°F near condenser. Suggested actions: inspect fan, verify filter door, confirm airflow.',
    },
    {
      id: '1033',
      type: 'High Humidity',
      sev: 'Warning',
      time: '9:30 AM',
      assignee: 'Sam',
      details: 'Zone B humidity spike after filter maintenance. Monitor for 30 minutes.',
    },
  ]);

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const selectedTicket = selectedTicketId ? tickets.find((t) => t.id === selectedTicketId) : null;

  const [modal, setModal] = useState(null); // 'send' | 'ticket' | 'resolve' | 'pickTicketForTicket' | 'pickTicketForResolve'
  const [pickerTempId, setPickerTempId] = useState(null);
  const [pickerNotes, setPickerNotes] = useState('');
  const [resolveInitialNotes, setResolveInitialNotes] = useState('');
  const [toast, setToast] = useState(null);

  const open = (m) => setModal(m);
  const close = () => setModal(null);

  const handleSend = (payload) => {
    close();
    setToast(`Alert sent: ${payload.severity} in ${payload.zone} — ${payload.type}`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleResolve = ({ ticketId, notes }) => {
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, sev: 'Resolved' } : t)));
    close();
    setToast(`Ticket #${ticketId} marked resolved. ${notes ? 'Notes: ' + notes : ''}`);
    setTimeout(() => setToast(null), 3000);
  };

  const openViewTicket = () => {
    if (selectedTicket) open('ticket');
    else { setPickerTempId(null); open('pickTicketForTicket'); }
  };

  const openResolve = () => {
    if (selectedTicket) { setResolveInitialNotes(''); open('resolve'); }
    else {
      setPickerTempId(null);
      setPickerNotes('');
      open('pickTicketForResolve');
    }
  };

  const handleRowClick = (t) => {
    setSelectedTicketId(t.id);
    open('ticket');
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="brand">
          <img src={logo} alt="WiSPR logo" className="brand-mark" />
          <span className="brand-text">WiSPR</span>
        </div>
        <div className="header-right">
          <span className="tech">TECHNICIAN: ALEX</span>
          <span className="time">9:41 AM</span>
        </div>
      </header>

      {/* Main */}
      <main className="container">
        {/* Left */}
        <section className="left">
          {/* Environment */}
          <div className={`card env ${envState}`}>
            <h2 className="label">ENVIRONMENT</h2>

            {/* Dynamic badge */}
            <div
              className="badge safe"
              style={{
                background:
                  envState === 'emergency' ? 'var(--red)' :
                  envState === 'warning'   ? 'var(--amber)' : 'var(--green)'
              }}
              aria-label={`Environment status: ${envState}`}
            >
              <span className="dot" />
              {envState.toUpperCase()}
            </div>

            {/* Subtitle */}
            <div className="env-status-subtle">{stateSubtitle(envState)}</div>

            <div className="env-grid">
              <div>
                <div className="metric">
                  {temp.toFixed(1)}<span className="unit">°F</span>
                  <span className="unit" style={{ marginLeft: 8 }}>({toC(temp).toFixed(1)}°C)</span>
                </div>
                <div className="metric-label">Temperature</div>
              </div>
              <div>
                <div className="metric">
                  {hum.toFixed(1)}<span className="unit">%</span>
                </div>
                <div className="metric-label">Humidity</div>
              </div>
            </div>

            {/* Sparkline */}
            <div className="spark">
              {heights.length === 0
                ? Array.from({ length: 30 }).map((_, i) => <div key={i} className="bar" style={{ height: 24 }} />)
                : heights.map((h, i) => <div key={i} className="bar" style={{ height: h }} />)}
            </div>

            {/* Last updated */}
            <div className="env-updated">
              Last updated: {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>

          {/* Alerts */}
          <div className="card">
            <h2 className="label">ALERTS</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => handleRowClick(r)}
                      style={{ cursor: 'pointer' }}
                      title="Click to view ticket"
                    >
                      <td>{`#${r.id}`}</td>
                      <td>{r.type}</td>
                      <td>
                        <span
                          className={
                            'chip ' +
                            (r.sev === 'Emergency' ? 'red' : r.sev === 'Warning' ? 'amber' : '')
                          }
                          style={r.sev === 'Resolved' ? { background: '#e5e7eb', color: '#111' } : {}}
                        >
                          {r.sev}
                        </span>
                      </td>
                      <td>{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Right */}
        <aside className="right">
          <div className="card">
            <h2 className="label">RECENT TEAM ALERTS</h2>
            <ul className="list">
              {[
                'Zone C overheating — sent by Alex.',
                'Zone B humidity spike — sent by Sam.',
                'Filter door open — sent by Priya.',
              ].map((t, i) => (
                <li key={i} className="alert-item"><AlertDot /> {t}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2 className="label">QUICK ACTIONS</h2>
            <div className="actions">
              <button className="btn green" onClick={() => open('send')}>Send Alert</button>
              <button className="btn white" onClick={openResolve}>
                <CheckIcon />
                <span>Mark Issue as Resolved</span>
              </button>
              <button className="btn outline" onClick={openViewTicket}>
                <ReceiptIcon />
                <span>View Ticket</span>
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Modals */}
      {modal === 'send' && (
        <Modal title="Send Alert" onClose={close}>
          <SendAlertForm onSubmit={handleSend} onCancel={close} />
        </Modal>
      )}

      {modal === 'ticket' && selectedTicket && (
        <Modal
          title={`Ticket #${selectedTicket.id}`}
          onClose={close}
          footer={
            <div className="form-actions" style={{ padding: '12px 18px' }}>
              <button className="btn white" type="button" onClick={close}>Close</button>
              <button className="btn green" type="button" onClick={() => open('resolve')}>Resolve This Ticket</button>
            </div>
          }
        >
          <ViewTicketPane ticket={selectedTicket} />
        </Modal>
      )}

      {modal === 'resolve' && selectedTicket && (
        <Modal title={`Mark Ticket #${selectedTicket.id} as Resolved`} onClose={close}>
          <ResolvePane
            ticket={selectedTicket}
            initialNotes={resolveInitialNotes}
            onConfirm={handleResolve}
            onCancel={close}
          />
        </Modal>
      )}

      {modal === 'pickTicketForTicket' && (
        <Modal title="Select a Ticket to View" onClose={close}>
          <SelectTicketPane
            tickets={tickets}
            selectedId={pickerTempId}
            onSelect={setPickerTempId}
            onCancel={close}
            actionLabel="view"
            onContinue={() => {
              if (!pickerTempId) return;
              setSelectedTicketId(pickerTempId);
              open('ticket');
            }}
          />
        </Modal>
      )}

      {modal === 'pickTicketForResolve' && (
        <Modal title="Select a Ticket to Resolve" onClose={close}>
          <SelectTicketPane
            tickets={tickets}
            selectedId={pickerTempId}
            onSelect={setPickerTempId}
            onCancel={close}
            actionLabel="resolve"
            includeNotes
            notes={pickerNotes}
            onNotesChange={setPickerNotes}
            onContinue={() => {
              if (!pickerTempId) return;
              setSelectedTicketId(pickerTempId);
              setResolveInitialNotes(pickerNotes || '');
              open('resolve');
            }}
          />
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 24,
            transform: 'translateX(-50%)',
            background: '#111',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: 10,
            boxShadow: '0 10px 24px rgba(0,0,0,.25)',
            zIndex: 60,
            fontWeight: 700,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
