import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Bike, Check, ChevronDown, Clock3, MapPin, Menu, MessageCircle, ShoppingBag, Sparkles, Store, X } from 'lucide-react';
import './index.css';

const api = async (path, options = {}) => {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Something went wrong');
  return data;
};

function App() {
  const [view, setView] = useState('order');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [merchants, setMerchants] = useState([]);
  const [merchantId, setMerchantId] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { api('/api/v1/merchants').then(setMerchants).catch((error) => setMessage(error.message)).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (merchantId) api(`/api/v1/merchants/${merchantId}/products`).then(setProducts).catch((error) => setMessage(error.message)); }, [merchantId]);

  const selectedMerchant = merchants.find((merchant) => merchant.id === merchantId);
  const total = products.reduce((sum, product) => sum + Number(product.priceUsd) * (cart[product.id] || 0), 0);
  const addToCart = (product) => setCart((current) => ({ ...current, [product.id]: (current[product.id] || 0) + 1 }));
  const itemCount = Object.values(cart).reduce((sum, count) => sum + count, 0);

  return <div className="min-h-screen overflow-hidden text-[#17231d]">
    <header className="relative z-20 border-b border-[#dce4d7] bg-[#f6f7f1]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
        <button onClick={() => setView('order')} className="flex items-center gap-3 text-left"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#176b48] text-[#d8ef9f] shadow-lg shadow-[#176b48]/20"><ShoppingBag size={20} /></span><span><span className="block font-display text-xl font-bold leading-none">Mr Chow</span><span className="font-sans text-[10px] uppercase tracking-[.2em] text-[#6b756e]">Masvingo delivery</span></span></button>
        <nav className="hidden items-center gap-2 font-sans text-sm md:flex"><NavButton active={view === 'order'} onClick={() => setView('order')}>Order food</NavButton><NavButton active={view === 'admin'} onClick={() => setView('admin')}>Operations</NavButton><NavButton active={view === 'whatsapp'} onClick={() => setView('whatsapp')}>WhatsApp</NavButton></nav>
        <button onClick={() => setMobileMenu(!mobileMenu)} className="rounded-xl p-2 md:hidden">{mobileMenu ? <X /> : <Menu />}</button>
      </div>
      <AnimatePresence>{mobileMenu && <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-[#dce4d7] px-5 py-3 md:hidden"><NavButton onClick={() => { setView('order'); setMobileMenu(false); }}>Order food</NavButton><NavButton onClick={() => { setView('admin'); setMobileMenu(false); }}>Operations</NavButton><NavButton onClick={() => { setView('whatsapp'); setMobileMenu(false); }}>WhatsApp</NavButton></motion.nav>}</AnimatePresence>
    </header>

    <main className="mx-auto max-w-7xl px-5 pb-24 pt-8 lg:px-10 lg:pt-14">
      <AnimatePresence mode="wait">{view === 'order' && <OrderView key="order" merchants={merchants} selectedMerchant={selectedMerchant} merchantId={merchantId} setMerchantId={setMerchantId} products={products} cart={cart} addToCart={addToCart} total={total} itemCount={itemCount} loading={loading} message={message} />}{view === 'admin' && <AdminView key="admin" />}{view === 'whatsapp' && <WhatsAppView key="whatsapp" />}</AnimatePresence>
    </main>
    <footer className="border-t border-[#dce4d7] px-5 py-6 text-center font-sans text-xs text-[#6b756e]">Mr Chow is in progress · Built for Masvingo, Zimbabwe</footer>
  </div>;
}

function NavButton({ active, children, onClick }) { return <button onClick={onClick} className={`rounded-xl px-4 py-2 transition ${active ? 'bg-[#17231d] text-white' : 'text-[#6b756e] hover:bg-white hover:text-[#17231d]'}`}>{children}</button>; }

function OrderView({ merchants, selectedMerchant, merchantId, setMerchantId, products, cart, addToCart, total, itemCount, loading, message }) {
  return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: .45 }}>
    <section className="grid items-end gap-10 pb-14 lg:grid-cols-[1.15fr_.85fr]"><div><p className="eyebrow">GOOD FOOD, MOVING YOUR WAY</p><h1 className="max-w-3xl font-display text-5xl font-bold leading-[.95] tracking-tight sm:text-7xl">Your next favourite meal is <em className="text-[#ec7449]">around the corner.</em></h1><p className="mt-6 max-w-xl font-sans text-lg leading-8 text-[#6b756e]">Discover local restaurants and shops in Masvingo. Order in a few taps, pay your way, and follow every step to your door.</p><div className="mt-8 flex flex-wrap gap-3 font-sans text-sm text-[#176b48]"><span className="pill"><Clock3 size={15} /> Fast local delivery</span><span className="pill"><MapPin size={15} /> Masvingo first</span></div></div><div className="relative hidden min-h-[250px] overflow-hidden rounded-[2rem] bg-[#d8ef9f] p-8 lg:block"><div className="absolute -right-10 -top-16 h-64 w-64 rounded-full border-[32px] border-[#176b48]/10" /><div className="relative flex h-full flex-col justify-end"><Sparkles className="mb-auto text-[#176b48]" size={30} /><p className="font-display text-3xl font-bold text-[#176b48]">Fresh picks.<br />Right here.</p></div></div></section>
    <section className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]"><div className="rounded-3xl bg-[#17231d] p-6 text-white shadow-2xl shadow-[#17231d]/15"><div className="mb-10 flex items-center justify-between"><span className="eyebrow !text-[#d8ef9f]">01 / DISCOVER</span><Store className="text-[#d8ef9f]" size={20} /></div><h2 className="font-display text-3xl font-bold">Who are we ordering from?</h2><p className="mt-3 font-sans text-sm leading-6 text-white/60">Choose a local merchant to see their menu.</p><div className="relative mt-8"><select value={merchantId} onChange={(event) => setMerchantId(event.target.value)} className="w-full appearance-none rounded-2xl border border-white/15 bg-white/10 px-4 py-4 font-sans text-sm text-white outline-none"><option className="text-[#17231d]" value="">{loading ? 'Loading merchants...' : merchants.length ? 'Choose a merchant' : 'No active merchants yet'}</option>{merchants.map((merchant) => <option className="text-[#17231d]" key={merchant.id} value={merchant.id}>{merchant.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-4 text-white/50" size={20} /></div>{selectedMerchant && <div className="mt-5 flex items-center gap-2 font-sans text-xs text-white/55"><MapPin size={14} />{selectedMerchant.address || selectedMerchant.city}</div>}{message && <p className="mt-5 rounded-xl bg-[#ec7449]/20 p-3 font-sans text-xs text-[#ffd1c0]">{message}</p>}</div>
      <div className="rounded-3xl border border-[#dce4d7] bg-white p-6 shadow-xl shadow-[#17231d]/5"><div className="mb-7 flex items-center justify-between"><div><span className="eyebrow">02 / MENU</span><h2 className="mt-1 font-display text-3xl font-bold">{selectedMerchant?.name || 'Make a selection'}</h2></div>{itemCount > 0 && <span className="rounded-full bg-[#d8ef9f] px-3 py-1 font-sans text-xs font-bold text-[#176b48]">{itemCount} item{itemCount > 1 ? 's' : ''}</span>}</div>{products.length ? <div className="grid gap-3 sm:grid-cols-2">{products.map((product, index) => <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }} key={product.id} className="group flex items-center justify-between rounded-2xl border border-[#dce4d7] p-4 transition hover:border-[#176b48] hover:shadow-lg"><div><h3 className="font-display font-bold">{product.title}</h3><p className="mt-1 font-sans text-xs text-[#6b756e]">{product.description || 'Made fresh by your local merchant'}</p><p className="mt-3 font-sans text-sm font-bold text-[#176b48]">${Number(product.priceUsd).toFixed(2)}</p></div><button onClick={() => addToCart(product)} className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0f4e9] text-xl text-[#176b48] transition group-hover:bg-[#176b48] group-hover:text-white">+</button></motion.div>)}</div> : <div className="grid min-h-48 place-items-center rounded-2xl bg-[#f6f7f1] text-center"><div><ShoppingBag className="mx-auto text-[#b3c1b1]" size={28} /><p className="mt-3 font-sans text-sm text-[#6b756e]">{selectedMerchant ? 'This menu is waiting for its first items.' : 'Your menu will appear here.'}</p></div></div>}{itemCount > 0 && <div className="mt-6 flex items-center justify-between border-t border-[#dce4d7] pt-5"><div><span className="font-sans text-xs text-[#6b756e]">Your basket</span><p className="font-display text-2xl font-bold">${total.toFixed(2)}</p></div><button className="button-primary">Continue to checkout <ArrowRight size={17} /></button></div>}</div></section>
  </motion.div>;
}

function AdminView() { const [data, setData] = useState(null); const [error, setError] = useState(''); useEffect(() => { api('/api/v1/admin/dashboard', { headers: { 'x-user-role': 'ADMIN' } }).then(setData).catch((e) => setError(e.message)); }, []); return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><p className="eyebrow">OPERATIONS / ADMIN APP</p><h1 className="font-display text-5xl font-bold">Keep the city moving.</h1><p className="mt-5 max-w-xl font-sans leading-7 text-[#6b756e]">One view for orders, merchants, payments, and delivery handoffs. This connects to the same API used by the customer experience.</p>{error && <div className="mt-8 rounded-2xl border border-[#ec7449]/30 bg-[#fff0ea] p-5 font-sans text-sm text-[#9a452d]">{error}. Add PostgreSQL data and an admin auth token to load live operations.</div>}<div className="mt-10 grid gap-4 sm:grid-cols-3">{[['Orders', data?.orders ?? '--', ShoppingBag], ['Active merchants', data?.activeMerchants ?? '--', Store], ['Payments waiting', data?.pendingPayments ?? '--', Check]].map(([label, value, Icon]) => <div className="rounded-3xl bg-[#17231d] p-6 text-white" key={label}><Icon className="mb-8 text-[#d8ef9f]" size={20} /><p className="font-sans text-xs text-white/55">{label}</p><strong className="mt-2 block font-display text-4xl">{value}</strong></div>)}</div></motion.div>; }
function WhatsAppView() { return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><p className="eyebrow">CONNECTED CHANNEL / WHATSAPP</p><h1 className="max-w-2xl font-display text-5xl font-bold">Meet customers where they already are.</h1><div className="mt-10 grid gap-5 md:grid-cols-3">{[['1', 'Verify', 'Meta calls the public webhook URL and checks your verify token.'], ['2', 'Receive', 'Incoming text, buttons, and location events enter the shared order logic.'], ['3', 'Respond', 'The WhatsApp service sends menus, buttons, and order updates back.']].map(([number, title, copy]) => <div className="rounded-3xl border border-[#dce4d7] bg-white p-6" key={number}><span className="font-display text-4xl font-bold text-[#ec7449]">{number}</span><h2 className="mt-12 font-display text-2xl font-bold">{title}</h2><p className="mt-3 font-sans text-sm leading-6 text-[#6b756e]">{copy}</p></div>)}</div><div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#d8ef9f] p-5 font-sans text-sm text-[#176b48]"><MessageCircle size={20} />Webhook path: <code>/api/v1/whatsapp/webhook</code></div></motion.div>; }

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
