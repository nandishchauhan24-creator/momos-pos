// MOMO MTN. POS — final menu and order workflow.
// Firebase is used for live sharing between cashier and kitchen devices.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot, doc, updateDoc,
  query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

// Full-plate prices supplied by the stall. Half-plate prices are configured
// from the cashier screen and saved on that device until you decide the rates.
const MENU = [
  {id:"kurkure-paneer",category:"Kurkure",name:"Paneer Kurkure",fullPrice:100},
  {id:"kurkure-veg",category:"Kurkure",name:"Veg Kurkure",fullPrice:80},
  {id:"kurkure-cheese-corn",category:"Kurkure",name:"Cheese Corn Kurkure",fullPrice:110},
  {id:"steam-veg",category:"Steam",name:"Veg Steam",fullPrice:60},
  {id:"steam-paneer",category:"Steam",name:"Paneer Steam",fullPrice:70},
  {id:"steam-cheese-corn",category:"Steam",name:"Cheese Corn Steam",fullPrice:100},
  {id:"fry-veg",category:"Fry",name:"Veg Fry",fullPrice:70},
  {id:"fry-paneer",category:"Fry",name:"Paneer Fry",fullPrice:80},
  {id:"fry-cheese-corn",category:"Fry",name:"Cheese Corn Fry",fullPrice:100},
  {id:"afghani-paneer",category:"Gravy – Afghani Style",name:"Paneer Afghani Style",fullPrice:150},
  {id:"afghani-veg",category:"Gravy – Afghani Style",name:"Veg Afghani Style",fullPrice:140},
  {id:"afghani-cheese-corn",category:"Gravy – Afghani Style",name:"Cheese Corn Afghani Style",fullPrice:170},
  {id:"malai-veg",category:"Gravy – Malai",name:"Veg Malai Style",fullPrice:150},
  {id:"malai-paneer",category:"Gravy – Malai",name:"Paneer Malai Style",fullPrice:140},
  {id:"malai-cheese-corn",category:"Gravy – Malai",name:"Cheese Corn Malai Style",fullPrice:170},
  {id:"manchurian-veg",category:"Gravy – Manchurian Style",name:"Veg Manchurian Style",fullPrice:140},
  {id:"manchurian-paneer",category:"Gravy – Manchurian Style",name:"Paneer Manchurian Style",fullPrice:180},
  {id:"manchurian-cheese-corn",category:"Gravy – Manchurian Style",name:"Cheese Corn Manchurian Style",fullPrice:200},
  {id:"ragi-veg",category:"Ragi Style",name:"Veg Ragi Style",fullPrice:90},
  {id:"ragi-paneer",category:"Ragi Style",name:"Paneer Ragi Style",fullPrice:100},
  {id:"ragi-cheese-corn",category:"Ragi Style",name:"Cheese Corn Ragi Style",fullPrice:150}
];

const $ = id => document.getElementById(id);
let db=null, orders=[], cart={}, orderType="Dine in";
const HALF_PRICE_KEY="momo-mtn-half-prices-v1";
let halfPrices={};
try { halfPrices=JSON.parse(localStorage.getItem(HALF_PRICE_KEY)||"{}"); } catch { halfPrices={}; }

