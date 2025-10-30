import React, { useState, useEffect } from 'react';
import { Home, CreditCard, Activity, TrendingUp, ChevronLeft, ChevronRight, Eye, EyeOff, Plus, ArrowUpRight, X, Settings, Palette, Shield, Download, Info, Lock, Unlock, Edit2 } from 'lucide-react';

const themes = {
  classic: {
    name: "Élégance Classique",
    bg: "#0A0A0A",
    cardBg: "#1A1A1A",
    accent: "#D4AF37",
    text: "#FFFFFF",
    textSecondary: "#E0E0E0",
    cardGradient: "linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)",
    cardFront: "linear-gradient(135deg, #1A1A1A 0%, #2A2020 100%)",
    cardBack: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)"
  },
  light: {
    name: "Pureté",
    bg: "#FFFFFF",
    cardBg: "#F8F9FA",
    accent: "#1A1A1A",
    accentSecondary: "#D4AF37",
    text: "#000000",
    textSecondary: "#6C757D",
    cardGradient: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
    cardFront: "linear-gradient(135deg, #FFFFFF 0%, #F0F0F0 100%)",
    cardBack: "linear-gradient(135deg, #E8E8E8 0%, #FFFFFF 100%)"
  }
};

const cardNetworks = {
  visa: { name: 'Visa', logo: '💳', color: '#1A1F71' },
  mastercard: { name: 'Mastercard', logo: '💳', color: '#EB001B' },
  amex: { name: 'American Express', logo: '💳', color: '#006FCF' }
};

const EliteBanking = () => {
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [activeTab, setActiveTab] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showModal, setShowModal] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({});
  const [flippedCard, setFlippedCard] = useState(null);
  const [revealedInfo, setRevealedInfo] = useState({});

  const theme = themes[currentTheme];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    loadData();
    return () => clearTimeout(timer);
  }, []);

  const loadData = async () => {
    try {
      const accountsData = await window.storage.get('accounts');
      const cardsData = await window.storage.get('cards');
      const transactionsData = await window.storage.get('transactions');
      const themeData = await window.storage.get('theme');
      
      if (accountsData) setAccounts(JSON.parse(accountsData.value));
      if (cardsData) setCards(JSON.parse(cardsData.value));
      if (transactionsData) setTransactions(JSON.parse(transactionsData.value));
      if (themeData) setCurrentTheme(themeData.value);
    } catch (error) {
      console.log('New user');
    }
  };

  const saveData = async () => {
    try {
      await window.storage.set('accounts', JSON.stringify(accounts));
      await window.storage.set('cards', JSON.stringify(cards));
      await window.storage.set('transactions', JSON.stringify(transactions));
      await window.storage.set('theme', currentTheme);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  useEffect(() => {
    if (!loading && accounts.length > 0) saveData();
  }, [accounts, cards, transactions, currentTheme, loading]);

  useEffect(() => {
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme.bg);
    }
  }, [currentTheme, theme.bg]);

