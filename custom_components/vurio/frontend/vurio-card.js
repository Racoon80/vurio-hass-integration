var B=globalThis,W=B.ShadowRoot&&(B.ShadyCSS===void 0||B.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Y=Symbol(),ge=new WeakMap,D=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==Y)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(W&&e===void 0){let i=t!==void 0&&t.length===1;i&&(e=ge.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&ge.set(t,e))}return e}toString(){return this.cssText}},ve=o=>new D(typeof o=="string"?o:o+"",void 0,Y),q=(o,...e)=>{let t=o.length===1?o[0]:e.reduce((i,s,r)=>i+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+o[r+1],o[0]);return new D(t,o,Y)},ye=(o,e)=>{if(W)o.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let i=document.createElement("style"),s=B.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=t.cssText,o.appendChild(i)}},ee=W?o=>o:o=>o instanceof CSSStyleSheet?(e=>{let t="";for(let i of e.cssRules)t+=i.cssText;return ve(t)})(o):o;var{is:Ge,defineProperty:Je,getOwnPropertyDescriptor:Fe,getOwnPropertyNames:Xe,getOwnPropertySymbols:Qe,getPrototypeOf:Ze}=Object,K=globalThis,be=K.trustedTypes,Ye=be?be.emptyScript:"",et=K.reactiveElementPolyfillSupport,L=(o,e)=>o,te={toAttribute(o,e){switch(e){case Boolean:o=o?Ye:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,e){let t=o;switch(e){case Boolean:t=o!==null;break;case Number:t=o===null?null:Number(o);break;case Object:case Array:try{t=JSON.parse(o)}catch{t=null}}return t}},xe=(o,e)=>!Ge(o,e),$e={attribute:!0,type:String,converter:te,reflect:!1,useDefault:!1,hasChanged:xe};Symbol.metadata??=Symbol("metadata"),K.litPropertyMetadata??=new WeakMap;var b=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=$e){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let i=Symbol(),s=this.getPropertyDescriptor(e,i,t);s!==void 0&&Je(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){let{get:s,set:r}=Fe(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:s,set(n){let l=s?.call(this);r?.call(this,n),this.requestUpdate(e,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??$e}static _$Ei(){if(this.hasOwnProperty(L("elementProperties")))return;let e=Ze(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(L("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(L("properties"))){let t=this.properties,i=[...Xe(t),...Qe(t)];for(let s of i)this.createProperty(s,t[s])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[i,s]of t)this.elementProperties.set(i,s)}this._$Eh=new Map;for(let[t,i]of this.elementProperties){let s=this._$Eu(t,i);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let i=new Set(e.flat(1/0).reverse());for(let s of i)t.unshift(ee(s))}else e!==void 0&&t.push(ee(e));return t}static _$Eu(e,t){let i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ye(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){let i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(s!==void 0&&i.reflect===!0){let r=(i.converter?.toAttribute!==void 0?i.converter:te).toAttribute(t,i.type);this._$Em=e,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){let i=this.constructor,s=i._$Eh.get(e);if(s!==void 0&&this._$Em!==s){let r=i.getPropertyOptions(s),n=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:te;this._$Em=s;let l=n.fromAttribute(t,r.type);this[s]=l??this._$Ej?.get(s)??l,this._$Em=null}}requestUpdate(e,t,i,s=!1,r){if(e!==void 0){let n=this.constructor;if(s===!1&&(r=this[e]),i??=n.getPropertyOptions(e),!((i.hasChanged??xe)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:r},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),r!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,r]of this._$Ep)this[s]=r;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[s,r]of i){let{wrapped:n}=r,l=this[s];n!==!0||this._$AL.has(s)||l===void 0||this.C(s,void 0,r,l)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[L("elementProperties")]=new Map,b[L("finalized")]=new Map,et?.({ReactiveElement:b}),(K.reactiveElementVersions??=[]).push("2.1.2");var le=globalThis,we=o=>o,G=le.trustedTypes,_e=G?G.createPolicy("lit-html",{createHTML:o=>o}):void 0,Pe="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,Me="?"+w,tt=`<${Me}>`,E=document,H=()=>E.createComment(""),V=o=>o===null||typeof o!="object"&&typeof o!="function",ce=Array.isArray,it=o=>ce(o)||typeof o?.[Symbol.iterator]=="function",ie=`[ 	
\f\r]`,N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Se=/-->/g,Ae=/>/g,S=RegExp(`>|${ie}(?:([^\\s"'>=/]+)(${ie}*=${ie}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ee=/'/g,Ce=/"/g,Re=/^(?:script|style|textarea|title)$/i,de=o=>(e,...t)=>({_$litType$:o,strings:e,values:t}),h=de(1),he=de(2),pt=de(3),C=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),ke=new WeakMap,A=E.createTreeWalker(E,129);function Te(o,e){if(!ce(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return _e!==void 0?_e.createHTML(e):e}var st=(o,e)=>{let t=o.length-1,i=[],s,r=e===2?"<svg>":e===3?"<math>":"",n=N;for(let l=0;l<t;l++){let a=o[l],c,p,d=-1,f=0;for(;f<a.length&&(n.lastIndex=f,p=n.exec(a),p!==null);)f=n.lastIndex,n===N?p[1]==="!--"?n=Se:p[1]!==void 0?n=Ae:p[2]!==void 0?(Re.test(p[2])&&(s=RegExp("</"+p[2],"g")),n=S):p[3]!==void 0&&(n=S):n===S?p[0]===">"?(n=s??N,d=-1):p[1]===void 0?d=-2:(d=n.lastIndex-p[2].length,c=p[1],n=p[3]===void 0?S:p[3]==='"'?Ce:Ee):n===Ce||n===Ee?n=S:n===Se||n===Ae?n=N:(n=S,s=void 0);let g=n===S&&o[l+1].startsWith("/>")?" ":"";r+=n===N?a+tt:d>=0?(i.push(c),a.slice(0,d)+Pe+a.slice(d)+w+g):a+w+(d===-2?l:g)}return[Te(o,r+(o[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]},I=class o{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,n=0,l=e.length-1,a=this.parts,[c,p]=st(e,t);if(this.el=o.createElement(c,i),A.currentNode=this.el.content,t===2||t===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(s=A.nextNode())!==null&&a.length<l;){if(s.nodeType===1){if(s.hasAttributes())for(let d of s.getAttributeNames())if(d.endsWith(Pe)){let f=p[n++],g=s.getAttribute(d).split(w),y=/([.?@])?(.*)/.exec(f);a.push({type:1,index:r,name:y[2],strings:g,ctor:y[1]==="."?re:y[1]==="?"?oe:y[1]==="@"?ne:M}),s.removeAttribute(d)}else d.startsWith(w)&&(a.push({type:6,index:r}),s.removeAttribute(d));if(Re.test(s.tagName)){let d=s.textContent.split(w),f=d.length-1;if(f>0){s.textContent=G?G.emptyScript:"";for(let g=0;g<f;g++)s.append(d[g],H()),A.nextNode(),a.push({type:2,index:++r});s.append(d[f],H())}}}else if(s.nodeType===8)if(s.data===Me)a.push({type:2,index:r});else{let d=-1;for(;(d=s.data.indexOf(w,d+1))!==-1;)a.push({type:7,index:r}),d+=w.length-1}r++}}static createElement(e,t){let i=E.createElement("template");return i.innerHTML=e,i}};function P(o,e,t=o,i){if(e===C)return e;let s=i!==void 0?t._$Co?.[i]:t._$Cl,r=V(e)?void 0:e._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),r===void 0?s=void 0:(s=new r(o),s._$AT(o,t,i)),i!==void 0?(t._$Co??=[])[i]=s:t._$Cl=s),s!==void 0&&(e=P(o,s._$AS(o,e.values),s,i)),e}var se=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??E).importNode(t,!0);A.currentNode=s;let r=A.nextNode(),n=0,l=0,a=i[0];for(;a!==void 0;){if(n===a.index){let c;a.type===2?c=new z(r,r.nextSibling,this,e):a.type===1?c=new a.ctor(r,a.name,a.strings,this,e):a.type===6&&(c=new ae(r,this,e)),this._$AV.push(c),a=i[++l]}n!==a?.index&&(r=A.nextNode(),n++)}return A.currentNode=E,s}p(e){let t=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}},z=class o{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=P(this,e,t),V(e)?e===m||e==null||e===""?(this._$AH!==m&&this._$AR(),this._$AH=m):e!==this._$AH&&e!==C&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):it(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==m&&V(this._$AH)?this._$AA.nextSibling.data=e:this.T(E.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=I.createElement(Te(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{let r=new se(s,this),n=r.u(this.options);r.p(t),this.T(n),this._$AH=r}}_$AC(e){let t=ke.get(e.strings);return t===void 0&&ke.set(e.strings,t=new I(e)),t}k(e){ce(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,i,s=0;for(let r of e)s===t.length?t.push(i=new o(this.O(H()),this.O(H()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let i=we(e).nextSibling;we(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},M=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,r){this.type=1,this._$AH=m,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=m}_$AI(e,t=this,i,s){let r=this.strings,n=!1;if(r===void 0)e=P(this,e,t,0),n=!V(e)||e!==this._$AH&&e!==C,n&&(this._$AH=e);else{let l=e,a,c;for(e=r[0],a=0;a<r.length-1;a++)c=P(this,l[i+a],t,a),c===C&&(c=this._$AH[a]),n||=!V(c)||c!==this._$AH[a],c===m?e=m:e!==m&&(e+=(c??"")+r[a+1]),this._$AH[a]=c}n&&!s&&this.j(e)}j(e){e===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},re=class extends M{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===m?void 0:e}},oe=class extends M{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==m)}},ne=class extends M{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){if((e=P(this,e,t,0)??m)===C)return;let i=this._$AH,s=e===m&&i!==m||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==m&&(i===m||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},ae=class{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){P(this,e)}};var rt=le.litHtmlPolyfillSupport;rt?.(I,z),(le.litHtmlVersions??=[]).push("3.3.3");var Ue=(o,e,t)=>{let i=t?.renderBefore??e,s=i._$litPart$;if(s===void 0){let r=t?.renderBefore??null;i._$litPart$=s=new z(e.insertBefore(H(),r),r,void 0,t??{})}return s._$AI(o),s};var pe=globalThis,$=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ue(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return C}};$._$litElement$=!0,$.finalized=!0,pe.litElementHydrateSupport?.({LitElement:$});var ot=pe.litElementPolyfillSupport;ot?.({LitElement:$});(pe.litElementVersions??=[]).push("4.2.2");var R=["motion","person","vehicle","animal"];async function De(o){return(await o.callWS({type:"vurio/cameras"})).cameras}async function Le(o,e,t=40){return(await o.callWS({type:"vurio/events",entry_id:e.entry_id,camera:e.camera,limit:t})).events}async function Ne(o,e,t,i){return o.callWS({type:"vurio/timeline",entry_id:e.entry_id,cameras:[e.camera],from:t.toISOString(),to:i.toISOString()})}var Oe=new Map;async function J(o,e,t=600){let i=Date.now(),s=Oe.get(e);if(s&&s.until-6e4>i)return s.path;let r=await o.callWS({type:"auth/sign_path",path:e,expires:t});return Oe.set(e,{path:r.path,until:i+t*1e3}),r.path}var He=(o,e)=>`/api/vurio/${o.entry_id}/live/${encodeURIComponent(o.camera)}/ws?quality=${e}`,Ve=(o,e,t)=>`/api/vurio/${o.entry_id}/clip/${encodeURIComponent(o.camera)}/${Math.floor(e/1e3)}/${Math.ceil(t/1e3)}`,Ie=(o,e)=>`/api/vurio/${o.entry_id}/frame/${encodeURIComponent(e.id)}`;function ze(o){let e=new URL(o,location.href);return e.protocol=location.protocol==="https:"?"wss:":"ws:",e.toString()}var nt="avc1.640029,avc1.64002A,avc1.640033,hvc1.1.6.L153.B0,mp4a.40.2,mp4a.40.5,flac,opus",F=class{constructor(e,t,i){this.video=e;this.address=t;this.report=i;this.connection=null;this.socket=null;this.source=null;this.objectUrl=null;this.closed=!1;this.starting=!1;this.attempts=0;this.cleanup=null;this.pictured=!1;this.transport="connecting"}async begin(){if(!(this.closed||this.starting||this.socket)){this.starting=!0;try{await this.overMse()}catch{if(this.closed)return;try{await this.overWebRtc()}catch(t){this.closed||this.lost(t instanceof Error?t.message:String(t))}}finally{this.starting=!1}}}close(){this.closed=!0,clearTimeout(this.retry),this.release()}async open(){let e=new WebSocket(await this.address());return e.binaryType="arraybuffer",this.socket=e,e}watch(e,t,i,s){let r=!1,n=this.video.currentTime,l=()=>{!e()||this.video.readyState<2&&this.video.currentTime<=n||(clearTimeout(a),this.pictured=!0,this.attempts=0,this.report("live",this.transport),r||(r=!0,t()))},a=setTimeout(()=>{l(),e()&&!r&&i("no picture in time")},s),c=["loadeddata","playing","timeupdate","progress"];for(let p of c)this.video.addEventListener(p,l);return()=>{clearTimeout(a);for(let p of c)this.video.removeEventListener(p,l)}}lost(e,t=!1){if(this.closed)return;if(!t&&(this.pictured||this.video.readyState>=2)){let s=this.socket,r=this.video.currentTime;clearTimeout(this.retry);let n=()=>{this.closed||this.socket!==s||(this.video.currentTime>r?(r=this.video.currentTime,this.retry=setTimeout(n,5e3)):this.lost(e,!0))};this.retry=setTimeout(n,5e3);return}this.report("failed",e),this.release(),this.attempts+=1;let i=Math.min(3e4,2e3*2**Math.min(this.attempts-1,4));clearTimeout(this.retry),this.retry=setTimeout(()=>{this.closed||(this.report("connecting","reconnecting"),this.begin())},i)}release(){clearTimeout(this.retry),this.retry=void 0,this.cleanup?.(),this.cleanup=null;let e=this.connection;this.connection=null,e&&(e.ontrack=null,e.onicecandidate=null,e.onconnectionstatechange=null,e.close()),this.socket&&(this.socket.onopen=this.socket.onclose=this.socket.onerror=this.socket.onmessage=null,this.socket.close(),this.socket=null),this.source=null,this.pictured=!1,this.objectUrl&&(URL.revokeObjectURL(this.objectUrl),this.objectUrl=null),this.video.srcObject=null,this.video.removeAttribute("src")}play(){this.video.play().catch(()=>{!this.closed&&!this.pictured&&this.video.readyState<2&&this.report("failed","tap to play")})}async overMse(){this.release(),this.transport="mse";let e=window.ManagedMediaSource||window.MediaSource;if(!e)throw new Error("MSE is unavailable");let t=nt.split(",").filter(r=>e.isTypeSupported(`video/mp4; codecs="${r}"`)).join(",");if(!t)throw new Error("no supported MSE codecs");let i=new e;this.source=i;let s=await this.open();try{await new Promise((r,n)=>{let l=null,a=!1,c=!1,p=!1,d=[],f=0,g=()=>!this.closed&&this.source===i&&!c,y=u=>{g()&&(c=!0,a||this.video.readyState>=2?(r(),this.lost(u)):n(new Error(u)))},U=this.watch(g,()=>(a=!0,r()),y,2e4);this.cleanup=()=>{U(),d.length=0,n(new Error("closed"))};let O=()=>{g()&&!p&&i.readyState==="open"&&s.readyState===WebSocket.OPEN&&(p=!0,s.send(JSON.stringify({type:"mse",value:t})))},v=()=>{if(!(!g()||!l||l.updating||i.readyState!=="open"))try{if(d.length){let u=d.shift();f-=u.byteLength,l.appendBuffer(u)}else this.keepUp(l)}catch(u){if(u.name==="QuotaExceededError"&&this.forget(l))return;y(`MSE append failed: ${u.message}`)}};s.onopen=O,i.addEventListener("sourceopen",O,{once:!0}),s.onmessage=({data:u})=>{if(g())try{if(typeof u=="string"){let x=JSON.parse(u);if(x.type==="error")throw new Error(x.value);if(x.type==="mse"&&!l){let Q=String(x.value).trim(),Z=Q.startsWith("video/mp4")?Q:`video/mp4; codecs="${Q}"`;if(!e.isTypeSupported(Z))throw new Error(`unsupported type ${Z}`);l=i.addSourceBuffer(Z),l.mode="sequence",l.addEventListener("updateend",v),v()}}else{if(f+=u.byteLength,f>16*1024*1024)throw new Error("MSE buffer overflow");d.push(u),v()}}catch(x){y(x.message)}},s.onerror=()=>y("the stream failed"),s.onclose=()=>y("the stream ended"),window.ManagedMediaSource?(this.video.disableRemotePlayback=!0,this.video.srcObject=i):(this.objectUrl=URL.createObjectURL(i),this.video.src=this.objectUrl),this.play()})}catch(r){throw this.source===i&&this.release(),r}}async overWebRtc(){this.release(),this.transport="webrtc";let e=new RTCPeerConnection({iceServers:[],bundlePolicy:"max-bundle"});this.connection=e;let t=new MediaStream;e.addTransceiver("video",{direction:"recvonly"}),e.addTransceiver("audio",{direction:"recvonly"}),e.ontrack=s=>{this.closed||this.connection!==e||(t.addTrack(s.track),this.video.srcObject=t,this.play())};let i=await this.open();try{await new Promise((s,r)=>{let n=!1,l=!1,a=!1,c=!1,p=[],d=[],f=()=>!this.closed&&this.connection===e&&!l,g=v=>{f()&&(l=!0,n||this.video.readyState>=2?(s(),this.lost(v)):r(new Error(v)))},y=this.watch(f,()=>(n=!0,s()),g,6e3);this.cleanup=()=>{y(),r(new Error("closed"))};let U=(v,u)=>{f()&&i.readyState===WebSocket.OPEN&&i.send(JSON.stringify({type:v,value:u}))};e.onicecandidate=({candidate:v})=>{let u=v?v.toJSON().candidate??"":"";a?U("webrtc/candidate",u):p.push(u)},e.onconnectionstatechange=()=>{["failed","closed"].includes(e.connectionState)&&g("webrtc lost")},i.onopen=async()=>{try{let v=await e.createOffer();await e.setLocalDescription(v),U("webrtc/offer",v.sdp),a=!0;for(let u of p.splice(0))U("webrtc/candidate",u)}catch(v){g(v.message)}};let O=Promise.resolve();i.onmessage=({data:v})=>{O=O.then(async()=>{if(!f())return;let u=JSON.parse(v);if(u.type==="webrtc/answer"){await e.setRemoteDescription({type:"answer",sdp:u.value}),c=!0;for(let x of d.splice(0))await e.addIceCandidate({candidate:x,sdpMid:"0"}).catch(()=>{})}else if(u.type==="webrtc/candidate")c?await e.addIceCandidate({candidate:u.value,sdpMid:"0"}).catch(()=>{}):d.push(u.value);else if(u.type==="error")throw new Error(u.value)}).catch(u=>g(u.message))},i.onerror=()=>{n||g("signalling failed")},i.onclose=()=>{n||g("signalling ended")}})}catch(s){throw this.connection===e&&this.release(),s}}forget(e){if(e.updating||!e.buffered.length)return!1;let t=Math.max(0,this.video.currentTime-10);if(t>e.buffered.start(0))try{return e.remove(e.buffered.start(0),t),!0}catch{return!1}return!1}keepUp(e){let t=this.video.buffered;if(!t.length)return;let i=t.end(t.length-1);i-this.video.currentTime>4&&(this.video.currentTime=i-.3),i-t.start(0)>30&&this.forget(e)}};var k=["motion","person","vehicle","animal"];function at(o,e,t,i=0){let s=o.filter(n=>n.to>=e&&n.from<=t).map(n=>({from:Math.max(e,n.from),to:Math.min(t,Math.max(n.to,n.from))})).sort((n,l)=>n.from-l.from),r=[];for(let n of s){let l=r[r.length-1];l&&n.from<=l.to+i?l.to=Math.max(l.to,n.to):r.push({...n})}return r}function je(o,e,t,i,s){let r=(i-t)/500,n={};for(let l of k)n[l]=at(o.filter(a=>a.camera===e&&a.group===l).map(a=>({from:Date.parse(a.started_at),to:a.ended_at?Date.parse(a.ended_at):s})),t,i,r);return n}var _=(o,e,t)=>Math.min(100,Math.max(0,(o-e)/(t-e)*100));function Be(o,e){let i=e-o,s=i<=6*36e5?36e5:i<=12*36e5?2*36e5:i<=24*36e5?4*36e5:12*36e5,r=[];for(let n=Math.ceil(o/s)*s;n<=e;n+=s)r.push(n);return r}function We(o,e){let t=Date.parse(o.started_at)-5e3,i=o.ended_at?Date.parse(o.ended_at):e;return[t,Math.min(i+5e3,t+3e5)]}function qe(o,e){for(let t of e){let i=Date.parse(t.from),s=Date.parse(t.to);if(o>=i&&o<=s){let r=Math.max(i,o-5e3);return[r,Math.min(s,r+3e5)]}}return null}function ue(o){let e=(o.label??"").toLowerCase();return o.kind==="motion"&&!e?"motion":e==="person"?"person":["car","truck","bus","motorcycle","bicycle","train","boat","airplane","vehicle"].includes(e)?"vehicle":["dog","cat","bird","horse","sheep","cow","bear","animal"].includes(e)?"animal":e?"other":"motion"}var T={motion:"mdi:motion-sensor",person:"mdi:walk",vehicle:"mdi:car",animal:"mdi:paw",other:"mdi:shape-outline"},j={motion:"Motion",person:"Person",vehicle:"Vehicle",animal:"Animal",other:"Other"},X=o=>new Date(o).toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"}),Ke=o=>new Date(o).toLocaleDateString(void 0,{weekday:"short",day:"numeric",month:"short"}),me=class extends ${constructor(){super(...arguments);this.quality="sub";this.muted=!0;this.status="connecting";this.detail="";this.stream=null;this.observer=null;this.visible=!1}static{this.properties={hass:{attribute:!1},camera:{attribute:!1},quality:{},muted:{type:Boolean},status:{state:!0},detail:{state:!0}}}static{this.styles=q`
    :host { display: block; position: relative; background: #000; overflow: hidden; }
    video { width: 100%; height: 100%; object-fit: contain; display: block; background: #000; }
    .status { position: absolute; inset: auto 0 0 0; padding: 6px 10px; font-size: 12px;
      color: #fff; background: linear-gradient(transparent, rgba(0,0,0,.6)); pointer-events: none; }
  `}connectedCallback(){super.connectedCallback(),this.observer=new IntersectionObserver(([t])=>{this.visible=!!t?.isIntersecting,this.visible?this.start():this.stop()}),this.observer.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.stop()}updated(t){(t.has("camera")||t.has("quality"))&&this.visible&&(this.stop(),this.start());let i=this.video();i&&(i.muted=this.muted)}video(){return this.renderRoot.querySelector("video")}start(){let t=this.video();if(this.stream||!t||!this.hass||!this.camera)return;let i=this.hass,s=this.camera;this.status="connecting",this.stream=new F(t,async()=>ze(await J(i,He(s,this.quality),300)),(r,n)=>{this.status=r,this.detail=n??"",this.dispatchEvent(new CustomEvent("live-status",{detail:{status:r,transport:n}}))}),this.stream.begin()}stop(){this.stream?.close(),this.stream=null}render(){return h`
      <video playsinline autoplay .muted=${this.muted}></video>
      ${this.status==="live"?m:h`<div class="status">${this.status==="failed"?`No picture: ${this.detail}`:"Connecting\u2026"}</div>`}
    `}},fe=class extends ${constructor(){super(...arguments);this.cameras=[];this.selected="";this.view="single";this.events=[];this.filter="all";this.playing=null;this.timeline=null;this.liveStatus="";this.muted=!0;this.error="";this.thumbnails=new Map;this.lastSensors=""}static{this.properties={hass:{attribute:!1},config:{state:!0},cameras:{state:!0},selected:{state:!0},view:{state:!0},events:{state:!0},filter:{state:!0},playing:{state:!0},timeline:{state:!0},liveStatus:{state:!0},muted:{state:!0},error:{state:!0}}}static getConfigForm(){return{schema:[{name:"title",selector:{text:{}}},{name:"cameras",selector:{entity:{multiple:!0,filter:{domain:"camera",integration:"vurio"}}}},{name:"view",selector:{select:{mode:"dropdown",options:[{value:"single",label:"One camera"},{value:"grid",label:"Grid"}]}}},{name:"events",selector:{boolean:{}}},{name:"timeline",selector:{boolean:{}}},{name:"hours",selector:{number:{min:1,max:168,mode:"box",unit_of_measurement:"h"}}},{name:"grid_columns",selector:{number:{min:1,max:6,mode:"box"}}}]}}static getStubConfig(t){return{type:"custom:vurio-card",cameras:Object.values(t.entities??{}).filter(s=>s.platform==="vurio"&&s.entity_id.startsWith("camera.")).map(s=>s.entity_id),view:"single",events:!0,timeline:!0,hours:24}}setConfig(t){this.config={view:"single",events:!0,timeline:!0,hours:24,...t},this.view=this.config.view??"single"}getCardSize(){return this.view==="grid"?8:10}getGridOptions(){return{columns:12,min_columns:6,min_rows:6}}connectedCallback(){super.connectedCallback(),this.refresher=setInterval(()=>{this.refresh()},6e4)}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this.refresher)}willUpdate(t){t.has("hass")&&this.hass&&!this.cameras.length&&!this.error&&this.load()}updated(t){if(t.has("hass")&&this.hass&&this.cameras.length){let i=this.shown().flatMap(s=>R.map(r=>this.sensor(s,r)?`${s.camera}:${r}`:"")).join(",");if(i!==this.lastSensors){let s=this.lastSensors;this.lastSensors=i,s&&setTimeout(()=>{this.refresh()},1500)}}}async load(){if(this.hass)try{let t=await De(this.hass),i=this.config.cameras;if(this.cameras=i?.length?i.map(s=>t.find(r=>r.entity_id===s)).filter(s=>!!s):t,!this.cameras.length){this.error="No Vurio cameras found. Is the Vurio integration set up?";return}this.selected=this.cameras[0].camera,await this.refresh()}catch(t){this.error=`Vurio could not be read: ${t.message??t}`}}shown(){return this.view==="grid"?this.cameras:this.cameras.filter(t=>t.camera===this.selected)}current(){return this.cameras.find(t=>t.camera===this.selected)}sensor(t,i){let s=t.sensor_entities?.[i];return s&&this.hass?.states[s]?this.hass.states[s].state==="on":!!t.sensors?.[i]}async refresh(){let t=this.hass,i=this.current();if(!t||!i)return;let s=Date.now(),r=s-(this.config.hours??24)*36e5;try{let[n,l]=await Promise.all([this.config.events===!1?Promise.resolve([]):Le(t,i,60),this.config.timeline===!1?Promise.resolve(null):Ne(t,i,new Date(r),new Date(s))]);if(this.current()!==i)return;this.events=n,this.timeline=l,this.error="",await Promise.all(n.slice(0,30).map(async a=>{this.thumbnails.has(a.id)||this.thumbnails.set(a.id,await J(t,Ie(i,a),3600).catch(()=>""))})),this.requestUpdate()}catch(n){this.error=`Events could not be read: ${n.message??n}`}}choose(t){t===this.selected&&this.view==="single"||(this.selected=t,this.view="single",this.playing=null,this.events=[],this.timeline=null,this.refresh())}async play(t,i,s){let r=this.hass,n=this.current();!r||!n||(this.playing={url:await J(r,Ve(n,t,i),900),title:s})}fullscreen(){let t=this.renderRoot.querySelector(".stage");document.fullscreenElement?document.exitFullscreen():t?.requestFullscreen?.()}header(){return h`
      <div class="header">
        ${this.config.title?h`<div class="title">${this.config.title}</div>`:m}
        <div class="chips" role="tablist">
          ${this.cameras.map(t=>{let i=R.filter(s=>s!=="motion"&&this.sensor(t,s));return h`
              <button
                role="tab"
                class="chip ${this.view==="single"&&t.camera===this.selected?"on":""}"
                aria-selected=${this.view==="single"&&t.camera===this.selected}
                @click=${()=>this.choose(t.camera)}
              >
                <span class="dot ${t.online?"online":t.mode==="off"?"dark":"offline"}"></span>
                ${t.display_name}
                ${i.map(s=>h`<ha-icon class="badge ${s}" .icon=${T[s]}></ha-icon>`)}
              </button>
            `})}
        </div>
        ${this.cameras.length>1?h`<div class="toggle">
              <button class=${this.view==="single"?"on":""} title="One camera" @click=${()=>this.view="single"}>
                <ha-icon icon="mdi:square-outline"></ha-icon>
              </button>
              <button class=${this.view==="grid"?"on":""} title="Grid" @click=${()=>(this.view="grid",this.playing=null)}>
                <ha-icon icon="mdi:view-grid-outline"></ha-icon>
              </button>
            </div>`:m}
      </div>
    `}single(t){let i=R.filter(s=>this.sensor(t,s));return h`
      <div class="stage">
        ${this.playing?h`<video class="playback" src=${this.playing.url} controls autoplay playsinline></video>`:h`<vurio-live
              .hass=${this.hass}
              .camera=${t}
              quality="main"
              .muted=${this.muted}
              @live-status=${s=>this.liveStatus=s.detail.status==="live"?s.detail.transport:""}
            ></vurio-live>`}
        <div class="overlay top">
          <span class="name">${t.display_name}</span>
          ${this.playing?h`<span class="pill playback">${this.playing.title}</span>`:h`<span class="pill ${this.liveStatus?"live":""}">${this.liveStatus?"LIVE":"\u2026"}</span>`}
          ${t.mode!=="continuous"?h`<span class="pill mode">${t.mode==="off"?"Off by schedule":"Events only"}</span>`:m}
          <span class="spacer"></span>
          ${i.map(s=>h`<span class="pill sensor ${s}"><ha-icon .icon=${T[s]}></ha-icon>${j[s]}</span>`)}
        </div>
        <div class="overlay bottom">
          ${this.playing?h`<button class="action" @click=${()=>this.playing=null}><ha-icon icon="mdi:broadcast"></ha-icon>Live</button>`:h`<button class="icon" title=${this.muted?"Unmute":"Mute"} @click=${()=>this.muted=!this.muted}>
                <ha-icon .icon=${this.muted?"mdi:volume-off":"mdi:volume-high"}></ha-icon>
              </button>`}
          <button class="icon" title="Fullscreen" @click=${()=>this.fullscreen()}>
            <ha-icon icon="mdi:fullscreen"></ha-icon>
          </button>
        </div>
      </div>
    `}grid(){let t=this.config.grid_columns??Math.min(4,Math.ceil(Math.sqrt(this.cameras.length)));return h`
      <div class="grid" style="--columns:${t}">
        ${this.cameras.map(i=>{let s=R.filter(r=>r!=="motion"&&this.sensor(i,r));return h`
            <div class="tile" @click=${()=>this.choose(i.camera)}>
              <vurio-live .hass=${this.hass} .camera=${i} quality="sub" .muted=${!0}></vurio-live>
              <div class="overlay top small">
                <span class="dot ${i.online?"online":"offline"}"></span>
                <span class="name">${i.display_name}</span>
                <span class="spacer"></span>
                ${s.map(r=>h`<ha-icon class="badge ${r}" .icon=${T[r]}></ha-icon>`)}
              </div>
            </div>
          `})}
      </div>
    `}eventsPanel(t){let i=Date.now(),s=this.events.filter(r=>this.filter==="all"||ue(r)===this.filter);return h`
      <div class="events">
        <div class="filters">
          ${["all",...R].map(r=>h`<button class="chip small ${this.filter===r?"on":""}" @click=${()=>this.filter=r}>
              ${r==="all"?"All":h`<ha-icon .icon=${T[r]}></ha-icon>${j[r]}`}
            </button>`)}
        </div>
        <div class="list">
          ${s.length===0?h`<div class="empty">${this.events.length?"Nothing of that kind.":"No events yet."}</div>`:s.map(r=>{let n=ue(r),[l,a]=We(r,i),c=Math.max(1,Math.round(((r.ended_at?Date.parse(r.ended_at):i)-Date.parse(r.started_at))/1e3));return h`
                  <button class="event" @click=${()=>this.play(l,a,`${j[n]} \xB7 ${X(r.started_at)}`)}>
                    <span class="thumb">
                      ${this.thumbnails.get(r.id)?h`<img loading="lazy" src=${this.thumbnails.get(r.id)} alt="" />`:h`<ha-icon .icon=${T[n]}></ha-icon>`}
                    </span>
                    <span class="what">
                      <strong><ha-icon class="badge ${n}" .icon=${T[n]}></ha-icon>${r.label?r.label:j[n]}</strong>
                      <small>${Ke(r.started_at)} · ${X(r.started_at)} · ${c<90?`${c}s`:`${Math.round(c/60)} min`}${r.score?` \xB7 ${Math.round(r.score*100)}%`:""}</small>
                    </span>
                    ${r.ended_at?m:h`<span class="pill live">now</span>`}
                  </button>
                `})}
        </div>
      </div>
    `}timelineStrip(t){let i=this.timeline;if(!i)return m;let s=Date.now(),r=s-(this.config.hours??24)*36e5,n=je(i.detections,t.camera,r,s,s),l=i.recorded.map(c=>({from:Date.parse(c.from),to:Date.parse(c.to)})),a=c=>{let p=c.currentTarget.getBoundingClientRect(),d=r+(c.clientX-p.left)/p.width*(s-r),f=qe(d,i.recorded);f&&this.play(f[0],f[1],`${Ke(f[0])} \xB7 ${X(f[0])}`)};return h`
      <div class="timeline">
        <div class="labels">${k.map(c=>h`<span>${j[c]}</span>`)}</div>
        <div class="strip" @click=${a} title="Play from here">
          <svg viewBox="0 0 1000 ${k.length*14+4}" preserveAspectRatio="none">
            ${l.map(c=>he`<rect class="recorded" x=${_(c.from,r,s)*10} y="0"
              width=${Math.max(1,(_(c.to,r,s)-_(c.from,r,s))*10)} height=${k.length*14+4}></rect>`)}
            ${k.map((c,p)=>n[c].map(d=>he`<rect class="bar ${c}" x=${_(d.from,r,s)*10} y=${p*14+3}
                width=${Math.max(2,(_(d.to,r,s)-_(d.from,r,s))*10)} height="10" rx="2"></rect>`))}
          </svg>
          <div class="ticks">
            ${Be(r,s).map(c=>h`<span style="left:${_(c,r,s)}%">${X(c)}</span>`)}
          </div>
        </div>
      </div>
    `}render(){if(!this.config)return m;if(this.error&&!this.cameras.length)return h`<ha-card><div class="message">${this.error}</div></ha-card>`;if(!this.cameras.length)return h`<ha-card><div class="message">Loading Vurio…</div></ha-card>`;let t=this.current(),i=this.view==="single"&&this.config.events!==!1&&t;return h`
      <ha-card>
        ${this.header()}
        <div class="body ${i?"with-events":""}">
          <div class="main">
            ${this.view==="grid"||!t?this.grid():this.single(t)}
            ${this.view==="single"&&t&&this.config.timeline!==!1?this.timelineStrip(t):m}
          </div>
          ${i?this.eventsPanel(t):m}
        </div>
        ${this.error?h`<div class="message small">${this.error}</div>`:m}
      </ha-card>
    `}static{this.styles=q`
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
    .strip svg { width: 100%; height: ${k.length*14+4}px; display: block; }
    .recorded { fill: rgba(127,127,127,.14); }
    .bar.motion { fill: #4c7dff; } .bar.person { fill: #e5484d; } .bar.vehicle { fill: #f0963a; } .bar.animal { fill: #3fb96d; }
    .ticks { position: absolute; left: 0; right: 0; bottom: 0; height: 14px; font-size: 10px; color: var(--secondary-text-color); }
    .ticks span { position: absolute; transform: translateX(-50%); white-space: nowrap; }
  `}};customElements.get("vurio-live")||customElements.define("vurio-live",me);customElements.get("vurio-card")||customElements.define("vurio-card",fe);window.customCards=window.customCards||[];window.customCards.some(o=>o.type==="vurio-card")||window.customCards.push({type:"vurio-card",name:"Vurio",description:"Live cameras, events and the detection timeline from Vurio.",preview:!1,documentationURL:"https://github.com/Racoon80/vurio-hass-integration"});
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
