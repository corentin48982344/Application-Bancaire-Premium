import React, { useState, useEffect } from 'react';
import { Home, CreditCard, Activity, TrendingUp, ChevronLeft, ChevronRight, Eye, EyeOff, Plus, ArrowUpRight, X, Settings, Palette, Shield, Download, Info } from 'lucide-react';

const themes = {
  classic: {
    name: "Élégance Classique",
    bg: "#0A0A0A",
    cardBg: "#1A1A1A",
    accent: "#D4AF37",
    text: "#FFFFFF",
    textSecondary: "#E0E0E0",
    cardGradient: "linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)"
  },
  light: {
    name: "Pureté",
    bg: "#FFFFFF",
    cardBg: "#F8F9FA",
    accent: "#1A1A1A",
    accentSecondary: "#D4AF37",
    text: "#000000",
    textSecondary: "#6C757D",
    cardGradient: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)"
  }
};

const EliteBanking = () => {
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [activeTab, setActiveTab] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
  const [showModal, setShowModal] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({});

  const theme = themes[currentTheme];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    loadData();
    return () => clearTimeout(timer);
  }, []);

  const loadData = async () => {
    try {
      const accountsData = await window.storage.get('accounts');
      const transactionsData = await window.storage.get('transactions');
      const themeData = await window.storage.get('theme');
      
      if (accountsData) setAccounts(JSON.parse(accountsData.value));
      if (transactionsData) setTransactions(JSON.parse(transactionsData.value));
      if (themeData) setCurrentTheme(themeData.value);
    } catch (error) {
      console.log('New user');
    }
  };

  const saveData = async () => {
    try {
      await window.storage.set('accounts', JSON.stringify(accounts));
      await window.storage.set('transactions', JSON.stringify(transactions));
      await window.storage.set('theme', currentTheme);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  useEffect(() => {
    if (!loading && accounts.length > 0) saveData();
  }, [accounts, transactions, currentTheme, loading]);

  const addAccount = () => {
    const newAccount = {
      id: Date.now(),
      name: formData.accountName || `Compte ${accounts.length + 1}`,
      balance: parseFloat(formData.initialBalance) || 0,
      currency: formData.currency || 'EUR',
      iban: `FR76 ${Math.floor(Math.random()*10000).toString().padStart(4,'0')} ${Math.floor(Math.random()*10000).toString().padStart(4,'0')} ${Math.floor(Math.random()*10000).toString().padStart(4,'0')} ${Math.floor(Math.random()*10000).toString().padStart(4,'0')}`,
      createdAt: new Date().toISOString()
    };
    setAccounts([...accounts, newAccount]);
    setShowModal(null);
    setFormData({});
  };

  const addTransaction = () => {
    if (!accounts[currentAccountIndex]) return;
    const amount = parseFloat(formData.amount) || 0;
    const finalAmount = formData.type === 'debit' ? -Math.abs(amount) : Math.abs(amount);
    
    const newTransaction = {
      id: Date.now(),
      accountId: accounts[currentAccountIndex].id,
      name: formData.name || 'Transaction',
      category: formData.category || 'Autre',
      amount: finalAmount,
      date: new Date().toISOString(),
      logo: '💰',
      type: formData.type || 'debit'
    };

    setTransactions([newTransaction, ...transactions]);
    setAccounts(accounts.map(acc => 
      acc.id === accounts[currentAccountIndex].id 
        ? { ...acc, balance: acc.balance + finalAmount }
        : acc
    ));
    setShowModal(null);
    setFormData({});
  };

  const performTransfer = () => {
    const fromAcc = accounts.find(a => a.id === parseInt(formData.fromAccount));
    const toAcc = accounts.find(a => a.id === parseInt(formData.toAccount));
    const amount = parseFloat(formData.transferAmount) || 0;

    if (!fromAcc || !toAcc || amount <= 0) return;

    const ts = Date.now();
    setTransactions([
      {
        id: ts,
        accountId: fromAcc.id,
        name: `Virement vers ${toAcc.name}`,
        category: 'Virement',
        amount: -amount,
        date: new Date().toISOString(),
        logo: '🔄',
        type: 'debit'
      },
      {
        id: ts + 1,
        accountId: toAcc.id,
        name: `Virement depuis ${fromAcc.name}`,
        category: 'Virement',
        amount: amount,
        date: new Date().toISOString(),
        logo: '🔄',
        type: 'credit'
      },
      ...transactions
    ]);

    setAccounts(accounts.map(acc => {
      if (acc.id === fromAcc.id) return { ...acc, balance: acc.balance - amount };
      if (acc.id === toAcc.id) return { ...acc, balance: acc.balance + amount };
      return acc;
    }));
    setShowModal(null);
    setFormData({});
  };

  const deleteAccount = (id) => {
    setAccounts(accounts.filter(a => a.id !== id));
    setTransactions(transactions.filter(t => t.accountId !== id));
    if (currentAccountIndex >= accounts.length - 1) {
      setCurrentAccountIndex(Math.max(0, accounts.length - 2));
    }
    setShowModal(null);
  };

  const renameAccount = (id, name) => {
    setAccounts(accounts.map(a => a.id === id ? { ...a, name } : a));
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: theme.bg,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '30px',
          background: theme.cardGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '30px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: `2px solid ${theme.accent}33`
        }}>
          <span style={{ fontSize: '48px', fontWeight: '300', color: theme.accent }}>E</span>
        </div>
        <h1 style={{ color: theme.text, fontSize: '32px', fontWeight: '300', letterSpacing: '2px', margin: 0 }}>ELITE</h1>
        <p style={{ color: theme.textSecondary, fontSize: '14px', fontWeight: '400', letterSpacing: '3px', marginTop: '8px' }}>BANKING</p>
      </div>
    );
  }

  const currentAccount = accounts[currentAccountIndex];
  const currentAccountTransactions = transactions.filter(t => t?.accountId === currentAccount?.id);

  return (
    <div style={{ 
      backgroundColor: theme.bg, 
      minHeight: '100vh',
      color: theme.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      paddingBottom: '80px'
    }}>
      <div style={{ 
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        backgroundColor: theme.bg,
        zIndex: 100,
        borderBottom: `1px solid ${theme.cardBg}`
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
          {activeTab === 'home' ? 'Patrimoine' : activeTab === 'cards' ? 'Cartes' : activeTab === 'activity' ? 'Activité' : 'Statistiques'}
        </h1>
        <button onClick={() => setDrawerOpen(true)} style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: theme.cardBg, border: `2px solid ${theme.accent}`,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: theme.accent, fontSize: '18px', fontWeight: '600'
        }}>E</button>
      </div>

      <div style={{ padding: '20px' }}>
        {activeTab === 'home' && (
          <div>
            {accounts.length > 0 ? (
              <div style={{ position: 'relative', marginBottom: '30px' }}>
                {accounts.length > 1 && (
                  <>
                    <button onClick={() => setCurrentAccountIndex((currentAccountIndex - 1 + accounts.length) % accounts.length)}
                      style={{
                        position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%)',
                        background: theme.cardBg, border: 'none', borderRadius: '50%',
                        width: '36px', height: '36px', cursor: 'pointer', zIndex: 10, color: theme.text
                      }}>
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setCurrentAccountIndex((currentAccountIndex + 1) % accounts.length)}
                      style={{
                        position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)',
                        background: theme.cardBg, border: 'none', borderRadius: '50%',
                        width: '36px', height: '36px', cursor: 'pointer', zIndex: 10, color: theme.text
                      }}>
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                <div style={{
                  background: theme.cardGradient, borderRadius: '20px', padding: '30px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                    <div style={{ flex: 1 }}>
                      <input type="text" value={currentAccount.name}
                        onChange={(e) => renameAccount(currentAccount.id, e.target.value)}
                        style={{
                          background: 'transparent', border: 'none', color: theme.textSecondary,
                          fontSize: '14px', fontFamily: 'inherit', padding: 0, outline: 'none', width: '100%'
                        }}
                      />
                      <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '5px 0 0' }}>{currentAccount.iban}</p>
                    </div>
                    <button onClick={() => setBalanceVisible(!balanceVisible)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.textSecondary }}>
                      {balanceVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>

                  <h2 style={{ fontSize: '42px', fontWeight: '300', margin: 0, letterSpacing: '-1px' }}>
                    {balanceVisible ? `${currentAccount.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €` : '••••• €'}
                  </h2>

                  {accounts.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                      {accounts.map((_, i) => (
                        <div key={i} style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: i === currentAccountIndex ? theme.accent : theme.textSecondary,
                          opacity: i === currentAccountIndex ? 1 : 0.3
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ background: theme.cardBg, borderRadius: '20px', padding: '40px', textAlign: 'center', marginBottom: '30px' }}>
                <p style={{ color: theme.textSecondary, marginBottom: '20px' }}>Bienvenue sur Elite Banking</p>
                <button onClick={() => setShowModal('createAccount')}
                  style={{
                    background: theme.accent, color: currentTheme === 'light' ? theme.bg : theme.text,
                    border: 'none', borderRadius: '12px', padding: '12px 24px', cursor: 'pointer', fontWeight: '500'
                  }}>
                  Créer votre premier compte
                </button>
              </div>
            )}

            {accounts.length > 0 && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '30px' }}>
                  <QuickAction icon={<ArrowUpRight size={20} />} label="Virement" onClick={() => setShowModal('transfer')} theme={theme} />
                  <QuickAction icon={<Plus size={20} />} label="Transaction" onClick={() => setShowModal('addTransaction')} theme={theme} />
                  <QuickAction icon={<CreditCard size={20} />} label="Compte" onClick={() => setShowModal('createAccount')} theme={theme} />
                </div>

                {currentAccountTransactions.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>Transactions récentes</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {currentAccountTransactions.slice(0, 5).map(tx => <TransactionItem key={tx.id} tx={tx} theme={theme} />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Activité</h2>
            {transactions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {transactions.map(tx => {
                  const acc = accounts.find(a => a.id === tx.accountId);
                  return (
                    <div key={tx.id}>
                      <p style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '5px' }}>{acc?.name}</p>
                      <TransactionItem tx={tx} theme={theme} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: theme.textSecondary, textAlign: 'center', padding: '40px' }}>Aucune transaction</p>
            )}
          </div>
        )}

        {(activeTab === 'cards' || activeTab === 'stats') && (
          <div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>
            <p>Module disponible en Phase {activeTab === 'cards' ? '3' : '5'}</p>
          </div>
        )}
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, background: theme.cardBg,
        borderTop: `1px solid ${currentTheme === 'light' ? '#E0E0E0' : '#2A2A2A'}`,
        display: 'flex', justifyContent: 'space-around', padding: '12px 0', zIndex: 100
      }}>
        <TabBtn icon={<Home size={24} />} label="Accueil" active={activeTab === 'home'} onClick={() => setActiveTab('home')} theme={theme} />
        <TabBtn icon={<CreditCard size={24} />} label="Cartes" active={activeTab === 'cards'} onClick={() => setActiveTab('cards')} theme={theme} />
        <TabBtn icon={<Activity size={24} />} label="Activité" active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} theme={theme} />
        <TabBtn icon={<TrendingUp size={24} />} label="Stats" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} theme={theme} />
      </div>

      {drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 200
          }} />
          <div style={{
            position: 'fixed', right: 0, top: 0, bottom: 0, width: '75%', background: theme.bg,
            zIndex: 201, padding: '20px', overflowY: 'auto', boxShadow: '-4px 0 20px rgba(0,0,0,0.3)'
          }}>
            <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: `1px solid ${theme.cardBg}` }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%', background: theme.cardBg,
                border: `2px solid ${theme.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: '600', color: theme.accent, marginBottom: '15px'
              }}>E</div>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Elite Member</h3>
              <p style={{ margin: '5px 0 0', fontSize: '14px', color: theme.textSecondary }}>
                {accounts.length} compte{accounts.length > 1 ? 's' : ''}
              </p>
            </div>

            <DrawerItem icon={<Settings />} label="Paramètres" theme={theme} />
            <DrawerItem icon={<CreditCard />} label="Gérer mes comptes" onClick={() => { setShowModal('manageAccounts'); setDrawerOpen(false); }} theme={theme} />
            <DrawerItem icon={<Palette />} label="Apparence" onClick={() => setCurrentTheme(currentTheme === 'classic' ? 'light' : 'classic')} theme={theme} />
            <DrawerItem icon={<Shield />} label="Sécurité" theme={theme} />
            <DrawerItem icon={<Download />} label="Exporter données" theme={theme} />
            <DrawerItem icon={<Info />} label="À propos" theme={theme} />
          </div>
        </>
      )}

      {showModal && (
        <>
          <div onClick={() => setShowModal(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 300
          }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, background: theme.bg,
            borderRadius: '20px 20px 0 0', padding: '20px', zIndex: 301, maxHeight: '80vh', overflowY: 'auto'
          }}>
            <button onClick={() => setShowModal(null)} style={{
              position: 'absolute', right: '20px', top: '20px', background: 'transparent',
              border: 'none', cursor: 'pointer', color: theme.textSecondary
            }}>
              <X size={24} />
            </button>

            {showModal === 'createAccount' && (
              <div>
                <h3 style={{ marginTop: 0 }}>Nouveau compte</h3>
                <input type="text" placeholder="Nom du compte" value={formData.accountName || ''}
                  onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                  style={inputStyle(theme)} />
                <input type="number" placeholder="Solde initial" value={formData.initialBalance || ''}
                  onChange={(e) => setFormData({...formData, initialBalance: e.target.value})}
                  style={inputStyle(theme)} />
                <select value={formData.currency || 'EUR'}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  style={inputStyle(theme)}>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                <button onClick={addAccount} style={buttonStyle(theme)}>Créer le compte</button>
              </div>
            )}

            {showModal === 'addTransaction' && (
              <div>
                <h3 style={{ marginTop: 0 }}>Nouvelle transaction</h3>
                <select value={formData.type || 'debit'}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  style={inputStyle(theme)}>
                  <option value="debit">Dépense</option>
                  <option value="credit">Revenu</option>
                </select>
                <input type="text" placeholder="Nom" value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={inputStyle(theme)} />
                <input type="number" placeholder="Montant" value={formData.amount || ''}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  style={inputStyle(theme)} />
                <input type="text" placeholder="Catégorie" value={formData.category || ''}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  style={inputStyle(theme)} />
                <button onClick={addTransaction} style={buttonStyle(theme)}>Ajouter</button>
              </div>
            )}

            {showModal === 'transfer' && accounts.length >= 2 && (
              <div>
                <h3 style={{ marginTop: 0 }}>Virement interne</h3>
                <select value={formData.fromAccount || ''}
                  onChange={(e) => setFormData({...formData, fromAccount: e.target.value})}
                  style={inputStyle(theme)}>
                  <option value="">Depuis le compte...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.balance.toFixed(2)} €)</option>
                  ))}
                </select>
                <select value={formData.toAccount || ''}
                  onChange={(e) => setFormData({...formData, toAccount: e.target.value})}
                  style={inputStyle(theme)}>
                  <option value="">Vers le compte...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
                <input type="number" placeholder="Montant" value={formData.transferAmount || ''}
                  onChange={(e) => setFormData({...formData, transferAmount: e.target.value})}
                  style={inputStyle(theme)} />
                <button onClick={performTransfer} style={buttonStyle(theme)}>Effectuer le virement</button>
              </div>
            )}

            {showModal === 'manageAccounts' && (
              <div>
                <h3 style={{ marginTop: 0 }}>Gérer mes comptes</h3>
                {accounts.map(acc => (
                  <div key={acc.id} style={{
                    background: theme.cardBg, padding: '15px', borderRadius: '12px', marginBottom: '10px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: '500' }}>{acc.name}</p>
                      <p style={{ margin: '5px 0 0', fontSize: '14px', color: theme.textSecondary }}>
                        {acc.balance.toFixed(2)} {acc.currency}
                      </p>
                    </div>
                    <button onClick={() => deleteAccount(acc.id)} style={{
                      background: '#ff4444', color: 'white', border: 'none',
                      borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px'
                    }}>Supprimer</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const QuickAction = ({ icon, label, onClick, theme }) => (
  <button onClick={onClick} style={{
    background: theme.cardBg, border: `1px solid ${theme.accent}33`, borderRadius: '12px',
    padding: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '8px', cursor: 'pointer', color: theme.text
  }}>
    {icon}
    <span style={{ fontSize: '13px' }}>{label}</span>
  </button>
);

const TransactionItem = ({ tx, theme }) => (
  <div style={{
    background: theme.cardBg, borderRadius: '12px', padding: '16px',
    display: 'flex', alignItems: 'center', gap: '15px'
  }}>
    <div style={{
      width: '48px', height: '48px', borderRadius: '50%',
      background: `${theme.accent}22`, display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontSize: '24px'
    }}>{tx.logo}</div>
    <div style={{ flex: 1 }}>
      <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>{tx.name}</p>
      <p style={{ margin: 0, fontSize: '13px', color: theme.textSecondary, marginTop: '2px' }}>{tx.category}</p>
    </div>
    <div style={{ textAlign: 'right' }}>
      <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: tx.type === 'credit' ? '#4CAF50' : theme.text }}>
        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
      </p>
      <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary, marginTop: '2px' }}>
        {new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
      </p>
    </div>
  </div>
);

const TabBtn = ({ icon, label, active, onClick, theme }) => (
  <button onClick={onClick} style={{
    background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '4px', cursor: 'pointer',
    color: active ? theme.accent : theme.textSecondary, padding: '8px 16px'
  }}>
    {icon}
    <span style={{ fontSize: '11px' }}>{label}</span>
  </button>
);

const DrawerItem = ({ icon, label, onClick, theme }) => (
  <button onClick={onClick} style={{
    width: '100%', background: 'transparent', border: 'none',
    display: 'flex', alignItems: 'center', gap: '15px', padding: '15px',
    cursor: 'pointer', color: theme.text, fontSize: '15px',
    borderRadius: '12px', marginBottom: '5px', textAlign: 'left'
  }}>
    {React.cloneElement(icon, { size: 20 })}
    {label}
  </button>
);

const inputStyle = (theme) => ({
  width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '12px',
  border: `1px solid ${theme.cardBg}`, background: theme.cardBg,
  color: theme.text, fontSize: '15px', fontFamily: 'inherit', outline: 'none'
});

const buttonStyle = (theme) => ({
  width: '100%', padding: '15px', borderRadius: '12px', border: 'none',
  background: theme.accent, color: theme.bg === '#FFFFFF' ? theme.bg : theme.text,
  fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '10px'
});

export default EliteBanking;