function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function money(n){return "₹"+Number(n).toFixed(2).replace(/\.00$/,"");}
function getPrice(item,size){return size==="Full"?item.fullPrice:(halfPrices[item.id]===""||halfPrices[item.id]===undefined?null:Number(halfPrices[item.id]));}
function setConnection(s,good=false){$("connection").textContent=s;$("connection").style.color=good?"#477b59":"#8a705a";}
function message(s,error=false){$("orderMessage").textContent=s;$("orderMessage").style.color=error?"#a33":"#3d8056";}
function renderMenu(){
  const categories=[...new Set(MENU.map(x=>x.category))];
  $("menuGrid").innerHTML=categories.map(category=>`<section class="menu-category"><h3 class="category-title">${escapeHtml(category)}</h3><div class="category-items">${MENU.filter(x=>x.category===category).map(item=>`
    <article class="menu-card"><h3>${escapeHtml(item.name)}</h3><div class="plate-options">
      <button class="plate" data-add="${item.id}" data-size="Half">HALF PLATE<strong>${getPrice(item,"Half")===null?"Set price":"Add · "+money(getPrice(item,"Half"))}</strong></button>
      <button class="plate" data-add="${item.id}" data-size="Full">FULL PLATE<strong>${money(item.fullPrice)}</strong></button>
    </div></article>`).join("")}</div></section>`).join("");
}
function renderHalfPriceSettings(){
  $("halfPriceGrid").innerHTML=MENU.map(item=>`<label class="half-price-row"><span>${escapeHtml(item.name)}</span><span class="half-price-input"><b>₹</b><input type="number" min="0" step="1" inputmode="numeric" placeholder="Not set" data-half-price="${item.id}" value="${halfPrices[item.id]??""}"></span></label>`).join("");
}
function renderCart(){
  const entries=Object.entries(cart);
  $("cartItems").innerHTML=entries.length?entries.map(([key,x])=>`<div class="cart-line"><div><strong>${escapeHtml(x.name)} · ${x.size} plate</strong><small>${x.unitPrice===null?"Half-plate price not set":money(x.unitPrice)+" each"} · Quantity: ${x.qty}</small></div><div class="qty-controls"><button data-change="${key}" data-delta="-1">−</button><b>${x.qty}</b><button data-change="${key}" data-delta="1">+</button></div></div>`).join(""):'<p class="empty-copy">Your order is waiting to be filled.</p>';
  const count=entries.reduce((n,[,x])=>n+x.qty,0);
  const missing=entries.some(([,x])=>x.unitPrice===null);
  const total=entries.reduce((n,[,x])=>n+(x.unitPrice===null?0:x.unitPrice*x.qty),0);
  $("itemCount").textContent=count;
  $("grandTotal").textContent=missing?"Set half price":"₹"+total.toFixed(2).replace(/\.00$/,"");
  $("priceNote").textContent=missing?"Enter the missing half-plate price in ‘Set half-plate prices’ before sending this order.":"All item prices included. No printing is enabled.";
  $("placeOrder").disabled=!entries.length||missing||!db;
}
function addItem(id,size){
  const item=MENU.find(x=>x.id===id);if(!item)return;
  const key=id+"_"+size,price=getPrice(item,size);
  if(size==="Half"&&price===null){$("halfPriceSettings").open=true;$("halfPriceGrid").querySelector(`[data-half-price="${id}"]`)?.focus();message("Set the half-plate price first, then add this item.",true);return;}
  if(!cart[key])cart[key]={id,name:item.name,size,qty:0,unitPrice:price};
  cart[key].qty++;renderCart();
}
function changeQty(key,delta){if(!cart[key])return;cart[key].qty+=delta;if(cart[key].qty<=0)delete cart[key];renderCart();}
function renderKitchen(){
  const groups={New:$("newOrders"),Preparing:$("preparingOrders"),Ready:$("readyOrders")};
  const counts={New:$("newCount"),Preparing:$("preparingCount"),Ready:$("readyCount")};
  Object.entries(groups).forEach(([status,el])=>{
    const list=orders.filter(o=>o.status===status);counts[status].textContent=list.length;el.innerHTML="";
    if(!list.length)el.innerHTML='<div class="empty-state">No orders here yet</div>';
    list.forEach(order=>{
      const card=document.createElement("article");card.className="order-card";
      const next=status==="New"?"Preparing":status==="Preparing"?"Ready":null;
      const time=order.createdAt?.toDate?order.createdAt.toDate().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"Just now";
      const total=(order.items||[]).reduce((n,i)=>n+(Number(i.unitPrice)||0)*i.qty,0);
      card.innerHTML=`<div class="order-top"><span>ORDER #${escapeHtml(order.orderNumber||"—")}</span><span>${status.toUpperCase()}</span></div><div class="order-meta">${escapeHtml(order.customerName||"Walk-in")} · ${escapeHtml(order.orderType||"")} · ${time}</div><ul>${(order.items||[]).map(i=>`<li>${escapeHtml(i.name)} — ${escapeHtml(i.size)} × ${i.qty}</li>`).join("")}</ul><div class="order-total">Total: ${money(total)}</div>${next?`<button class="status-button" data-status="${order.id}" data-next="${next}">Mark ${next}</button>`:'<div class="ready-note">Ready for collection</div>'}`;
      el.appendChild(card);
    });
  });
}
async function placeOrder(){
  const items=Object.values(cart);if(!items.length)return;
  if(!db){message("Firebase is not connected. Follow the setup guide in README.",true);return;}
  if(items.some(i=>i.unitPrice===null)){message("Set all half-plate prices before sending.",true);return;}
  $("placeOrder").disabled=true;
  try{
    const orderNumber=String(Date.now()).slice(-6);
    const total=items.reduce((n,i)=>n+i.unitPrice*i.qty,0);
    await addDoc(collection(db,"orders"),{orderNumber,customerName:$("customerName").value.trim()||"Walk-in",orderType,items,total,status:"New",createdAt:serverTimestamp()});
    cart={};$("customerName").value="";renderCart();message(`Order #${orderNumber} sent to kitchen.`);
  }catch(e){console.error(e);message("Could not send order. Check Firebase setup and internet.",true);}
  finally{renderCart();}
}
async function changeStatus(id,status){try{await updateDoc(doc(db,"orders",id),{status});}catch(e){console.error(e);alert("Status update failed. Check internet and Firebase rules.");}}
function startFirebase(){
  if(firebaseConfig.apiKey.startsWith("PASTE_")||firebaseConfig.projectId.startsWith("PASTE_")){setConnection("Firebase setup required");renderCart();return;}
  try{
    db=getFirestore(initializeApp(firebaseConfig));setConnection("Connecting to live orders…");renderCart();
    onSnapshot(query(collection(db,"orders"),orderBy("createdAt","desc")),snap=>{orders=snap.docs.map(d=>({id:d.id,...d.data()}));setConnection("Live · Synced",true);renderKitchen();renderCart();},e=>{console.error(e);setConnection("Database connection error");});
  }catch(e){console.error(e);setConnection("Firebase setup error");}
}