useEffect(() => {
    document.body.style.backgroundColor = theme.bg;
    document.documentElement.style.backgroundColor = theme.bg;
  }, [theme.bg]);
  
  const generateCardNumber = () => {
    const segments = [];
    for (let i = 0; i < 4; i++) {
      segments.push(Math.floor(1000 + Math.random() * 9000));
    }
    return segments.join(' ');
  };

  const generateCVV = () => {
    return Math.floor(100 + Math.random() * 900).toString();
  };

  const generatePIN = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const generateExpiryDate = () => {
    const month = Math.floor(1 + Math.random() * 12).toString().padStart(2, '0');
    const year = (new Date().getFullYear() + 3 + Math.floor(Math.random() * 3)).toString().slice(-2);
    return `${month}/${year}`;
  };

  const addAccount = () => {
    const newAccount = {
      id: Date.now(),
      name: formData.accountName || `Compte ${accounts.length + 1}`,
      balance: parseFloat(formData.initialBalance) || 0,
      currency: formData.currency || 'EUR',
      iban: `FR76 ${Math.floor(Math.random()*10000).toString().padStart(4,'0')} ${Math.floor(Math.random()*10000).toString().padStart(4,'0')} ${Math.floor(Math.random()*10000).toString().padStart(4,'0')} ${Math.floor(Math.random()*10000).toString().padStart(4,'0')}`,
      createdAt: new Date().toISOString()
    };
    
    const newCard = {
      id: Date.now() + 1,
      accountId: newAccount.id,
      name: `Carte ${newAccount.name}`,
      number: generateCardNumber(),
      cvv: generateCVV(),
      pin: generatePIN(),
      expiry: generateExpiryDate(),
      network: 'visa',
      blocked: false,
      limits: {
        payment: 5000,
        withdrawal: 1000
      }
    };
    
    setAccounts([...accounts, newAccount]);
    setCards([...cards, newCard]);
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
    setCards(cards.filter(c => c.accountId !== id));
    setTransactions(transactions.filter(t => t.accountId !== id));
    if (currentAccountIndex >= accounts.length - 1) {
      setCurrentAccountIndex(Math.max(0, accounts.length - 2));
    }
    setShowModal(null);
  };

  const renameAccount = (id, name) => {
    setAccounts(accounts.map(a => a.id === id ? { ...a, name } : a));
  };

  const updateCard = (cardId, updates) => {
    setCards(cards.map(c => c.id === cardId ? { ...c, ...updates } : c));
  };

  const toggleCardBlock = (cardId) => {
    setCards(cards.map(c => c.id === cardId ? { ...c, blocked: !c.blocked } : c));
  };

  const updateCardLimits = () => {
    const card = cards[currentCardIndex];
    if (!card) return;
    
    updateCard(card.id, {
      limits: {
        payment: parseFloat(formData.paymentLimit) || card.limits.payment,
        withdrawal: parseFloat(formData.withdrawalLimit) || card.limits.withdrawal
      }
    });
    setShowModal(null);
    setFormData({});
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
  const currentCard = cards[currentCardIndex];

  const renderCardsTab = () => {
    if (cards.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>
          <CreditCard size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
          <p>Aucune carte disponible</p>
          <p style={{ fontSize: '14px' }}>Créez un compte pour obtenir une carte</p>
        </div>
      );
    }

    return (
      <div>
<div style={{ position: 'relative', marginBottom: '30px', minHeight: '240px' }}>          {cards.length > 1 && (
            <>
              <button onClick={() => setCurrentCardIndex((currentCardIndex - 1 + cards.length) % cards.length)}
                style={{
                  position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%)',
                  background: theme.cardBg, border: 'none', borderRadius: '50%',
                  width: '36px', height: '36px', cursor: 'pointer', zIndex: 10, color: theme.text,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setCurrentCardIndex((currentCardIndex + 1) % cards.length)}
                style={{
                  position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)',
                  background: theme.cardBg, border: 'none', borderRadius: '50%',
                  width: '36px', height: '36px', cursor: 'pointer', zIndex: 10, color: theme.text,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                <ChevronRight size={20} />
              </button>
            </>
          )}
<div style={{
  background: theme.cardBg,
  borderRadius: '16px',
  padding: '10',
  marginBottom: '20px'
}}>
         <div onClick={() => setFlippedCard(flippedCard === currentCard?.id ? null : currentCard?.id)}
  style={{
    width: '100%',
    height: '200px',
    perspective: '1200px',
    cursor: 'pointer',
  }}>
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.6s',
              transform: flippedCard === currentCard?.id ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}>
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                background: currentTheme === 'classic' ? theme.cardFront : theme.cardFront,
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                border: `1px solid ${theme.accent}33`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {cardNetworks[currentCard?.network]?.name || 'Visa'}
                    </p>
                    {currentCardIndex === 0 && (
                      <span style={{
                        display: 'inline-block',
                        marginTop: '4px',
                        padding: '2px 8px',
                        background: theme.accent,
                        color: currentTheme === 'light' ? theme.bg : '#000',
                        fontSize: '10px',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}>PRINCIPALE</span>
                    )}
                  </div>
                  <div style={{ fontSize: '32px' }}>💳</div>
                </div>

                <div>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '20px', 
                    fontWeight: '300', 
                    letterSpacing: '3px',
                    color: theme.text,
                    fontFamily: 'monospace'
                  }}>
                    {currentCard?.number}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: theme.textSecondary, textTransform: 'uppercase' }}>
                      Titulaire
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: theme.text, fontWeight: '500', textTransform: 'uppercase' }}>
                      Elite Member
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '10px', color: theme.textSecondary, textTransform: 'uppercase' }}>
                      Expire fin
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: theme.text, fontWeight: '500' }}>
                      {currentCard?.expiry}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                background: theme.cardBack,
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                border: `1px solid ${theme.accent}33`,
                transform: 'rotateY(180deg)',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: '100%', 
                  height: '50px', 
                  background: '#000',
                  marginTop: '24px'
                }} />
                <div style={{ padding: '24px' }}>
                  <div style={{ 
                    background: '#FFF',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    textAlign: 'right',
                    marginBottom: '12px'
                  }}>
                    <span style={{ 
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#000',
                      fontFamily: 'monospace',
                      fontStyle: 'italic'
                    }}>
                      {revealedInfo[`cvv-${currentCard?.id}`] ? currentCard?.cvv : '•••'}
                    </span>
                  </div>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '10px', 
                    color: theme.textSecondary,
                    textAlign: 'center'
                  }}>
                    Tapez pour voir le recto
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div> {/* Fin wrapper carte */}
          {cards.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
              {cards.map((_, i) => (
                <div key={i} style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: i === currentCardIndex ? theme.accent : theme.textSecondary,
                  opacity: i === currentCardIndex ? 1 : 0.3
                }} />
              ))}
            </div>
          )}
        </div>

        {currentCard && (
          <div style={{ 
            background: theme.cardBg, 
            borderRadius: '16px', 
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600' }}>
              {currentCard.name}
              <button
                onClick={() => {
                  setFormData({ cardName: currentCard.name });
                  setShowModal('renameCard');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme.accent,
                  cursor: 'pointer',
                  marginLeft: '10px',
                  padding: '5px'
                }}>
                <Edit2 size={16} />
              </button>
            </h3>

            <DetailRow 
              label="Numéro de carte" 
              value={revealedInfo[`number-${currentCard.id}`] ? currentCard.number : `•••• •••• •••• ${currentCard.number.slice(-4)}`}
              onReveal={() => setRevealedInfo({...revealedInfo, [`number-${currentCard.id}`]: !revealedInfo[`number-${currentCard.id}`]})}
              theme={theme}
            />

            <DetailRow 
              label="CVV" 
              value={revealedInfo[`cvv-${currentCard.id}`] ? currentCard.cvv : '•••'}
              onReveal={() => setRevealedInfo({...revealedInfo, [`cvv-${currentCard.id}`]: !revealedInfo[`cvv-${currentCard.id}`]})}
              theme={theme}
            />

            <DetailRow 
              label="Code PIN" 
              value={revealedInfo[`pin-${currentCard.id}`] ? currentCard.pin : '••••'}
              onReveal={() => setRevealedInfo({...revealedInfo, [`pin-${currentCard.id}`]: !revealedInfo[`pin-${currentCard.id}`]})}
              theme={theme}
            />

            <div style={{ 
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: `1px solid ${currentTheme === 'light' ? '#E0E0E0' : '#2A2A2A'}`
            }}>
              <ActionButton
                icon={currentCard.blocked ? <Unlock /> : <Lock />}
                label={currentCard.blocked ? 'Débloquer la carte' : 'Bloquer temporairement'}
                onClick={() => toggleCardBlock(currentCard.id)}
                theme={theme}
                danger={!currentCard.blocked}
              />
              
              <ActionButton
                icon={<Settings />}
                label="Modifier les plafonds"
                onClick={() => {
                  setFormData({
                    paymentLimit: currentCard.limits.payment,
                    withdrawalLimit: currentCard.limits.withdrawal
                  });
                  setShowModal('editLimits');
                }}
                theme={theme}
              />
            </div>

            {currentCard.blocked && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#ff444422',
                border: '1px solid #ff4444',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, color: '#ff4444', fontSize: '13px', fontWeight: '600' }}>
                  🔒 Carte bloquée temporairement
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ 
      backgroundColor: theme.bg, 
      minHeight: '100vh',
      color: theme.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      paddingBottom: '80px',
      paddingTop: 'env(safe-area-inset-top)'

    }}>
      <div style={{ 
        padding: '20px',
        paddingTop: 'max(20px, env(safe-area-inset-top))',
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

        {activeTab === 'cards' && renderCardsTab()}

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

        {activeTab === 'stats' && (
          <div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>
            <p>Module disponible en Phase 5</p>
          </div>
        )}
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, background: theme.cardBg,
        borderTop: `1px solid ${currentTheme === 'light' ? '#E0E0E0' : '#2A2A2A'}`,
        display: 'flex', justifyContent: 'space-around', padding: '12px 0',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))', zIndex: 100 }}>
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

            <DrawerItem icon={<Settings />} label="Paramètres" onClick={() => { setShowModal('settings'); setDrawerOpen(false); }} theme={theme} />
            <DrawerItem icon={<CreditCard />} label="Gérer mes comptes" onClick={() => { setShowModal('manageAccounts'); setDrawerOpen(false); }} theme={theme} />
            <DrawerItem icon={<Shield />} label="Sécurité" theme={theme} />
            <DrawerItem icon={<Download />} label="Exporter données" theme={theme} />
            <DrawerItem icon={<Info />} label="À propos" onClick={() => { setShowModal('about'); setDrawerOpen(false); }} theme={theme} />
            
            <div style={{ 
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: `1px solid ${theme.cardBg}`
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                borderRadius: '12px',
                background: 'transparent'
              }}>
                <span style={{ fontSize: '15px', color: theme.text }}>Thème sombre</span>
                <div 
                  onClick={() => setCurrentTheme(currentTheme === 'classic' ? 'light' : 'classic')}
                  style={{
                    width: '51px',
                    height: '31px',
                    borderRadius: '15.5px',
                    background: currentTheme === 'classic' ? theme.accent : '#ccc',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                  <div style={{
                    width: '27px',
                    height: '27px',
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: '2px',
                    left: currentTheme === 'classic' ? '22px' : '2px',
                    transition: 'left 0.3s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
              </div>
            </div>
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

            {showModal === 'renameCard' && (
              <div>
                <h3 style={{ marginTop: 0 }}>Renommer la carte</h3>
                <input type="text" placeholder="Nom de la carte" value={formData.cardName || ''}
                  onChange={(e) => setFormData({...formData, cardName: e.target.value})}
                  style={inputStyle(theme)} />
                <button onClick={() => {
                  updateCard(currentCard.id, { name: formData.cardName });
                  setShowModal(null);
                  setFormData({});
                }} style={buttonStyle(theme)}>Enregistrer</button>
              </div>
            )}

            {showModal === 'editLimits' && (
              <div>
                <h3 style={{ marginTop: 0 }}>Modifier les plafonds</h3>
                
                <div style={{ 
                  marginBottom: '20px',
                  padding: '16px',
                  background: currentTheme === 'light' ? '#F0F0F0' : '#0A0A0A',
                  borderRadius: '12px'
                }}>
                  <p style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: theme.text }}>
                    Plafonds actuels
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: theme.textSecondary }}>Paiement mensuel</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>
                      {currentCard.limits.payment.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: theme.textSecondary }}>Retrait mensuel</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>
                      {currentCard.limits.withdrawal.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                </div>

                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: theme.textSecondary }}>
                  Nouveau plafond de paiement mensuel (€)
                </label>
                <input type="number" placeholder="5000" value={formData.paymentLimit || ''}
                  onChange={(e) => setFormData({...formData, paymentLimit: e.target.value})}
                  style={inputStyle(theme)} />
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: theme.textSecondary }}>
                  Nouveau plafond de retrait mensuel (€)
                </label>
                <input type="number" placeholder="1000" value={formData.withdrawalLimit || ''}
                  onChange={(e) => setFormData({...formData, withdrawalLimit: e.target.value})}
                  style={inputStyle(theme)} />
                <button onClick={updateCardLimits} style={buttonStyle(theme)}>Enregistrer</button>
              </div>
            )}

            {showModal === 'settings' && (
              <div>
                <h3 style={{ marginTop: 0 }}>Paramètres</h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Type de carte</h4>
                  {cards.length > 0 && (
                    <div>
                      <p style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '12px' }}>
                        Carte sélectionnée : {currentCard?.name}
                      </p>
                      {Object.entries(cardNetworks).map(([key, network]) => (
                        <button
                          key={key}
                          onClick={() => {
                            updateCard(currentCard.id, { network: key });
                          }}
                          style={{
                            width: '100%',
                            padding: '15px',
                            marginBottom: '10px',
                            background: currentCard.network === key ? theme.accent + '33' : theme.cardBg,
                            border: currentCard.network === key ? `2px solid ${theme.accent}` : 'none',
                            borderRadius: '12px',
                            color: theme.text,
                            fontSize: '15px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                        >
                          <span style={{ fontSize: '24px' }}>{network.logo}</span>
                          <span>{network.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {cards.length === 0 && (
                    <p style={{ fontSize: '13px', color: theme.textSecondary }}>
                      Créez un compte pour avoir une carte
                    </p>
                  )}
                </div>
              </div>
            )}

            {showModal === 'about' && (
              <div>
                <h3 style={{ marginTop: 0 }}>À propos</h3>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '30px',
                  paddingBottom: '20px',
                  borderBottom: `1px solid ${theme.cardBg}`
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: theme.cardGradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    border: `2px solid ${theme.accent}33`
                  }}>
                    <span style={{ fontSize: '36px', fontWeight: '300', color: theme.accent }}>E</span>
                  </div>
                  <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '600' }}>Elite Banking</h2>
                  <p style={{ margin: 0, fontSize: '14px', color: theme.textSecondary }}>Version 1.0.0</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                    Description
                  </h4>
                  <p style={{ fontSize: '13px', color: theme.textSecondary, lineHeight: '1.6', margin: 0 }}>
                    Application bancaire fictive premium conçue pour la visualisation et la simulation financière personnelle.
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                    Fonctionnalités
                  </h4>
                  <ul style={{ fontSize: '13px', color: theme.textSecondary, lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
                    <li>Gestion multi-comptes</li>
                    <li>Cartes bancaires virtuelles</li>
                    <li>Transactions et virements</li>
                    <li>Thèmes personnalisables</li>
                    <li>Stockage sécurisé des données</li>
                  </ul>
                </div>

                <div style={{
                  padding: '16px',
                  background: theme.accent + '11',
                  border: `1px solid ${theme.accent}33`,
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <p style={{ margin: 0, fontSize: '12px', color: theme.text, textAlign: 'center' }}>
                    ⚠️ Cette application utilise uniquement des données fictives
                  </p>
                </div>

                <div style={{ fontSize: '12px', color: theme.textSecondary, textAlign: 'center' }}>
                  <p style={{ margin: '0 0 4px' }}>Développé avec React</p>
                  <p style={{ margin: 0 }}>© 2025 Elite Banking</p>
                </div>
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

const DetailRow = ({ label, value, onReveal, theme }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: `1px solid ${theme.cardBg}`
  }}>
    <span style={{ fontSize: '14px', color: theme.textSecondary }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'monospace' }}>{value}</span>
      <button onClick={onReveal} style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: theme.accent, padding: '4px'
      }}>
        <Eye size={16} />
      </button>
    </div>
  </div>
);

const ActionButton = ({ icon, label, onClick, theme, danger }) => (
  <button onClick={onClick} style={{
    width: '100%',
    padding: '12px',
    marginBottom: '8px',
    background: 'transparent',
    border: `1px solid ${danger ? '#ff4444' : theme.accent}33`,
    borderRadius: '12px',
    color: danger ? '#ff4444' : theme.text,
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'left'
  }}>
    {React.cloneElement(icon, { size: 18 })}
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
