import{i as r,aO as l,ɵ as B,a3 as L,ac as $,ad as x,a4 as w,aR as J,a5 as m,aj as d,a7 as h,ae as E,a8 as P,a9 as s,aa as a,aW as _,aB as g,ah as W,aP as K,aQ as j,b as C,af as f,an as y,ag as F,aU as T}from"./index-BQL9tiEm.js";import{K as D,L as q,U,a as G}from"./keycloakify-angular-login-tokens-make-user-confirm-password-DpvFmeLq.js";import{C as p,L as Q,K as V}from"./KcPage-BZQoiLfE.js";import{L as z}from"./keycloakify-angular-login-components-logout-other-sessions-Byb7DN-j.js";import"./getI18n-EdNMRF-A.js";const M=["headerNode"],X=["infoNode"],H=["socialProvidersNode"],Y=()=>["kcButtonClass","kcButtonPrimaryClass","kcButtonBlockClass","kcButtonLargeClass"],Z=()=>["kcButtonClass","kcButtonDefaultClass","kcButtonBlockClass","kcButtonLargeClass"];function tt(t,S){if(t&1&&(d(0,"span",2),C(1)),t&2){const n=f();a("kcClass","kcWebAuthnKeyIcon"),s(),y(" ",n.i18n.msgStr("webauthn-registration-title"),`
`)}}function et(t,S){if(t&1&&(m(0,"form",10)(1,"button",11),C(2),h()()),t&2){const n=f(),e=F(0);a("action",e.loginAction,_)("kcClass","kcFormClass"),s(),a("kcClass",g(4,Z)),s(),y(" ",n.i18n.msgStr("doCancel")," ")}}let ot=(()=>{class t extends p{constructor(){super(),this.kcContext=r(D),this.loginResourceInjectorService=r(Q),this.i18n=r(q),this.doUseDefaultCss=r(U),this.classes=r(G),this.displayRequiredFields=!1,this.displayInfo=!1,this.displayMessage=!0,this.headerNode=l("headerNode"),this.infoNode=l("infoNode"),this.socialProvidersNode=l("socialProvidersNode"),this.authButtonId="authenticateWebAuthnButton";const{url:n,challenge:e,userid:i,username:o,signatureAlgorithms:c,rpEntityName:u,rpId:k,attestationConveyancePreference:N,authenticatorAttachment:b,requireResidentKey:I,userVerificationRequirement:v,createTimeout:A,excludeCredentialIds:O}=this.kcContext,R=[{type:"module",id:"WebAuthnRegisterScript",textContent:`
              import { registerByWebAuthn } from "${n.resourcesPath}/js/webauthnRegister.js";
              const registerButton = document.getElementById('${this.authButtonId}');
              registerButton.addEventListener("click", function() {
                  const input = {
                      challenge : '${e}',
                      userid : '${i}',
                      username : '${o}',
                      signatureAlgorithms : ${JSON.stringify(c)},
                      rpEntityName : ${JSON.stringify(u)},
                      rpId : ${JSON.stringify(k)},
                      attestationConveyancePreference : ${JSON.stringify(N)},
                      authenticatorAttachment : ${JSON.stringify(b)},
                      requireResidentKey : ${JSON.stringify(I)},
                      userVerificationRequirement : ${JSON.stringify(v)},
                      createTimeout : ${A},
                      excludeCredentialIds : ${JSON.stringify(O)},
                      initLabel : ${JSON.stringify(this.i18n.msgStr("webauthn-registration-init-label"))},
                      initLabelPrompt : ${JSON.stringify(this.i18n.msgStr("webauthn-registration-init-label-prompt"))},
                      errmsg : ${JSON.stringify(this.i18n.msgStr("webauthn-unsupported-browser-text"))}
                  };
                  registerByWebAuthn(input);
              });
          `}];this.loginResourceInjectorService.insertAdditionalScripts(R)}static{this.ɵfac=function(e){return new(e||t)}}static{this.ɵcmp=B({type:t,selectors:[["kc-webauthn-register"]],viewQuery:function(e,i){e&1&&K(i.headerNode,M,5)(i.infoNode,X,5)(i.socialProvidersNode,H,5),e&2&&j(3)},features:[$([{provide:p,useExisting:x(()=>t)}]),L],decls:14,vars:9,consts:[["headerNode",""],["id","register","method","post",3,"kcClass","action"],[3,"kcClass"],["type","hidden","id","clientDataJSON","name","clientDataJSON"],["type","hidden","id","attestationObject","name","attestationObject"],["type","hidden","id","publicKeyCredentialId","name","publicKeyCredentialId"],["type","hidden","id","authenticatorLabel","name","authenticatorLabel"],["type","hidden","id","transports","name","transports"],["type","hidden","id","error","name","error"],["type","submit",3,"kcClass","id","value"],["id","kc-webauthn-settings-form","method","post",3,"action","kcClass"],["type","submit","id","cancelWebAuthnAIA","name","cancel-aia","value","true",3,"kcClass"]],template:function(e,i){if(e&1&&(w(0),J(1,tt,2,2,"ng-template",null,0,T),m(3,"form",1)(4,"div",2),d(5,"input",3)(6,"input",4)(7,"input",5)(8,"input",6)(9,"input",7)(10,"input",8)(11,"kc-logout-other-sessions"),h()(),d(12,"input",9),E(13,et,3,5,"form",10)),e&2){const o=P(i.kcContext.url),c=i.kcContext.isSetRetry,u=i.kcContext.isAppInitiatedAction;s(3),a("kcClass","kcFormClass")("action",o.loginAction,_),s(),a("kcClass","kcFormGroupClass"),s(8),a("kcClass",g(8,Y))("id",i.authButtonId)("value",i.i18n.msgStr("doRegisterSecurityKey")),s(),W(!c&&u?13:-1)}},dependencies:[V,z],encapsulation:2})}}return t})();export{ot as WebauthnRegisterComponent};