document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b===btn));
  $("cashierView").classList.toggle("hidden",btn.dataset.view!=="cashier");$("kitchenView").classList.toggle("hidden",btn.dataset.view!=="kitchen");
}));
document.querySelectorAll("[data-order-type]").forEach(btn=>btn.addEventListener("click",()=>{orderType=btn.dataset.orderType;document.querySelectorAll("[data-order-type]").forEach(b=>b.classList.toggle("selected",b===btn));}));
$("menuGrid").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b)addItem(b.dataset.add,b.dataset.size);});
$("cartItems").addEventListener("click",e=>{const b=e.target.closest("[data-change]");if(b)changeQty(b.dataset.change,Number(b.dataset.delta));});
$("halfPriceGrid").addEventListener("change",e=>{const input=e.target.closest("[data-half-price]");if(!input)return;const value=input.value.trim();if(value==="")delete halfPrices[input.dataset.halfPrice];else halfPrices[input.dataset.halfPrice]=Number(value);localStorage.setItem(HALF_PRICE_KEY,JSON.stringify(halfPrices));renderMenu();Object.entries(cart).forEach(([key,item])=>{if(item.size==="Half")item.unitPrice=getPrice(MENU.find(m=>m.id===item.id),"Half");});renderCart();});
$("clearCart").addEventListener("click",()=>{cart={};renderCart();message("");});$("placeOrder").addEventListener("click",placeOrder);
$("kitchenView").addEventListener("click",e=>{const b=e.target.closest("[data-status]");if(b)changeStatus(b.dataset.status,b.dataset.next);});
renderMenu();renderHalfPriceSettings();renderCart();renderKitchen();startFirebase();
