const $=id=>document.getElementById(id);
const today=new Date(), iso=d=>d.toISOString().slice(0,10);
$("issueDate").value=iso(today); const due=new Date(today); due.setDate(due.getDate()+15); $("dueDate").value=iso(due);

let items=[
 {description:"Brand identity design",qty:1,rate:45000},
 {description:"Social media creative suite",qty:1,rate:18000},
 {description:"Art direction & consultation",qty:4,rate:2500}
];
let zoom=1;

function money(n){return $("currency").value+" "+Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
function fmtDate(v){if(!v)return "—";return new Date(v+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}

function renderEditor(){
 $("itemsEditor").innerHTML=items.map((x,i)=>`
 <div class="item-row">
  <label>Description<input data-i="${i}" data-k="description" value="${escapeHtml(x.description)}"></label>
  <label>Qty<input type="number" min="0" step="0.01" data-i="${i}" data-k="qty" value="${x.qty}"></label>
  <label>Rate<input type="number" min="0" step="0.01" data-i="${i}" data-k="rate" value="${x.rate}"></label>
  <button class="remove" data-remove="${i}" title="Remove">×</button>
 </div>`).join("");
 document.querySelectorAll("#itemsEditor input").forEach(el=>el.addEventListener("input",e=>{
   const i=+e.target.dataset.i,k=e.target.dataset.k;items[i][k]=k==="description"?e.target.value:Number(e.target.value);update();
 }));
 document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{if(items.length>1){items.splice(+b.dataset.remove,1);renderEditor();update()}});
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

function update(){
 const business=$("businessName").value.trim()||"Your Business";
 $("previewBusiness").textContent=business;$("previewBusinessInitial").textContent=business[0]?.toUpperCase()||"A";
 $("previewBusinessDetails").textContent=$("businessDetails").value;
 $("previewNumber").textContent=$("invoiceNumber").value||"INV-0001";
 $("previewIssue").textContent=fmtDate($("issueDate").value);$("previewDue").textContent=fmtDate($("dueDate").value);
 $("previewClient").textContent=$("clientName").value||"Client";
 $("previewClientEmail").textContent=$("clientEmail").value;
 $("previewClientAddress").textContent=$("clientAddress").value;
 $("previewNotes").textContent=$("notes").value;
 $("previewContact").textContent=$("businessDetails").value.split("\n")[1]||"";
 const sub=items.reduce((a,x)=>a+(Number(x.qty)||0)*(Number(x.rate)||0),0), disc=Number($("discount").value)||0, taxable=Math.max(0,sub-disc), tax=taxable*(Number($("taxRate").value)||0)/100,total=taxable+tax;
 $("previewSubtotal").textContent=money(sub);$("previewDiscount").textContent=disc? "− "+money(disc):money(0);
 $("previewTax").textContent=money(tax);$("previewTotal").textContent=money(total);
 $("previewItems").innerHTML=items.map(x=>`<tr><td>${escapeHtml(x.description||"Item")}</td><td>${x.qty}</td><td>${money(x.rate)}</td><td class="right">${money((Number(x.qty)||0)*(Number(x.rate)||0))}</td></tr>`).join("");
 document.documentElement.style.setProperty("--accent",$("accent").value);
 $("accentHex").textContent=$("accent").value.toUpperCase();
 localStorage.setItem("luxeInvoice",JSON.stringify({fields:Object.fromEntries(["businessName","invoiceNumber","businessDetails","clientName","clientEmail","clientAddress","issueDate","dueDate","currency","taxRate","discount","notes","accent"].map(id=>[id,$(id).value])),items}));
}
function load(){
 try{const s=JSON.parse(localStorage.getItem("luxeInvoice"));if(!s)return;
  Object.entries(s.fields||{}).forEach(([id,v])=>{if($(id))$(id).value=v}); if(Array.isArray(s.items))items=s.items;
 }catch(e){} renderEditor();update();
}
document.querySelectorAll("input,textarea,select").forEach(el=>el.addEventListener("input",update));
$("addItem").onclick=()=>{items.push({description:"New service",qty:1,rate:0});renderEditor();update()};
$("newInvoice").onclick=()=>{if(confirm("Start a fresh invoice?")){localStorage.removeItem("luxeInvoice");location.reload()}};
$("zoomIn").onclick=()=>{zoom=Math.min(1.25,zoom+.05);applyZoom()};$("zoomOut").onclick=()=>{zoom=Math.max(.65,zoom-.05);applyZoom()};
function applyZoom(){$("invoice").style.transform=`scale(${zoom})`;$("zoomValue").textContent=Math.round(zoom*100)+"%"}
async function downloadPNG(){
 const canvas=await html2canvas($("invoice"),{scale:2,backgroundColor:"#ffffff",useCORS:true});
 const a=document.createElement("a");a.download=($("invoiceNumber").value||"invoice")+".png";a.href=canvas.toDataURL("image/png");a.click();toast("PNG downloaded");
}
async function downloadPDF(){
 const canvas=await html2canvas($("invoice"),{scale:2,backgroundColor:"#ffffff",useCORS:true});
 const {jsPDF}=window.jspdf;const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
 const img=canvas.toDataURL("image/jpeg",.96), w=210,h=297;pdf.addImage(img,"JPEG",0,0,w,h,undefined,"FAST");
 pdf.save(($("invoiceNumber").value||"invoice")+".pdf");toast("PDF downloaded");
}
$("downloadPng").onclick=downloadPNG;$("downloadPdf").onclick=downloadPDF;$("downloadPdfTop").onclick=downloadPDF;
function toast(t){const x=$("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}
load();