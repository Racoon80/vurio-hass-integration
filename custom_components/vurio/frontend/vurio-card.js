var B=globalThis,q=B.ShadowRoot&&(B.ShadyCSS===void 0||B.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,tt=Symbol(),$t=new WeakMap,L=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==tt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(q&&t===void 0){let i=e!==void 0&&e.length===1;i&&(t=$t.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&$t.set(e,t))}return t}toString(){return this.cssText}},xt=o=>new L(typeof o=="string"?o:o+"",void 0,tt),K=(o,...t)=>{let e=o.length===1?o[0]:t.reduce((i,s,r)=>i+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+o[r+1],o[0]);return new L(e,o,tt)},wt=(o,t)=>{if(q)o.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let i=document.createElement("style"),s=B.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=e.cssText,o.appendChild(i)}},et=q?o=>o:o=>o instanceof CSSStyleSheet?(t=>{let e="";for(let i of t.cssRules)e+=i.cssText;return xt(e)})(o):o;var{is:Zt,defineProperty:te,getOwnPropertyDescriptor:ee,getOwnPropertyNames:ie,getOwnPropertySymbols:se,getPrototypeOf:re}=Object,F=globalThis,_t=F.trustedTypes,oe=_t?_t.emptyScript:"",ne=F.reactiveElementPolyfillSupport,H=(o,t)=>o,it={toAttribute(o,t){switch(t){case Boolean:o=o?oe:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,t){let e=o;switch(t){case Boolean:e=o!==null;break;case Number:e=o===null?null:Number(o);break;case Object:case Array:try{e=JSON.parse(o)}catch{e=null}}return e}},Et=(o,t)=>!Zt(o,t),St={attribute:!0,type:String,converter:it,reflect:!1,useDefault:!1,hasChanged:Et};Symbol.metadata??=Symbol("metadata"),F.litPropertyMetadata??=new WeakMap;var w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=St){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let i=Symbol(),s=this.getPropertyDescriptor(t,i,e);s!==void 0&&te(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){let{get:s,set:r}=ee(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:s,set(n){let a=s?.call(this);r?.call(this,n),this.requestUpdate(t,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??St}static _$Ei(){if(this.hasOwnProperty(H("elementProperties")))return;let t=re(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(H("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(H("properties"))){let e=this.properties,i=[...ie(e),...se(e)];for(let s of i)this.createProperty(s,e[s])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[i,s]of e)this.elementProperties.set(i,s)}this._$Eh=new Map;for(let[e,i]of this.elementProperties){let s=this._$Eu(e,i);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let i=new Set(t.flat(1/0).reverse());for(let s of i)e.unshift(et(s))}else t!==void 0&&e.push(et(t));return e}static _$Eu(t,e){let i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return wt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){let i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(s!==void 0&&i.reflect===!0){let r=(i.converter?.toAttribute!==void 0?i.converter:it).toAttribute(e,i.type);this._$Em=t,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){let i=this.constructor,s=i._$Eh.get(t);if(s!==void 0&&this._$Em!==s){let r=i.getPropertyOptions(s),n=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:it;this._$Em=s;let a=n.fromAttribute(e,r.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){if(t!==void 0){let n=this.constructor;if(s===!1&&(r=this[t]),i??=n.getPropertyOptions(t),!((i.hasChanged??Et)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,i))))return;this.C(t,e,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),r!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),s===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,r]of this._$Ep)this[s]=r;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[s,r]of i){let{wrapped:n}=r,a=this[s];n!==!0||this._$AL.has(s)||a===void 0||this.C(s,void 0,r,a)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(e)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[H("elementProperties")]=new Map,w[H("finalized")]=new Map,ne?.({ReactiveElement:w}),(F.reactiveElementVersions??=[]).push("2.1.2");var ct=globalThis,At=o=>o,J=ct.trustedTypes,Ct=J?J.createPolicy("lit-html",{createHTML:o=>o}):void 0,Ot="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,Ut="?"+S,ae=`<${Ut}>`,k=document,V=()=>k.createComment(""),I=o=>o===null||typeof o!="object"&&typeof o!="function",dt=Array.isArray,le=o=>dt(o)||typeof o?.[Symbol.iterator]=="function",st=`[ 	
\f\r]`,N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,kt=/-->/g,Pt=/>/g,A=RegExp(`>|${st}(?:([^\\s"'>=/]+)(${st}*=${st}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Mt=/'/g,Tt=/"/g,Dt=/^(?:script|style|textarea|title)$/i,ht=o=>(t,...e)=>({_$litType$:o,strings:t,values:e}),d=ht(1),pt=ht(2),be=ht(3),P=Symbol.for("lit-noChange"),f=Symbol.for("lit-nothing"),Rt=new WeakMap,C=k.createTreeWalker(k,129);function Lt(o,t){if(!dt(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ct!==void 0?Ct.createHTML(t):t}var ce=(o,t)=>{let e=o.length-1,i=[],s,r=t===2?"<svg>":t===3?"<math>":"",n=N;for(let a=0;a<e;a++){let l=o[a],p,g,h=-1,y=0;for(;y<l.length&&(n.lastIndex=y,g=n.exec(l),g!==null);)y=n.lastIndex,n===N?g[1]==="!--"?n=kt:g[1]!==void 0?n=Pt:g[2]!==void 0?(Dt.test(g[2])&&(s=RegExp("</"+g[2],"g")),n=A):g[3]!==void 0&&(n=A):n===A?g[0]===">"?(n=s??N,h=-1):g[1]===void 0?h=-2:(h=n.lastIndex-g[2].length,p=g[1],n=g[3]===void 0?A:g[3]==='"'?Tt:Mt):n===Tt||n===Mt?n=A:n===kt||n===Pt?n=N:(n=A,s=void 0);let b=n===A&&o[a+1].startsWith("/>")?" ":"";r+=n===N?l+ae:h>=0?(i.push(p),l.slice(0,h)+Ot+l.slice(h)+S+b):l+S+(h===-2?a:b)}return[Lt(o,r+(o[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]},z=class o{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,n=0,a=t.length-1,l=this.parts,[p,g]=ce(t,e);if(this.el=o.createElement(p,i),C.currentNode=this.el.content,e===2||e===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(s=C.nextNode())!==null&&l.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(let h of s.getAttributeNames())if(h.endsWith(Ot)){let y=g[n++],b=s.getAttribute(h).split(S),$=/([.?@])?(.*)/.exec(y);l.push({type:1,index:r,name:$[2],strings:b,ctor:$[1]==="."?ot:$[1]==="?"?nt:$[1]==="@"?at:R}),s.removeAttribute(h)}else h.startsWith(S)&&(l.push({type:6,index:r}),s.removeAttribute(h));if(Dt.test(s.tagName)){let h=s.textContent.split(S),y=h.length-1;if(y>0){s.textContent=J?J.emptyScript:"";for(let b=0;b<y;b++)s.append(h[b],V()),C.nextNode(),l.push({type:2,index:++r});s.append(h[y],V())}}}else if(s.nodeType===8)if(s.data===Ut)l.push({type:2,index:r});else{let h=-1;for(;(h=s.data.indexOf(S,h+1))!==-1;)l.push({type:7,index:r}),h+=S.length-1}r++}}static createElement(t,e){let i=k.createElement("template");return i.innerHTML=t,i}};function T(o,t,e=o,i){if(t===P)return t;let s=i!==void 0?e._$Co?.[i]:e._$Cl,r=I(t)?void 0:t._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),r===void 0?s=void 0:(s=new r(o),s._$AT(o,e,i)),i!==void 0?(e._$Co??=[])[i]=s:e._$Cl=s),s!==void 0&&(t=T(o,s._$AS(o,t.values),s,i)),t}var rt=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??k).importNode(e,!0);C.currentNode=s;let r=C.nextNode(),n=0,a=0,l=i[0];for(;l!==void 0;){if(n===l.index){let p;l.type===2?p=new j(r,r.nextSibling,this,t):l.type===1?p=new l.ctor(r,l.name,l.strings,this,t):l.type===6&&(p=new lt(r,this,t)),this._$AV.push(p),l=i[++a]}n!==l?.index&&(r=C.nextNode(),n++)}return C.currentNode=k,s}p(t){let e=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}},j=class o{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=f,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=T(this,t,e),I(t)?t===f||t==null||t===""?(this._$AH!==f&&this._$AR(),this._$AH=f):t!==this._$AH&&t!==P&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):le(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==f&&I(this._$AH)?this._$AA.nextSibling.data=t:this.T(k.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:i}=t,s=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=z.createElement(Lt(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{let r=new rt(s,this),n=r.u(this.options);r.p(e),this.T(n),this._$AH=r}}_$AC(t){let e=Rt.get(t.strings);return e===void 0&&Rt.set(t.strings,e=new z(t)),e}k(t){dt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,i,s=0;for(let r of t)s===e.length?e.push(i=new o(this.O(V()),this.O(V()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let i=At(t).nextSibling;At(t).remove(),t=i}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},R=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=f,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=f}_$AI(t,e=this,i,s){let r=this.strings,n=!1;if(r===void 0)t=T(this,t,e,0),n=!I(t)||t!==this._$AH&&t!==P,n&&(this._$AH=t);else{let a=t,l,p;for(t=r[0],l=0;l<r.length-1;l++)p=T(this,a[i+l],e,l),p===P&&(p=this._$AH[l]),n||=!I(p)||p!==this._$AH[l],p===f?t=f:t!==f&&(t+=(p??"")+r[l+1]),this._$AH[l]=p}n&&!s&&this.j(t)}j(t){t===f?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},ot=class extends R{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===f?void 0:t}},nt=class extends R{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==f)}},at=class extends R{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=T(this,t,e,0)??f)===P)return;let i=this._$AH,s=t===f&&i!==f||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==f&&(i===f||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},lt=class{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){T(this,t)}};var de=ct.litHtmlPolyfillSupport;de?.(z,j),(ct.litHtmlVersions??=[]).push("3.3.3");var Ht=(o,t,e)=>{let i=e?.renderBefore??t,s=i._$litPart$;if(s===void 0){let r=e?.renderBefore??null;i._$litPart$=s=new j(t.insertBefore(V(),r),r,void 0,e??{})}return s._$AI(o),s};var ut=globalThis,_=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Ht(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return P}};_._$litElement$=!0,_.finalized=!0,ut.litElementHydrateSupport?.({LitElement:_});var he=ut.litElementPolyfillSupport;he?.({LitElement:_});(ut.litElementVersions??=[]).push("4.2.2");var O=["motion","person","vehicle","animal"];async function Vt(o){return(await o.callWS({type:"vurio/cameras"})).cameras}async function It(o,t,e=40){return(await o.callWS({type:"vurio/events",entry_id:t.entry_id,camera:t.camera,limit:e})).events}async function zt(o,t,e,i){return o.callWS({type:"vurio/timeline",entry_id:t.entry_id,cameras:[t.camera],from:e.toISOString(),to:i.toISOString()})}var Nt=new Map;async function X(o,t,e=600){let i=Date.now(),s=Nt.get(t);if(s&&s.until-6e4>i)return s.path;let r=await o.callWS({type:"auth/sign_path",path:t,expires:e});return Nt.set(t,{path:r.path,until:i+e*1e3}),r.path}var jt=(o,t)=>`/api/vurio/${o.entry_id}/live/${encodeURIComponent(o.camera)}/ws?quality=${t}`,Wt=(o,t,e)=>`/api/vurio/${o.entry_id}/clip/${encodeURIComponent(o.camera)}/${Math.floor(t/1e3)}/${Math.ceil(e/1e3)}`,Bt=(o,t)=>`/api/vurio/${o.entry_id}/frame/${encodeURIComponent(t.id)}`;function qt(o){let t=new URL(o,location.href);return t.protocol=location.protocol==="https:"?"wss:":"ws:",t.toString()}function Kt(o,t=()=>window.customElements,e=i=>{setInterval(i,1e3)}){let i,s=()=>{let r=t();if(r!==i){i=r;for(let[n,a]of o)if(!r.get(n))try{r.define(n,a)}catch{try{r.define(n,class extends a{})}catch{}}}};s(),e(s)}var pe="avc1.640029,avc1.64002A,avc1.640033,hvc1.1.6.L153.B0,mp4a.40.2,mp4a.40.5,flac,opus",G=class{constructor(t,e,i){this.video=t;this.address=e;this.report=i;this.connection=null;this.socket=null;this.source=null;this.objectUrl=null;this.closed=!1;this.starting=!1;this.attempts=0;this.cleanup=null;this.pictured=!1;this.transport="connecting"}async begin(){if(!(this.closed||this.starting||this.socket)){this.starting=!0;try{await this.overMse()}catch{if(this.closed)return;try{await this.overWebRtc()}catch(e){this.closed||this.lost(e instanceof Error?e.message:String(e))}}finally{this.starting=!1}}}close(){this.closed=!0,clearTimeout(this.retry),this.release()}async open(){let t=new WebSocket(await this.address());return t.binaryType="arraybuffer",this.socket=t,t}watch(t,e,i,s){let r=!1,n=this.video.currentTime,a=()=>{!t()||this.video.readyState<2&&this.video.currentTime<=n||(clearTimeout(l),this.pictured=!0,this.attempts=0,this.report("live",this.transport),r||(r=!0,e()))},l=setTimeout(()=>{a(),t()&&!r&&i("no picture in time")},s),p=["loadeddata","playing","timeupdate","progress"];for(let g of p)this.video.addEventListener(g,a);return()=>{clearTimeout(l);for(let g of p)this.video.removeEventListener(g,a)}}lost(t,e=!1){if(this.closed)return;if(!e&&(this.pictured||this.video.readyState>=2)){let s=this.socket,r=this.video.currentTime;clearTimeout(this.retry);let n=()=>{this.closed||this.socket!==s||(this.video.currentTime>r?(r=this.video.currentTime,this.retry=setTimeout(n,5e3)):this.lost(t,!0))};this.retry=setTimeout(n,5e3);return}this.report("failed",t),this.release(),this.attempts+=1;let i=Math.min(3e4,2e3*2**Math.min(this.attempts-1,4));clearTimeout(this.retry),this.retry=setTimeout(()=>{this.closed||(this.report("connecting","reconnecting"),this.begin())},i)}release(){clearTimeout(this.retry),this.retry=void 0,this.cleanup?.(),this.cleanup=null;let t=this.connection;this.connection=null,t&&(t.ontrack=null,t.onicecandidate=null,t.onconnectionstatechange=null,t.close()),this.socket&&(this.socket.onopen=this.socket.onclose=this.socket.onerror=this.socket.onmessage=null,this.socket.close(),this.socket=null),this.source=null,this.pictured=!1,this.objectUrl&&(URL.revokeObjectURL(this.objectUrl),this.objectUrl=null),this.video.srcObject=null,this.video.removeAttribute("src")}play(){this.video.play().catch(()=>{!this.closed&&!this.pictured&&this.video.readyState<2&&this.report("failed","tap to play")})}async overMse(){this.release(),this.transport="mse";let t=window.ManagedMediaSource||window.MediaSource;if(!t)throw new Error("MSE is unavailable");let e=pe.split(",").filter(r=>t.isTypeSupported(`video/mp4; codecs="${r}"`)).join(",");if(!e)throw new Error("no supported MSE codecs");let i=new t;this.source=i;let s=await this.open();try{await new Promise((r,n)=>{let a=null,l=!1,p=!1,g=!1,h=[],y=0,b=()=>!this.closed&&this.source===i&&!p,$=u=>{b()&&(p=!0,l||this.video.readyState>=2?(r(),this.lost(u)):n(new Error(u)))},c=this.watch(b,()=>(l=!0,r()),$,2e4);this.cleanup=()=>{c(),h.length=0,n(new Error("closed"))};let v=()=>{b()&&!g&&i.readyState==="open"&&s.readyState===WebSocket.OPEN&&(g=!0,s.send(JSON.stringify({type:"mse",value:e})))},m=()=>{if(!(!b()||!a||a.updating||i.readyState!=="open"))try{if(h.length){let u=h.shift();y-=u.byteLength,a.appendBuffer(u)}else this.keepUp(a)}catch(u){if(u.name==="QuotaExceededError"&&this.forget(a))return;$(`MSE append failed: ${u.message}`)}};s.onopen=v,i.addEventListener("sourceopen",v,{once:!0}),s.onmessage=({data:u})=>{if(b())try{if(typeof u=="string"){let x=JSON.parse(u);if(x.type==="error")throw new Error(x.value);if(x.type==="mse"&&!a){let Q=String(x.value).trim(),Z=Q.startsWith("video/mp4")?Q:`video/mp4; codecs="${Q}"`;if(!t.isTypeSupported(Z))throw new Error(`unsupported type ${Z}`);a=i.addSourceBuffer(Z),a.mode="sequence",a.addEventListener("updateend",m),m()}}else{if(y+=u.byteLength,y>16*1024*1024)throw new Error("MSE buffer overflow");h.push(u),m()}}catch(x){$(x.message)}},s.onerror=()=>$("the stream failed"),s.onclose=()=>$("the stream ended"),window.ManagedMediaSource?(this.video.disableRemotePlayback=!0,this.video.srcObject=i):(this.objectUrl=URL.createObjectURL(i),this.video.src=this.objectUrl),this.play()})}catch(r){throw this.source===i&&this.release(),r}}async overWebRtc(){this.release(),this.transport="webrtc";let t=new RTCPeerConnection({iceServers:[],bundlePolicy:"max-bundle"});this.connection=t;let e=new MediaStream;t.addTransceiver("video",{direction:"recvonly"}),t.addTransceiver("audio",{direction:"recvonly"}),t.ontrack=s=>{this.closed||this.connection!==t||(e.addTrack(s.track),this.video.srcObject=e,this.play())};let i=await this.open();try{await new Promise((s,r)=>{let n=!1,a=!1,l=!1,p=!1,g=[],h=[],y=()=>!this.closed&&this.connection===t&&!a,b=m=>{y()&&(a=!0,n||this.video.readyState>=2?(s(),this.lost(m)):r(new Error(m)))},$=this.watch(y,()=>(n=!0,s()),b,6e3);this.cleanup=()=>{$(),r(new Error("closed"))};let c=(m,u)=>{y()&&i.readyState===WebSocket.OPEN&&i.send(JSON.stringify({type:m,value:u}))};t.onicecandidate=({candidate:m})=>{let u=m?m.toJSON().candidate??"":"";l?c("webrtc/candidate",u):g.push(u)},t.onconnectionstatechange=()=>{["failed","closed"].includes(t.connectionState)&&b("webrtc lost")},i.onopen=async()=>{try{let m=await t.createOffer();await t.setLocalDescription(m),c("webrtc/offer",m.sdp),l=!0;for(let u of g.splice(0))c("webrtc/candidate",u)}catch(m){b(m.message)}};let v=Promise.resolve();i.onmessage=({data:m})=>{v=v.then(async()=>{if(!y())return;let u=JSON.parse(m);if(u.type==="webrtc/answer"){await t.setRemoteDescription({type:"answer",sdp:u.value}),p=!0;for(let x of h.splice(0))await t.addIceCandidate({candidate:x,sdpMid:"0"}).catch(()=>{})}else if(u.type==="webrtc/candidate")p?await t.addIceCandidate({candidate:u.value,sdpMid:"0"}).catch(()=>{}):h.push(u.value);else if(u.type==="error")throw new Error(u.value)}).catch(u=>b(u.message))},i.onerror=()=>{n||b("signalling failed")},i.onclose=()=>{n||b("signalling ended")}})}catch(s){throw this.connection===t&&this.release(),s}}forget(t){if(t.updating||!t.buffered.length)return!1;let e=Math.max(0,this.video.currentTime-10);if(e>t.buffered.start(0))try{return t.remove(t.buffered.start(0),e),!0}catch{return!1}return!1}keepUp(t){let e=this.video.buffered;if(!e.length)return;let i=e.end(e.length-1);i-this.video.currentTime>4&&(this.video.currentTime=i-.3),i-e.start(0)>30&&this.forget(t)}};var M=["motion","person","vehicle","animal","other","plate"];function ft(o,t,e){let i=o.to-o.from,s=Math.min(e,o.to+i*t);return{from:s-i,to:s}}function Y(o,t,e){let i=Math.min(6048e5,Math.max(9e5,(o.to-o.from)*t)),s=(o.from+o.to)/2,r=Math.min(e,s+i/2);return{from:r-i,to:r}}var mt=5e3,Ft=5*6e4;function ue(o,t,e,i=0){let s=o.filter(n=>n.to>=t&&n.from<=e).map(n=>({from:Math.max(t,n.from),to:Math.min(e,Math.max(n.to,n.from))})).sort((n,a)=>n.from-a.from),r=[];for(let n of s){let a=r[r.length-1];a&&n.from<=a.to+i?a.to=Math.max(a.to,n.to):r.push({...n})}return r}function Jt(o,t,e,i,s){let r=(i-e)/500,n={};for(let a of M)n[a]=ue(o.filter(l=>l.camera===t&&l.group===a).map(l=>({from:Date.parse(l.started_at),to:l.ended_at?Date.parse(l.ended_at):s})),e,i,r);return n}var E=(o,t,e)=>Math.min(100,Math.max(0,(o-t)/(e-t)*100));function Xt(o,t){let i=t-o,s=i<=6*36e5?36e5:i<=12*36e5?2*36e5:i<=24*36e5?4*36e5:12*36e5,r=[];for(let n=Math.ceil(o/s)*s;n<=t;n+=s)r.push(n);return r}function Gt(o,t){let e=Date.parse(o.started_at)-mt,i=o.ended_at?Date.parse(o.ended_at):t;return[e,Math.min(i+mt,e+Ft)]}function Yt(o,t){for(let e of t){let i=Date.parse(e.from),s=Date.parse(e.to);if(o>=i&&o<=s){let r=Math.max(i,o-mt);return[r,Math.min(s,r+Ft)]}}return null}function gt(o){let t=(o.label??"").toLowerCase();return o.kind==="motion"&&!t?"motion":t==="person"?"person":["car","truck","bus","motorcycle","bicycle","train","boat","airplane","vehicle"].includes(t)?"vehicle":["dog","cat","bird","horse","sheep","cow","bear","animal"].includes(t)?"animal":t?"other":"motion"}var U={motion:"mdi:motion-sensor",person:"mdi:walk",vehicle:"mdi:car",animal:"mdi:paw",other:"mdi:shape-outline",plate:"mdi:card-text-outline"},W={motion:"Motion",person:"Person",vehicle:"Vehicle",animal:"Animal",other:"Object",plate:"Plate"},D=o=>new Date(o).toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"}),vt=o=>new Date(o).toLocaleDateString(void 0,{weekday:"short",day:"numeric",month:"short"}),bt=class extends _{constructor(){super(...arguments);this.quality="sub";this.muted=!0;this.status="connecting";this.detail="";this.stream=null;this.observer=null;this.visible=!1}static{this.properties={hass:{attribute:!1},camera:{attribute:!1},quality:{},muted:{type:Boolean},status:{state:!0},detail:{state:!0}}}fit(){return this.camera?.aspect?"object-fit: fill":""}static{this.styles=K`
    :host { display: block; position: relative; background: #000; overflow: hidden; }
    video { width: 100%; height: 100%; object-fit: contain; display: block; background: #000; }
    .status { position: absolute; inset: auto 0 0 0; padding: 6px 10px; font-size: 12px;
      color: #fff; background: linear-gradient(transparent, rgba(0,0,0,.6)); pointer-events: none; }
  `}connectedCallback(){super.connectedCallback(),this.observer=new IntersectionObserver(([e])=>{this.visible=!!e?.isIntersecting,this.visible?this.start():this.stop()}),this.observer.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.stop()}updated(e){(e.has("camera")||e.has("quality"))&&this.visible&&(this.stop(),this.start());let i=this.video();i&&(i.muted=this.muted)}video(){return this.renderRoot.querySelector("video")}start(){let e=this.video();if(this.stream||!e||!this.hass||!this.camera)return;let i=this.hass,s=this.camera;this.status="connecting",this.stream=new G(e,async()=>qt(await X(i,jt(s,this.quality),300)),(r,n)=>{this.status=r,this.detail=n??"",this.dispatchEvent(new CustomEvent("live-status",{detail:{status:r,transport:n}}))}),this.stream.begin()}stop(){this.stream?.close(),this.stream=null}render(){return d`
      <video playsinline autoplay .muted=${this.muted} style=${this.fit()}></video>
      ${this.status==="live"?f:d`<div class="status">${this.status==="failed"?`No picture: ${this.detail}`:"Connecting\u2026"}</div>`}
    `}},yt=class extends _{constructor(){super(...arguments);this.cameras=[];this.selected="";this.view="single";this.events=[];this.filter="all";this.playing=null;this.timeline=null;this.span=null;this.loading=0;this.liveStatus="";this.muted=!0;this.error="";this.held=null;this.thumbnails=new Map;this.lastSensors=""}static{this.properties={hass:{attribute:!1},config:{state:!0},cameras:{state:!0},selected:{state:!0},view:{state:!0},events:{state:!0},filter:{state:!0},playing:{state:!0},timeline:{state:!0},span:{state:!0},liveStatus:{state:!0},muted:{state:!0},error:{state:!0}}}static getConfigForm(){return{schema:[{name:"title",selector:{text:{}}},{name:"cameras",selector:{entity:{multiple:!0,filter:{domain:"camera",integration:"vurio"}}}},{name:"view",selector:{select:{mode:"dropdown",options:[{value:"single",label:"One camera"},{value:"grid",label:"Grid"}]}}},{name:"events",selector:{boolean:{}}},{name:"timeline",selector:{boolean:{}}},{name:"hours",selector:{number:{min:1,max:168,mode:"box",unit_of_measurement:"h"}}},{name:"grid_columns",selector:{number:{min:1,max:6,mode:"box"}}}]}}static getStubConfig(e){return{type:"custom:vurio-card",cameras:Object.values(e.entities??{}).filter(s=>s.platform==="vurio"&&s.entity_id.startsWith("camera.")).map(s=>s.entity_id),view:"single",events:!0,timeline:!0,hours:24}}setConfig(e){this.config={view:"single",events:!0,timeline:!0,hours:24,...e},this.view=this.config.view??"single"}getCardSize(){return this.view==="grid"?8:10}getGridOptions(){return{columns:12,min_columns:6,min_rows:6}}connectedCallback(){super.connectedCallback(),this.refresher=setInterval(()=>{this.refresh()},6e4)}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this.refresher)}willUpdate(e){e.has("hass")&&this.hass&&!this.cameras.length&&!this.error&&this.load()}updated(e){if(e.has("hass")&&this.hass&&this.cameras.length){let i=this.shown().flatMap(s=>O.map(r=>this.sensor(s,r)?`${s.camera}:${r}`:"")).join(",");if(i!==this.lastSensors){let s=this.lastSensors;this.lastSensors=i,s&&setTimeout(()=>{this.refresh()},1500)}}}async load(){if(this.hass)try{let e=await Vt(this.hass),i=this.config.cameras;if(this.cameras=i?.length?i.map(s=>e.find(r=>r.entity_id===s)).filter(s=>!!s):e,!this.cameras.length){this.error="No Vurio cameras found. Is the Vurio integration set up?";return}this.selected=this.cameras[0].camera,await this.refresh()}catch(e){this.error=`Vurio could not be read: ${e.message??e}`}}shown(){return this.view==="grid"?this.cameras:this.cameras.filter(e=>e.camera===this.selected)}current(){return this.cameras.find(e=>e.camera===this.selected)}sensor(e,i){let s=e.sensor_entities?.[i];return s&&this.hass?.states[s]?this.hass.states[s].state==="on":!!e.sensors?.[i]}window(){if(this.span)return this.span;let e=Date.now();return{from:e-(this.config.hours??24)*36e5,to:e}}show(e){this.span=e,this.requestUpdate();let i=++this.loading;e===null?this.refresh():setTimeout(()=>{this.loading===i&&this.refresh()},250)}async refresh(){let e=this.hass,i=this.current();if(!e||!i)return;let{from:s,to:r}=this.window();try{let[n,a]=await Promise.all([this.config.events===!1?Promise.resolve([]):It(e,i,60),this.config.timeline===!1?Promise.resolve(null):zt(e,i,new Date(s),new Date(r))]);if(this.current()!==i)return;this.events=n,this.timeline=a,this.error="",await Promise.all(n.slice(0,30).map(async l=>{this.thumbnails.has(l.id)||this.thumbnails.set(l.id,await X(e,Bt(i,l),3600).catch(()=>""))})),this.requestUpdate()}catch(n){let a=n;this.error=a.code==="missing_permission"?a.message??"The Vurio token needs events:read and recordings:read.":`Events could not be read: ${a.message??String(n)}`}}choose(e){e===this.selected&&this.view==="single"||(this.selected=e,this.view="single",this.playing=null,this.events=[],this.timeline=null,this.span=null,this.refresh())}async play(e,i,s){let r=this.hass,n=this.current();!r||!n||(this.playing={url:await X(r,Wt(n,e,i),900),title:s})}fullscreen(){let e=this.renderRoot.querySelector(".stage");document.fullscreenElement?document.exitFullscreen():e?.requestFullscreen?.()}header(){return d`
      <div class="header">
        ${this.config.title?d`<div class="title">${this.config.title}</div>`:f}
        <div class="chips" role="tablist">
          ${this.cameras.map(e=>{let i=O.filter(s=>s!=="motion"&&this.sensor(e,s));return d`
              <button
                role="tab"
                class="chip ${this.view==="single"&&e.camera===this.selected?"on":""}"
                aria-selected=${this.view==="single"&&e.camera===this.selected}
                @click=${()=>this.choose(e.camera)}
              >
                <span class="dot ${e.online?"online":e.mode==="off"?"dark":"offline"}"></span>
                ${e.display_name}
                ${i.map(s=>d`<ha-icon class="badge ${s}" .icon=${U[s]}></ha-icon>`)}
              </button>
            `})}
        </div>
        ${this.cameras.length>1?d`<div class="toggle">
              <button class=${this.view==="single"?"on":""} title="One camera" @click=${()=>this.view="single"}>
                <ha-icon icon="mdi:square-outline"></ha-icon>
              </button>
              <button class=${this.view==="grid"?"on":""} title="Grid" @click=${()=>(this.view="grid",this.playing=null)}>
                <ha-icon icon="mdi:view-grid-outline"></ha-icon>
              </button>
            </div>`:f}
      </div>
    `}single(e){let i=O.filter(s=>this.sensor(e,s));return d`
      <div class="stage" style="aspect-ratio: ${e.aspect??16/9}">
        ${this.playing?d`<video class="playback" src=${this.playing.url} controls autoplay playsinline></video>`:d`<vurio-live
              .hass=${this.hass}
              .camera=${e}
              quality="main"
              .muted=${this.muted}
              @live-status=${s=>this.liveStatus=s.detail.status==="live"?s.detail.transport:""}
            ></vurio-live>`}
        <div class="overlay top">
          <span class="name">${e.display_name}</span>
          ${this.playing?d`<span class="pill playback">${this.playing.title}</span>`:d`<span class="pill ${this.liveStatus?"live":""}">${this.liveStatus?"LIVE":"\u2026"}</span>`}
          ${e.mode!=="continuous"?d`<span class="pill mode">${e.mode==="off"?"Off by schedule":"Events only"}</span>`:f}
          <span class="spacer"></span>
          ${i.map(s=>d`<span class="pill sensor ${s}"><ha-icon .icon=${U[s]}></ha-icon>${W[s]}</span>`)}
        </div>
        <div class="overlay bottom">
          ${this.playing?d`<button class="action" @click=${()=>this.playing=null}><ha-icon icon="mdi:broadcast"></ha-icon>Live</button>`:d`<button class="icon" title=${this.muted?"Unmute":"Mute"} @click=${()=>this.muted=!this.muted}>
                <ha-icon .icon=${this.muted?"mdi:volume-off":"mdi:volume-high"}></ha-icon>
              </button>`}
          <button class="icon" title="Fullscreen" @click=${()=>this.fullscreen()}>
            <ha-icon icon="mdi:fullscreen"></ha-icon>
          </button>
        </div>
      </div>
    `}grid(){let e=this.config.grid_columns??Math.min(4,Math.ceil(Math.sqrt(this.cameras.length)));return d`
      <div class="grid" style="--columns:${e}">
        ${this.cameras.map(i=>{let s=O.filter(r=>r!=="motion"&&this.sensor(i,r));return d`
            <div class="tile" style="aspect-ratio: ${i.aspect??16/9}" @click=${()=>this.choose(i.camera)}>
              <vurio-live .hass=${this.hass} .camera=${i} quality="sub" .muted=${!0}></vurio-live>
              <div class="overlay top small">
                <span class="dot ${i.online?"online":"offline"}"></span>
                <span class="name">${i.display_name}</span>
                <span class="spacer"></span>
                ${s.map(r=>d`<ha-icon class="badge ${r}" .icon=${U[r]}></ha-icon>`)}
              </div>
            </div>
          `})}
      </div>
    `}eventsPanel(e){let i=Date.now(),s=this.events.filter(r=>this.filter==="all"||gt(r)===this.filter);return d`
      <div class="events">
        <div class="filters">
          ${["all",...O].map(r=>d`<button class="chip small ${this.filter===r?"on":""}" @click=${()=>this.filter=r}>
              ${r==="all"?"All":d`<ha-icon .icon=${U[r]}></ha-icon>${W[r]}`}
            </button>`)}
        </div>
        <div class="list">
          ${s.length===0?d`<div class="empty">${this.events.length?"Nothing of that kind.":"No events yet."}</div>`:s.map(r=>{let n=gt(r),[a,l]=Gt(r,i),p=Math.max(1,Math.round(((r.ended_at?Date.parse(r.ended_at):i)-Date.parse(r.started_at))/1e3));return d`
                  <button class="event" @click=${()=>this.play(a,l,`${W[n]} \xB7 ${D(r.started_at)}`)}>
                    <span class="thumb">
                      ${this.thumbnails.get(r.id)?d`<img loading="lazy" src=${this.thumbnails.get(r.id)} alt="" />`:d`<ha-icon .icon=${U[n]}></ha-icon>`}
                    </span>
                    <span class="what">
                      <strong><ha-icon class="badge ${n}" .icon=${U[n]}></ha-icon>${r.label?r.label:W[n]}</strong>
                      <small>${vt(r.started_at)} · ${D(r.started_at)} · ${p<90?`${p}s`:`${Math.round(p/60)} min`}${r.score?` \xB7 ${Math.round(r.score*100)}%`:""}</small>
                    </span>
                    ${r.ended_at?f:d`<span class="pill live">now</span>`}
                  </button>
                `})}
        </div>
      </div>
    `}timelineStrip(e){let i=this.timeline;if(!i)return f;let s=Date.now(),{from:r,to:n}=this.window(),a=Jt(i.detections,e.camera,r,n,s),l=i.recorded.map(c=>({from:Date.parse(c.from),to:Date.parse(c.to)})),p=(c,v)=>r+(c-v.left)/v.width*(n-r),g=c=>{c.button===0&&(this.held={x:c.clientX,from:r,to:n,moved:!1},c.currentTarget.setPointerCapture(c.pointerId))},h=c=>{let v=this.held;if(!v)return;let m=c.currentTarget.getBoundingClientRect(),u=(v.x-c.clientX)/m.width*(v.to-v.from);if(!v.moved&&Math.abs(c.clientX-v.x)<4)return;v.moved=!0;let x=Math.min(Date.now(),v.to+u);this.show({from:x-(v.to-v.from),to:x})},y=c=>{let v=this.held;if(this.held=null,!v||v.moved)return;let m=Yt(p(c.clientX,c.currentTarget.getBoundingClientRect()),i.recorded);m&&this.play(m[0],m[1],`${vt(m[0])} \xB7 ${D(m[0])}`)},b=c=>{c.deltaY&&(c.preventDefault(),this.show(Y({from:r,to:n},c.deltaY>0?1.5:1/1.5,s)))},$=n>=s-6e4;return d`
      <div class="timeline">
        <div class="labels">${M.map(c=>d`<span>${W[c]}</span>`)}</div>
        <div class="strip"
          @pointerdown=${g}
          @pointermove=${h}
          @pointerup=${y}
          @pointercancel=${()=>this.held=null}
          @wheel=${b}
          title="Drag to move through time, scroll to zoom, click to play from a moment">
          <svg viewBox="0 0 1000 ${M.length*14+4}" preserveAspectRatio="none">
            ${l.map(c=>pt`<rect class="recorded" x=${E(c.from,r,n)*10} y="0"
              width=${Math.max(1,(E(c.to,r,n)-E(c.from,r,n))*10)} height=${M.length*14+4}></rect>`)}
            ${M.map((c,v)=>a[c].map(m=>pt`<rect class="bar ${c}" x=${E(m.from,r,n)*10} y=${v*14+3}
                width=${Math.max(2,(E(m.to,r,n)-E(m.from,r,n))*10)} height="10" rx="2"></rect>`))}
          </svg>
          <div class="ticks">
            ${Xt(r,n).map(c=>d`<span style="left:${E(c,r,n)}%">${D(c)}</span>`)}
          </div>
        </div>
        <div class="when">${vt(r)} · ${D(r)} – ${D(n)}</div>
        <div class="moves">
          <button @click=${()=>this.show(ft({from:r,to:n},-.5,s))} title="Earlier">‹</button>
          <button @click=${()=>this.show(Y({from:r,to:n},1/1.5,s))} title="Closer in">＋</button>
          <button @click=${()=>this.show(Y({from:r,to:n},1.5,s))} title="Further out">－</button>
          <button @click=${()=>this.show(ft({from:r,to:n},.5,s))} ?disabled=${$} title="Later">›</button>
          <button class="now" @click=${()=>this.show(null)} ?disabled=${$} title="Back to now">Now</button>
        </div>
      </div>
    `}render(){if(!this.config)return f;if(this.error&&!this.cameras.length)return d`<ha-card><div class="message">${this.error}</div></ha-card>`;if(!this.cameras.length)return d`<ha-card><div class="message">Loading Vurio…</div></ha-card>`;let e=this.current(),i=this.view==="single"&&this.config.events!==!1&&e;return d`
      <ha-card>
        ${this.header()}
        <div class="body ${i?"with-events":""}">
          <div class="main">
            ${this.view==="grid"||!e?this.grid():this.single(e)}
            ${this.view==="single"&&e&&this.config.timeline!==!1?this.timelineStrip(e):f}
          </div>
          ${i?this.eventsPanel(e):f}
        </div>
        ${this.error?d`<div class="message small">${this.error}</div>`:f}
      </ha-card>
    `}static{this.styles=K`
    ha-card { overflow: hidden; }
    .message { padding: 16px; color: var(--secondary-text-color); }
    .message.small { padding: 6px 12px 10px; font-size: 12px; }
    .header { display: flex; align-items: center; gap: 8px; padding: 10px 12px; }
    .title { font-size: 16px; font-weight: 500; margin-right: 4px; white-space: nowrap; }
    .chips { display: flex; gap: 6px; overflow-x: auto; flex: 1; scrollbar-width: none; }
    .chip { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; cursor: pointer;
      border: 1px solid var(--divider-color); background: transparent; color: var(--primary-text-color);
      border-radius: 999px; padding: 5px 11px; font: inherit; font-size: 13px; }
    .chip.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
    .chip.small { padding: 3px 9px; font-size: 12px; --mdc-icon-size: 14px; }
    .toggle { display: flex; border: 1px solid var(--divider-color); border-radius: 999px; overflow: hidden; }
    .toggle button { background: transparent; border: 0; color: var(--secondary-text-color); padding: 4px 9px; cursor: pointer; --mdc-icon-size: 18px; }
    .toggle button.on { color: var(--primary-color); background: rgba(127,127,127,.12); }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--disabled-text-color, #888); flex: none; }
    .dot.online { background: var(--success-color, #43a047); }
    .dot.offline { background: var(--error-color, #db4437); }
    .badge { --mdc-icon-size: 15px; }
    .person { color: #e5484d; } .vehicle { color: #f0963a; } .animal { color: #3fb96d; } .motion { color: #4c7dff; }
    .body { display: grid; grid-template-columns: minmax(0, 1fr); }
    .body.with-events { grid-template-columns: minmax(0, 1fr) 300px; }
    @container (max-width: 760px) { .body.with-events { grid-template-columns: minmax(0, 1fr); } }
    :host { container-type: inline-size; display: block; }
    .main { min-width: 0; }
    .stage { position: relative; aspect-ratio: 16 / 9; background: #000; }
    .stage vurio-live, .stage video.playback { position: absolute; inset: 0; width: 100%; height: 100%; }
    video.playback { object-fit: contain; background: #000; }
    .overlay { position: absolute; left: 0; right: 0; display: flex; align-items: center; gap: 6px; padding: 8px 10px; color: #fff; pointer-events: none; }
    .overlay.top { top: 0; background: linear-gradient(rgba(0,0,0,.55), transparent); }
    .overlay.bottom { bottom: 0; justify-content: flex-end; }
    .overlay button { pointer-events: auto; }
    .overlay.small { font-size: 12px; padding: 5px 8px; }
    .name { font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,.6); }
    .spacer { flex: 1; }
    .pill { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; letter-spacing: .02em;
      padding: 2px 8px; border-radius: 999px; background: rgba(0,0,0,.5); color: #fff; --mdc-icon-size: 13px; }
    .pill.live { background: #e5484d; }
    .pill.playback { background: var(--primary-color); }
    .pill.mode { background: rgba(240,150,58,.85); }
    .pill.sensor { background: rgba(0,0,0,.6); }
    .icon, .action { border: 0; cursor: pointer; color: #fff; background: rgba(0,0,0,.5); border-radius: 999px;
      display: inline-flex; align-items: center; gap: 4px; padding: 6px; --mdc-icon-size: 20px; font: inherit; font-size: 13px; }
    .action { padding: 6px 12px 6px 8px; background: var(--primary-color); }
    .grid { display: grid; grid-template-columns: repeat(var(--columns), minmax(0, 1fr)); gap: 4px; padding: 0 4px 4px; }
    @container (max-width: 520px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    .tile { position: relative; aspect-ratio: 16 / 9; cursor: pointer; border-radius: 6px; overflow: hidden; }
    .tile vurio-live { position: absolute; inset: 0; }
    .events { border-left: 1px solid var(--divider-color); display: flex; flex-direction: column; min-height: 0; max-height: 520px; }
    @container (max-width: 760px) { .events { border-left: 0; border-top: 1px solid var(--divider-color); max-height: 360px; } }
    .filters { display: flex; gap: 4px; padding: 8px; flex-wrap: wrap; }
    .list { overflow-y: auto; padding: 0 6px 8px; }
    .empty { color: var(--secondary-text-color); padding: 12px 6px; font-size: 13px; }
    .event { width: 100%; display: flex; align-items: center; gap: 10px; text-align: left; cursor: pointer;
      background: transparent; border: 0; border-radius: 8px; padding: 6px; color: var(--primary-text-color); font: inherit; }
    .event:hover { background: rgba(127,127,127,.1); }
    .thumb { width: 88px; aspect-ratio: 16 / 9; border-radius: 6px; overflow: hidden; background: var(--secondary-background-color);
      display: grid; place-items: center; flex: none; color: var(--secondary-text-color); }
    .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .what { display: flex; flex-direction: column; min-width: 0; flex: 1; }
    .what strong { display: flex; align-items: center; gap: 4px; font-weight: 500; font-size: 13px; text-transform: capitalize; }
    .what small { color: var(--secondary-text-color); font-size: 11px; }
    .timeline { display: grid; grid-template-columns: 58px minmax(0, 1fr); gap: 6px; padding: 8px 10px 4px; }
    .labels { display: grid; grid-template-rows: repeat(4, 14px); padding-top: 2px; font-size: 10px; color: var(--secondary-text-color); }
    .strip { position: relative; cursor: crosshair; padding-bottom: 16px; }
    .strip svg { width: 100%; height: ${M.length*14+4}px; display: block; }
    .recorded { fill: rgba(127,127,127,.14); }
    .bar.motion { fill: #4c7dff; } .bar.person { fill: #e5484d; } .bar.vehicle { fill: #f0963a; } .bar.animal { fill: #3fb96d; }
    .bar.other { fill: #9a6ddb; } .bar.plate { fill: #e6c229; }
    .strip { cursor: grab; touch-action: pan-y; }
    .strip:active { cursor: grabbing; }
    .when { grid-column: 2; font-size: 11px; opacity: 0.7; padding-top: 2px; }
    .moves { grid-column: 1 / -1; display: flex; gap: 4px; justify-content: flex-end; padding: 2px 0 4px; }
    .moves button { min-width: 28px; padding: 2px 6px; border-radius: 6px; border: 1px solid var(--divider-color, #444);
      background: transparent; color: inherit; cursor: pointer; font-size: 12px; }
    .moves button[disabled] { opacity: 0.35; cursor: default; }
    .ticks { position: absolute; left: 0; right: 0; bottom: 0; height: 14px; font-size: 10px; color: var(--secondary-text-color); }
    .ticks span { position: absolute; transform: translateX(-50%); white-space: nowrap; }
  `}};Kt([["vurio-live",bt],["vurio-card",yt]]);window.customCards=window.customCards||[];window.customCards.some(o=>o.type==="vurio-card")||window.customCards.push({type:"vurio-card",name:"Vurio",description:"Live cameras, events and the detection timeline from Vurio.",preview:!1,documentationURL:"https://github.com/Racoon80/vurio-hass-integration"});
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
