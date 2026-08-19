const $ = (selector) => document.querySelector(selector);
const state = { merchants: [], products: [], cart: new Map(), latestOrderId: '' };

function showResult(selector, value, error = false) {
  const element = $(selector);
  element.hidden = false;
  element.classList.toggle('error', error);
  element.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `${response.status} ${response.statusText}`);
  return body;
}

async function checkHealth() {
  try {
    await api('/health');
    $('#apiStatus').textContent = 'API online';
    $('#statusDot').classList.add('online');
  } catch (error) {
    $('#apiStatus').textContent = 'API unavailable';
  }
}

async function loadMerchants() {
  const select = $('#merchantSelect');
  select.innerHTML = '<option value="">Loading merchants...</option>';
  try {
    state.merchants = await api('/api/v1/merchants');
    select.innerHTML = state.merchants.length ? '<option value="">Choose a merchant</option>' : '<option value="">No active merchants</option>';
    for (const merchant of state.merchants) select.add(new Option(merchant.name, merchant.id));
  } catch (error) {
    select.innerHTML = '<option value="">Database unavailable</option>';
    showResult('#orderResult', error.message, true);
  }
}

function renderProducts() {
  const list = $('#products');
  list.innerHTML = state.products.length ? state.products.map((product) => `<div class="product"><div><strong>${product.title}</strong><small>${product.description || 'Fresh from the merchant'} / $${Number(product.priceUsd).toFixed(2)}</small></div><input aria-label="Quantity for ${product.title}" type="number" min="0" value="${state.cart.get(product.id) || 0}" data-product="${product.id}"></div>`).join('') : '<p class="muted">No products available.</p>';
  list.querySelectorAll('input').forEach((input) => input.addEventListener('input', (event) => { const quantity = Number(event.target.value); if (quantity) state.cart.set(event.target.dataset.product, quantity); else state.cart.delete(event.target.dataset.product); updateTotal(); }));
}

async function loadProducts() {
  const merchant = state.merchants.find((item) => item.id === $('#merchantSelect').value);
  state.cart.clear(); state.products = [];
  if (!merchant) { $('#merchantMeta').textContent = 'Select a merchant to load its menu.'; renderProducts(); updateTotal(); return; }
  $('#merchantMeta').textContent = `${merchant.city} / ${merchant.address || 'Address to be confirmed'}`;
  try { state.products = await api(`/api/v1/merchants/${merchant.id}/products`); renderProducts(); } catch (error) { showResult('#orderResult', error.message, true); }
  updateTotal();
}

function updateTotal() {
  const total = state.products.reduce((sum, product) => sum + Number(product.priceUsd) * (state.cart.get(product.id) || 0), 0);
  $('#total').textContent = `$${total.toFixed(2)}`;
}

async function placeOrder() {
  const merchantId = $('#merchantSelect').value;
  const items = [...state.cart].map(([product_id, quantity]) => ({ product_id, quantity }));
  if (!merchantId || !$('#userId').value || !items.length) return showResult('#orderResult', 'Choose a merchant, enter a user UUID, and add a product.', true);
  try {
    const order = await api('/api/v1/orders', { method: 'POST', body: JSON.stringify({ user_id: $('#userId').value, merchant_id: merchantId, items, location: { latitude: Number($('#latitude').value) || undefined, longitude: Number($('#longitude').value) || undefined } }) });
    state.latestOrderId = order.id; $('#paymentOrderId').value = order.id; showResult('#orderResult', `Order created: ${order.id}\nTotal: $${order.totalAmountUsd}`); 
  } catch (error) { showResult('#orderResult', error.message, true); }
}

async function startPayment() {
  const orderId = $('#paymentOrderId').value;
  if (!orderId) return showResult('#paymentResult', 'Enter an order ID first.', true);
  try { const result = await api(`/api/v1/payments/orders/${orderId}`, { method: 'POST', body: JSON.stringify({ method: $('#paymentMethod').value, phone: $('#paymentPhone').value }) }); showResult('#paymentResult', result.payment.checkoutUrl ? `Checkout URL: ${result.payment.checkoutUrl}` : result.instructions || result); } catch (error) { showResult('#paymentResult', error.message, true); }
}

async function loadAdmin() {
  try {
    const dashboard = await api('/api/v1/admin/dashboard', { headers: { 'x-user-role': 'ADMIN' } });
    $('#metrics').innerHTML = `<div class="metric"><span>Orders</span><strong>${dashboard.orders}</strong></div><div class="metric"><span>Merchants</span><strong>${dashboard.activeMerchants}</strong></div><div class="metric"><span>Payments waiting</span><strong>${dashboard.pendingPayments}</strong></div>`;
    const orders = await api('/api/v1/admin/orders', { headers: { 'x-user-role': 'ADMIN' } });
    $('#orders').innerHTML = orders.length ? `<table><thead><tr><th>Order</th><th>Merchant</th><th>Status</th><th>Total</th><th>Delivery</th></tr></thead><tbody>${orders.map((order) => `<tr><td>${order.id.slice(0, 8)}...</td><td>${order.merchant.name}</td><td>${order.status}</td><td>$${order.totalAmountUsd}</td><td>${order.deliveryAssignment?.status || 'UNASSIGNED'}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">No orders yet.</p>';
  } catch (error) { showResult('#deliveryResult', error.message, true); }
}

async function assignDelivery() {
  try { const result = await api(`/api/v1/delivery/orders/${$('#deliveryOrderId').value}/assign`, { method: 'POST', headers: { 'x-user-role': 'ADMIN' }, body: JSON.stringify({ driver_id: $('#driverId').value }) }); showResult('#deliveryResult', result); } catch (error) { showResult('#deliveryResult', error.message, true); }
}

async function sendWebhook() {
  try { const result = await api('/api/v1/whatsapp/webhook', { method: 'POST', body: JSON.stringify({ entry: [{ changes: [{ value: { contacts: [{ wa_id: $('#waFrom').value, profile: { name: 'UI tester' } }], messages: [{ from: $('#waFrom').value, type: 'text', text: { body: $('#waText').value } }] } }] }] }) }); showResult('#webhookResult', `Webhook acknowledged (${result || '200 OK'})`); } catch (error) { showResult('#webhookResult', error.message, true); }
}

document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => { document.querySelectorAll('.tab, .panel').forEach((item) => item.classList.remove('active')); tab.classList.add('active'); $(`#${tab.dataset.panel}`).classList.add('active'); if (tab.dataset.panel === 'admin') loadAdmin(); }));
$('#merchantSelect').addEventListener('change', loadProducts); $('#refreshMerchants').addEventListener('click', loadMerchants); $('#placeOrder').addEventListener('click', placeOrder); $('#startPayment').addEventListener('click', startPayment); $('#refreshAdmin').addEventListener('click', loadAdmin); $('#assignDelivery').addEventListener('click', assignDelivery); $('#sendWebhook').addEventListener('click', sendWebhook);
checkHealth(); loadMerchants();
