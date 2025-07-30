const SIMBOLO = '$';
const PRODUCTOS = {
  hamburguesas: [
    {id:'ham_clasica', nombre:'Yankee Doble', precio:7900, imagen:'yankee.webp'},
    {id:'ham_doble', nombre:'Moscú Simple', precio:7400, imagen:'https://images.unsplash.com/photo-1571091718767-4594d5b7b5e'},
    {id:'ham_bacon', nombre:'American Simple', precio:7400, imagen:'https://images.unsplash.com/photo-1598182198871-d3f4a6321f1b'},
    {id:'ham_cheddar', nombre:'Clasica Doble', precio:7750, imagen:'https://images.unsplash.com/photo-1553979459-d2229a8b6f4d'},
    {id:'ham_veggie', nombre:'Blue Simple', precio:7400, imagen:'https://images.unsplash.com/photo-1521305916504-4a641f2d2d66'}
  ],
  bebidas: [
    {id:'beb_coca', nombre:'Coca-Cola 500ml', precio:900, imagen:'https://images.unsplash.com/photo-1554866585-cd94860890b7'},
    {id:'beb_sprite', nombre:'Sprite 500ml', precio:900, imagen:'https://images.unsplash.com/photo-1624514179363-08a8b9f8b8c0'},
    {id:'beb_agua', nombre:'Agua 500ml', precio:700, imagen:'https://images.unsplash.com/photo-1603798129866-3b07d7f8f4b'},
    {id:'beb_cerveza', nombre:'Cerveza Lata', precio:1500, imagen:'https://images.unsplash.com/photo-1608270586620-2485b8e1e2a0'}
  ],
  complementos: [
    {id:'comp_papas', nombre:'Papas Fritas', precio:1500, imagen:'https://images.unsplash.com/photo-1576107232684-3a2e68838495'},
    {id:'comp_pollo', nombre:'Baldo de Pollo', precio:3500, imagen:'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58'},
    {id:'comp_aros', nombre:'Aros de Cebolla', precio:1200, imagen:'https://images.unsplash.com/photo-1619681957562-8a0c4453b80b'},
    {id:'comp_ensalada', nombre:'Ensalada', precio:1000, imagen:'https://images.unsplash.com/photo-1512621776951-a57141f9eefd'}
  ]
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const formatPrecio = n => SIMBOLO + new Intl.NumberFormat('es-AR').format(n);

const LS_KEYS = {
  ULTIMO_PEDIDO: 'pos_ultimo_pedido_num',
  ULTIMO_DIA: 'pos_ultimo_pedido_dia',
  HISTORIAL: 'pos_historial_pedidos'
};

function hoyISO(){ return new Date().toISOString().slice(0,10); }
function getUltimoNumero(){
  const diaLS = localStorage.getItem(LS_KEYS.ULTIMO_DIA);
  const hoy = hoyISO();
  if(diaLS !== hoy){
    localStorage.setItem(LS_KEYS.ULTIMO_DIA, hoy);
    localStorage.setItem(LS_KEYS.ULTIMO_PEDIDO, '0');
    localStorage.setItem(LS_KEYS.HISTORIAL, '[]');
    return 0;
  }
  return parseInt(localStorage.getItem(LS_KEYS.ULTIMO_PEDIDO) || '0',10);
}
function nextNumeroPedido(){
  const num = getUltimoNumero() + 1;
  localStorage.setItem(LS_KEYS.ULTIMO_PEDIDO, String(num));
  localStorage.setItem(LS_KEYS.ULTIMO_DIA, hoyISO());
  return num;
}
function resetContadorPedidos(){
  localStorage.setItem(LS_KEYS.ULTIMO_DIA, hoyISO());
  localStorage.setItem(LS_KEYS.ULTIMO_PEDIDO, '0');
  localStorage.setItem(LS_KEYS.HISTORIAL, '[]');
  renderHistorial();
}
function loadHistorial(){ return JSON.parse(localStorage.getItem(LS_KEYS.HISTORIAL) || '[]'); }
function saveHistorial(arr){ localStorage.setItem(LS_KEYS.HISTORIAL, JSON.stringify(arr)); }

let categoriaActual = 'hamburguesas';
const carrito = new Map();
let tipoEntrega = 'retira'; // 'retira' o 'envio'
let pedidosActivos = [];

function limpiarCamposCliente() {
  $('#cliente-nombre').value = '';
  $('#cliente-telefono').value = '';
  $('#cliente-direccion').value = '';
  $('#delivery-asignado').value = '';
  $('#metodo-pago').value = 'efectivo';
  $('#observaciones').value = '';
  $('#btn-retira').click(); // Resetear a retira en local
  $('#error-mensaje').style.display = 'none';
  $('#error-mensaje').textContent = '';
}

function renderMenu(){
  const cont = $('#contenedor-productos');
  cont.innerHTML = '';
  const lista = PRODUCTOS[categoriaActual] || [];
  lista.forEach(p=>{
    const btn = document.createElement('button');
    btn.className = 'producto-btn';
    btn.dataset.id = p.id;
    btn.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" class="prod-img">
      <span class="prod-nombre">${p.nombre}</span>
      <span class="prod-precio">${formatPrecio(p.precio)}</span>`;
    btn.addEventListener('click', ()=>agregarAlCarrito(p));
    cont.appendChild(btn);
  });
}

function agregarAlCarrito(prod){
  const item = carrito.get(prod.id) || {producto:prod, cant:0};
  item.cant++;
  carrito.set(prod.id, item);
  renderCarrito();
}
function cambiarCantidad(prodId, delta){
  const item = carrito.get(prodId);
  if(!item) return;
  item.cant += delta;
  if(item.cant<=0) carrito.delete(prodId);
  renderCarrito();
}
function borrarItem(prodId){
  carrito.delete(prodId);
  renderCarrito();
}
function totalCarrito(){
  let t = 0;
  carrito.forEach(({producto, cant})=> t += producto.precio*cant );
  return t;
}
function renderCarrito(){
  const wrap = $('#carrito-items');
  wrap.innerHTML = '';
  carrito.forEach(({producto, cant})=>{
    const sub = producto.precio*cant;
    const row = document.createElement('div');
    row.className = 'carrito-item';
    row.innerHTML = `
      <div class="carrito-item-nombre">${producto.nombre}</div>
      <div class="carrito-item-cant">
        <button data-action="menos">-</button>
        <span>${cant}</span>
        <button data-action="mas">+</button>
      </div>
      <div class="carrito-item-subtotal">${formatPrecio(sub)}</div>
      <div class="carrito-item-borrar"><button data-action="borrar">×</button></div>`;
    row.querySelector('[data-action="menos"]').onclick=()=>cambiarCantidad(producto.id,-1);
    row.querySelector('[data-action="mas"]').onclick=()=>cambiarCantidad(producto.id,1);
    row.querySelector('[data-action="borrar"]').onclick=()=>borrarItem(producto.id);
    wrap.appendChild(row);
  });
  $('#carrito-total').textContent = `Total: ${formatPrecio(totalCarrito())}`;
  $('#btn-confirmar').disabled = carrito.size===0;
}

function confirmarPedido(){
  if(carrito.size===0) {
    $('#error-mensaje').style.display = 'block';
    $('#error-mensaje').textContent = 'El carrito está vacío.';
    return;
  }
  const cliente = $('#cliente-nombre').value.trim() || 'Sin nombre';
  const telefono = $('#cliente-telefono').value.trim();
  const direccion = tipoEntrega === 'envio' ? $('#cliente-direccion').value.trim() : 'Retira en local';
  const delivery = tipoEntrega === 'envio' ? $('#delivery-asignado').value : 'N/A';
  const metodoPago = $('#metodo-pago').value || 'efectivo';
  const observaciones = $('#observaciones').value.trim() || 'Sin observaciones';

  // Validaciones
  $('#error-mensaje').style.display = 'none';
  $('#error-mensaje').textContent = '';
  if (!telefono) {
    $('#error-mensaje').style.display = 'block';
    $('#error-mensaje').textContent = 'El número de teléfono es obligatorio.';
    return;
  }
  if (tipoEntrega === 'envio' && !direccion) {
    $('#error-mensaje').style.display = 'block';
    $('#error-mensaje').textContent = 'La dirección es obligatoria para envíos.';
    return;
  }
  if (tipoEntrega === 'envio' && !delivery) {
    $('#error-mensaje').style.display = 'block';
    $('#error-mensaje').textContent = 'Debe asignar un delivery para envíos.';
    return;
  }

  const numero = nextNumeroPedido();
  const items = [];
  carrito.forEach(({producto,cant})=> items.push({producto:producto.nombre, cantidad:cant, precio:producto.precio}) );
  const total = totalCarrito();
  const fecha = new Date().toISOString();
  
  const pedido = {
    numero,
    cliente,
    telefono,
    direccion,
    delivery,
    metodoPago,
    observaciones,
    items,
    total,
    fecha,
    tipo: tipoEntrega,
    estado: 'pendiente',
    horaInicio: new Date().getTime()
  };
  
  // Agregar a pedidos activos
  pedidosActivos.push(pedido);
  
  // Guardar en historial
  const hist = loadHistorial();
  hist.push(pedido);
  saveHistorial(hist);
  
  renderPedidosActivos();
  renderHistorial();
  
  // Generar ticket y comanda
  buildTicketHTML(pedido);
  buildComandaHTML(pedido);
  
  // Imprimir
  window.print();
  
  // Limpiar carrito y campos
  carrito.clear();
  renderCarrito();
  limpiarCamposCliente();
}

function buildTicketHTML({numero, cliente, telefono, direccion, delivery, metodoPago, observaciones, items, total, fecha, tipo}){
  const cont = $('#ticket-impresion');
  const fechaLocal = new Date(fecha).toLocaleString('es-AR');
  let html = '';
  html += '<h2>Mas Que Burgers</h2>';
  html += `<div>Pedido #${numero}</div>`;
  html += `<div>${fechaLocal}</div>`;
  html += `<div>Cliente: ${cliente}</div>`;
  html += `<div>Tel: ${telefono}</div>`;
  html += `<div>Tipo: ${tipo === 'envio' ? 'Envío' : 'Retira en local'}</div>`;
  if(tipo === 'envio') html += `<div>Dirección: ${direccion}</div>`;
  if(tipo === 'envio') html += `<div>Delivery: ${delivery}</div>`;
  html += `<div>Método de Pago: ${typeof metodoPago === 'string' ? metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1) : 'No especificado'}</div>`;
  if(observaciones !== 'Sin observaciones') html += `<div>Observaciones: ${observaciones}</div>`;
  html += '<hr />';
  html += '<ul>';
  for(const it of items){
    const sub = it.precio * it.cantidad;
    html += `<li><span>${it.cantidad} x ${it.producto}</span><span>${formatPrecio(sub)}</span></li>`;
  }
  html += '</ul>';
  html += `<div class="tot"><span>Total</span><span>${formatPrecio(total)}</span></div>`;
  cont.innerHTML = html;
}

function buildComandaHTML({numero, items, observaciones, tipo}){
  const cont = $('#comanda-impresion');
  let html = `<h2>Comanda #${numero}</h2>`;
  html += `<div>Tipo: ${tipo === 'envio' ? 'Envío' : 'Retira en local'}</div>`;
  html += '<ul>';
  for(const it of items){
    html += `<li>${it.cantidad} x ${it.producto}</li>`;
  }
  html += '</ul>';
  if(observaciones !== 'Sin observaciones') html += `<div>Observaciones: ${observaciones}</div>`;
  cont.innerHTML = html;
}

function renderPedidosActivos() {
  const container = $('#pedidos-container');
  container.innerHTML = '';
  
  // Ordenar por tiempo (más antiguos primero)
  const pedidosOrdenados = [...pedidosActivos].sort((a, b) => a.horaInicio - b.horaInicio);
  
  pedidosOrdenados.forEach(pedido => {
    const tiempoTranscurrido = Math.floor((new Date().getTime() - pedido.horaInicio) / 60000);
    const pedidoEl = document.createElement('div');
    pedidoEl.className = 'pedido-item';
    
    pedidoEl.innerHTML = `
      <h4>Pedido #${pedido.numero}</h4>
      <div>${pedido.cliente} (${pedido.telefono})</div>
      <div>${pedido.tipo === 'envio' ? '🚚 ' + pedido.direccion + ' (Delivery: ' + pedido.delivery + ')' : '🏠 Retira en local'}</div>
      <div>Pago: ${typeof pedido.metodoPago === 'string' ? pedido.metodoPago.charAt(0).toUpperCase() + pedido.metodoPago.slice(1) : 'No especificado'}</div>
      ${pedido.observaciones !== 'Sin observaciones' ? `<div>Obs: ${pedido.observaciones}</div>` : ''}
      <div class="tiempo">${tiempoTranscurrido} min</div>
      <div class="estado-pedido ${pedido.estado}">${pedido.estado.toUpperCase()}</div>
      <div>Total: ${formatPrecio(pedido.total)}</div>
      ${pedido.estado !== 'entregado' ? `
      <div class="acciones-pedido">
        <button data-id="${pedido.numero}" data-accion="preparar">Preparar</button>
        <button data-id="${pedido.numero}" data-accion="completar">Completar</button>
      </div>
      ` : ''}
    `;
    
    container.appendChild(pedidoEl);
  });
  
  // Agregar event listeners a los botones
  $$('[data-accion="preparar"]').forEach(btn => {
    btn.onclick = () => cambiarEstadoPedido(parseInt(btn.dataset.id), 'preparando');
  });
  
  $$('[data-accion="completar"]').forEach(btn => {
    btn.onclick = () => cambiarEstadoPedido(parseInt(btn.dataset.id), 'entregado');
  });
}

function cambiarEstadoPedido(numeroPedido, nuevoEstado) {
  const pedido = pedidosActivos.find(p => p.numero === numeroPedido);
  if(pedido) {
    pedido.estado = nuevoEstado;
    if(nuevoEstado === 'entregado') {
      // Mover a historial después de 5 segundos
      setTimeout(() => {
        pedidosActivos = pedidosActivos.filter(p => p.numero !== numeroPedido);
        renderPedidosActivos();
      }, 5000);
    }
    renderPedidosActivos();
    
    // Actualizar en el historial
    const hist = loadHistorial();
    const pedidoHist = hist.find(p => p.numero === numeroPedido);
    if(pedidoHist) pedidoHist.estado = nuevoEstado;
    saveHistorial(hist);
  }
}

function renderHistorial(){
  const lista = $('#historial-lista');
  lista.innerHTML = '';
  loadHistorial().slice().reverse().forEach(p=>{
    const fechaLocal = new Date(p.fecha).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
    const metodoPago = typeof p.metodoPago === 'string' ? p.metodoPago.charAt(0).toUpperCase() + p.metodoPago.slice(1) : 'No especificado';
    const li = document.createElement('li');
    li.textContent = `#${String(p.numero).padStart(3,'0')} - ${formatPrecio(p.total)} - ${p.cliente} (${p.telefono}) - ${p.tipo === 'envio' ? '🚚 (' + p.delivery + ')' : '🏠'} - ${metodoPago} - ${fechaLocal}`;
    if(p.observaciones !== 'Sin observaciones') li.textContent += ` - Obs: ${p.observaciones}`;
    lista.appendChild(li);
  });
}

function buscarClientePorTelefono(telefono) {
  if (!telefono) return null;
  
  const historial = loadHistorial();
  // Buscar en orden inverso (del más reciente al más antiguo)
  for (let i = historial.length - 1; i >= 0; i--) {
    if (historial[i].telefono === telefono) {
      return {
        nombre: historial[i].cliente,
        direccion: historial[i].direccion || '',
        delivery: historial[i].delivery || ''
      };
    }
  }
  return null;
}

function renderCierreDia() {
  const historial = loadHistorial();
  const hoy = hoyISO();
  const pedidosHoy = historial.filter(p => p.fecha.startsWith(hoy));
  
  // Calcular totales
  const totalPedidos = pedidosHoy.length;
  const totalVentas = pedidosHoy.reduce((sum, p) => sum + p.total, 0);
  const porMetodoPago = {};
  pedidosHoy.forEach(p => {
    const metodo = typeof p.metodoPago === 'string' ? p.metodoPago : 'no_especificado';
    porMetodoPago[metodo] = (porMetodoPago[metodo] || 0) + p.total;
  });
  
  // Resumen por delivery
  const porDelivery = {};
  pedidosHoy.forEach(p => {
    if(p.tipo === 'envio') {
      porDelivery[p.delivery] = (porDelivery[p.delivery] || 0) + 1;
    }
  });
  
  // Detalles por delivery
  const pedidosEnvio = pedidosHoy.filter(p => p.tipo === 'envio');
  const porDeliveryDetalles = {};
  pedidosEnvio.forEach(p => {
    if (!porDeliveryDetalles[p.delivery]) porDeliveryDetalles[p.delivery] = [];
    porDeliveryDetalles[p.delivery].push(p);
  });

  let html = `
    <p><strong>Total Pedidos:</strong> ${totalPedidos}</p>
    <p><strong>Total Ventas:</strong> ${formatPrecio(totalVentas)}</p>
    <h3>Total por Método de Pago</h3>
    <table>
      <tr><th>Método</th><th>Total</th></tr>
      ${Object.entries(porMetodoPago).map(([metodo, total]) => `
        <tr><td>${metodo === 'no_especificado' ? 'No especificado' : metodo.charAt(0).toUpperCase() + metodo.slice(1)}</td><td>${formatPrecio(total)}</td></tr>
      `).join('')}
    </table>
    <h3>Pedidos por Delivery</h3>
    <table>
      <tr><th>Delivery</th><th>Pedidos</th></tr>
      ${Object.entries(porDelivery).map(([delivery, count]) => `
        <tr><td>${delivery}</td><td>${count}</td></tr>
      `).join('')}
      ${Object.keys(porDelivery).length === 0 ? '<tr><td colspan="2">Sin envíos</td></tr>' : ''}
    </table>
    <h3>Detalles de Pedidos por Delivery</h3>
    ${Object.entries(porDeliveryDetalles).map(([delivery, pedidos]) => `
      <h4>${delivery}</h4>
      <ul>
        ${pedidos.map(p => {
          const items = p.items.map(it => `${it.cantidad} x ${it.producto}`).join(', ');
          return `<li>Pedido #${p.numero} - ${p.direccion} - ${items} - ${formatPrecio(p.total)}</li>`;
        }).join('')}
      </ul>
    `).join('')}
    ${Object.keys(porDeliveryDetalles).length === 0 ? '<p>No hay pedidos con envío.</p>' : ''}
  `;
  
  $('#cierre-contenido').innerHTML = html;
  $('#cierre-dia-container').style.display = 'block';
}

function initTabs(){
  $$('.tab-btn').forEach(btn=>{
    btn.onclick=()=>{
      $$('.tab-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      categoriaActual = btn.dataset.cat;
      renderMenu();
    };
  });
}

function toggleTema(){
  document.body.classList.toggle('tema-claro');
}
const estiloClaro = document.createElement('style');
estiloClaro.textContent = `
  body.tema-claro { --clr-bg:#f9fafb; --clr-bg-2:#ffffff; --clr-text:#111827; --clr-text-dim:#4b5563; }
  body.tema-claro header{ background:var(--clr-bg-2); }
  body.tema-claro #panel-menu{ border-right:1px solid #e5e7eb; }
  body.tema-claro #panel-carrito{ background:var(--clr-bg-2); }
  body.tema-claro .producto-btn{ background:var(--clr-bg-2); color:var(--clr-text); }
  body.tema-claro .tabs button{ background:var(--clr-bg-2); color:var(--clr-text); }
  body.tema-claro .tabs button.active{ background:var(--clr-accent); color:#fff; }
  body.tema-claro #cierre-dia{ background:var(--clr-bg-2); color:var(--clr-text); }
  body.tema-claro #cierre-dia table{ border-color:#e5e7eb; }
`;
document.head.appendChild(estiloClaro);

document.addEventListener('DOMContentLoaded', ()=>{
  initTabs();
  renderMenu();
  renderCarrito();
  renderHistorial();
  
  // Eventos para tipo de entrega
  $('#btn-retira').onclick = () => {
    tipoEntrega = 'retira';
    $('#btn-retira').classList.add('active');
    $('#btn-envio').classList.remove('active');
    $('#direccion-field').style.display = 'none';
    $('#delivery-field').style.display = 'none';
    $('#error-mensaje').style.display = 'none';
  };
  
  $('#btn-envio').onclick = () => {
    tipoEntrega = 'envio';
    $('#btn-envio').classList.add('active');
    $('#btn-retira').classList.remove('active');
    $('#direccion-field').style.display = 'block';
    $('#delivery-field').style.display = 'block';
    $('#error-mensaje').style.display = 'none';
  };
  
  // Cargar pedidos activos al iniciar
  const historial = loadHistorial();
  const hoy = hoyISO();
  pedidosActivos = historial.filter(p => 
    p.fecha.startsWith(hoy) && p.estado !== 'entregado'
  );
  
  // Si hay pedidos activos, establecer sus estados
  pedidosActivos.forEach(p => {
    if(!p.estado) p.estado = 'pendiente';
    if(!p.horaInicio) p.horaInicio = new Date(p.fecha).getTime();
  });
  
  renderPedidosActivos();
  
  // Evento para confirmar pedido
  $('#btn-confirmar').onclick = confirmarPedido;
  
  // Evento para reset contador
  $('#btn-reset-contador').onclick = () => {
    if(confirm('¿Reiniciar numeración y borrar pedidos del día?')) {
      resetContadorPedidos();
      pedidosActivos = [];
      renderPedidosActivos();
    }
  };
  
  // Evento para modo oscuro
  $('#btn-modo-oscuro').onclick = toggleTema;
  
  // Evento para cierre del día
  $('#btn-cierre-dia').onclick = renderCierreDia;
  $('#btn-cerrar-cierre').onclick = () => {
    $('#cierre-dia-container').style.display = 'none';
  };
  
  // Evento para autocompletar nombre, dirección y delivery cuando se ingresa teléfono
  $('#cliente-telefono').addEventListener('input', function() {
    const telefono = this.value.trim();
    if (telefono) {
      const datosCliente = buscarClientePorTelefono(telefono);
      if (datosCliente) {
        $('#cliente-nombre').value = datosCliente.nombre;
        if(tipoEntrega === 'envio') {
          $('#cliente-direccion').value = datosCliente.direccion;
          $('#delivery-asignado').value = datosCliente.delivery;
        }
      }
    }
  });
  
  // Actualizar cada minuto los tiempos
  setInterval(() => {
    if(pedidosActivos.length > 0) {
      renderPedidosActivos();
    }
  }, 60000);
});