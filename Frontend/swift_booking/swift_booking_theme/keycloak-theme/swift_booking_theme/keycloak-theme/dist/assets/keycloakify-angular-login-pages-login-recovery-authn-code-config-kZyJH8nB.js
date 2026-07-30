import{i as p,aO as m,ap as _,ɵ as h,a3 as k,ac as R,ad as L,aR as w,a5 as s,aj as l,a7 as i,b as a,a6 as S,ai as b,ay as A,ae as B,a9 as e,aa as r,an as d,aV as x,ab as I,ah as N,aP as T,aQ as E,af as f,b3 as D,aB as v,aU as O,aW as $}from"./index-BQL9tiEm.js";import{K as F,L as P,U,a as j}from"./keycloakify-angular-login-tokens-make-user-confirm-password-DpvFmeLq.js";import{C as g,L as J,K as q}from"./KcPage-BZQoiLfE.js";import{L as G}from"./keycloakify-angular-login-components-logout-other-sessions-Byb7DN-j.js";import"./getI18n-EdNMRF-A.js";const K=["headerNode"],M=["infoNode"],Q=["socialProvidersNode"],W=()=>["kcButtonClass","kcButtonPrimaryClass","kcButtonLargeClass"],H=()=>["kcButtonClass","kcButtonDefaultClass","kcButtonLargeClass"],z=()=>["kcButtonClass","kcButtonPrimaryClass","kcButtonBlockClass","kcButtonLargeClass"];function V(o,u){if(o&1&&a(0),o&2){const n=f();d(" ",n.i18n.msgStr("recovery-code-config-header"),`
`)}}function Z(o,u){if(o&1&&(s(0,"li")(1,"span"),a(2),i(),a(3),i()),o&2){const n=u.$implicit,c=u.$index;e(2),d("",c+1,":"),e(),D(" ",n.slice(0,4),"-",n.slice(4,8),"-",n.slice(8)," ")}}function X(o,u){if(o&1&&(l(0,"input",22),s(1,"button",23),a(2),i()),o&2){const n=f();r("kcClass",v(5,W))("value",n.i18n.msgStr("recovery-codes-action-complete"))("disabled",!n.toggleRecoveryCodesConfirmation()),e(),r("kcClass",v(6,H)),e(),d(" ",n.i18n.msgStr("recovery-codes-action-cancel")," ")}}function Y(o,u){if(o&1&&l(0,"input",22),o&2){const n=f();r("kcClass",v(3,z))("value",n.i18n.msgStr("recovery-codes-action-complete"))("disabled",!n.toggleRecoveryCodesConfirmation())}}let re=(()=>{class o extends g{constructor(){super(),this.kcContext=p(F),this.i18n=p(P),this.loginResourceInjectorService=p(J),this.doUseDefaultCss=p(U),this.classes=p(j),this.displayRequiredFields=!1,this.displayInfo=!0,this.displayMessage=this.kcContext.messagesPerField.existsError("password"),this.headerNode=m("headerNode"),this.infoNode=m("infoNode"),this.socialProvidersNode=m("socialProvidersNode"),this.toggleRecoveryCodesConfirmation=_(!1),this.olRecoveryCodesListId="kc-recovery-codes-list"}ngAfterViewInit(){this.loginResourceInjectorService.insertAdditionalScripts([{type:"text/javascript",id:`${this.olRecoveryCodesListId}-script`,textContent:`
                    /* copy recovery codes  */
                    function copyRecoveryCodes() {
                        var tmpTextarea = document.createElement("textarea");
                        var codes = document.querySelectorAll("#${this.olRecoveryCodesListId} li");
                        for (i = 0; i < codes.length; i++) {
                            tmpTextarea.value = tmpTextarea.value + codes[i].innerText + "\\n";
                        }
                        document.body.appendChild(tmpTextarea);
                        tmpTextarea.select();
                        document.execCommand("copy");
                        document.body.removeChild(tmpTextarea);
                    }

                    var copyButton = document.getElementById("copyRecoveryCodes");
                    copyButton && copyButton.addEventListener("click", function () {
                        copyRecoveryCodes();
                    });

                    /* download recovery codes  */
                    function formatCurrentDateTime() {
                        var dt = new Date();
                        var options = {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            timeZoneName: 'short'
                        };

                        return dt.toLocaleString('en-US', options);
                    }

                    function parseRecoveryCodeList() {
                        var recoveryCodes = document.querySelectorAll("#${this.olRecoveryCodesListId} li");
                        var recoveryCodeList = "";

                        for (var i = 0; i < recoveryCodes.length; i++) {
                            var recoveryCodeLiElement = recoveryCodes[i].innerText;
                            recoveryCodeList += recoveryCodeLiElement + "\\r\\n";
                        }

                        return recoveryCodeList;
                    }

                    function buildDownloadContent() {
                        var recoveryCodeList = parseRecoveryCodeList();
                        var dt = new Date();
                        var options = {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            timeZoneName: 'short'
                        };

                        return fileBodyContent =
                            ${JSON.stringify(this.i18n.msgStr("recovery-codes-download-file-header"))} + "\\n\\n" +
                            recoveryCodeList + "\\n" +
                            ${JSON.stringify(this.i18n.msgStr("recovery-codes-download-file-description"))} + "\\n\\n" +
                            ${JSON.stringify(this.i18n.msgStr("recovery-codes-download-file-date"))} + " " + formatCurrentDateTime();
                    }

                    function setUpDownloadLinkAndDownload(filename, text) {
                        var el = document.createElement('a');
                        el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                        el.setAttribute('download', filename);
                        el.style.display = 'none';
                        document.body.appendChild(el);
                        el.click();
                        document.body.removeChild(el);
                    }

                    function downloadRecoveryCodes() {
                        setUpDownloadLinkAndDownload('kc-download-recovery-codes.txt', buildDownloadContent());
                    }

                    var downloadButton = document.getElementById("downloadRecoveryCodes");
                    downloadButton && downloadButton.addEventListener("click", downloadRecoveryCodes);

                    /* print recovery codes */
                    function buildPrintContent() {
                        var recoveryCodeListHTML = document.getElementById('${this.olRecoveryCodesListId}').innerHTML;
                        var styles =
                            \`@page { size: auto;  margin-top: 0; }
                            body { width: 480px; }
                            div { list-style-type: none; font-family: monospace }
                            p:first-of-type { margin-top: 48px }\`;

                        return printFileContent =
                            "<html><style>" + styles + "</style><body>" +
                            "<title>kc-download-recovery-codes</title>" +
                            "<p>" + ${JSON.stringify(this.i18n.msgStr("recovery-codes-download-file-header"))} + "</p>" +
                            "<div>" + recoveryCodeListHTML + "</div>" +
                            "<p>" + ${JSON.stringify(this.i18n.msgStr("recovery-codes-download-file-description"))} + "</p>" +
                            "<p>" + ${JSON.stringify(this.i18n.msgStr("recovery-codes-download-file-date"))} + " " + formatCurrentDateTime() + "</p>" +
                            "</body></html>";
                    }

                    function printRecoveryCodes() {
                        var w = window.open();
                        w.document.write(buildPrintContent());
                        w.print();
                        w.close();
                    }

                    var printButton = document.getElementById("printRecoveryCodes");
                    printButton && printButton.addEventListener("click", printRecoveryCodes);
                `}])}static{this.ɵfac=function(c){return new(c||o)}}static{this.ɵcmp=h({type:o,selectors:[["kc-login-recovery-authn-code-config"]],viewQuery:function(c,t){c&1&&T(t.headerNode,K,5)(t.infoNode,M,5)(t.socialProvidersNode,Q,5),c&2&&E(3)},features:[R([{provide:g,useExisting:L(()=>o)}]),k],decls:36,vars:19,consts:[["headerNode",""],["aria-label","Warning alert",1,"pf-c-alert","pf-m-warning","pf-m-inline",3,"kcClass"],[1,"pf-c-alert__icon"],["aria-hidden","true",1,"pficon-warning-triangle-o"],[1,"pf-c-alert__title"],[1,"pf-screen-reader"],[1,"pf-c-alert__description"],[3,"id","kcClass"],[3,"kcClass"],["id","printRecoveryCodes","type","button",1,"pf-c-button","pf-m-link"],["aria-hidden","true",1,"pficon-print"],["id","downloadRecoveryCodes","type","button",1,"pf-c-button","pf-m-link"],["aria-hidden","true",1,"pficon-save"],["id","copyRecoveryCodes","type","button",1,"pf-c-button","pf-m-link"],["aria-hidden","true",1,"pficon-blueprint"],[1,"checkbox",3,"kcClass"],["for","kcRecoveryCodesConfirmationCheck"],["type","checkbox","id","kcRecoveryCodesConfirmationCheck","name","kcRecoveryCodesConfirmationCheck",3,"change","kcClass","checked"],["id","kc-recovery-codes-settings-form","method","post",3,"action","kcClass"],["type","hidden","name","generatedRecoveryAuthnCodes",3,"value"],["type","hidden","name","generatedAt",3,"value"],["type","hidden","id","userLabel","name","userLabel",3,"value"],["type","submit","id","saveRecoveryAuthnCodesBtn",3,"kcClass","value","disabled"],["type","submit","id","cancelRecoveryAuthnCodesBtn","name","cancel-aia","value","true",3,"kcClass"]],template:function(c,t){if(c&1&&(w(0,V,1,1,"ng-template",null,0,O),s(2,"div",1)(3,"div",2),l(4,"i",3),i(),s(5,"h4",4)(6,"span",5),a(7,"Warning alert:"),i(),a(8),i(),s(9,"div",6)(10,"p"),a(11),i()()(),s(12,"ol",7),S(13,Z,4,4,"li",null,b),i(),s(15,"div",8)(16,"button",9),l(17,"i",10),a(18),i(),s(19,"button",11),l(20,"i",12),a(21),i(),s(22,"button",13),l(23,"i",14),a(24),i()(),s(25,"div",15)(26,"label",16)(27,"input",17),A("change",function(y){return t.toggleRecoveryCodesConfirmation.set(y.target.checked)}),i(),a(28),i()(),s(29,"form",18),l(30,"input",19)(31,"input",20)(32,"input",21)(33,"kc-logout-other-sessions"),B(34,X,3,7)(35,Y,1,4,"input",22),i()),c&2){const C=t.kcContext.recoveryAuthnCodesConfigBean,y=t.kcContext.isAppInitiatedAction;e(2),r("kcClass","kcRecoveryCodesWarning"),e(6),d(" ",t.i18n.msgStr("recovery-code-config-warning-title")," "),e(3),x(t.i18n.msgStr("recovery-code-config-warning-message")),e(),r("id",t.olRecoveryCodesListId)("kcClass","kcRecoveryCodesList"),e(),I(C.generatedRecoveryAuthnCodesList),e(2),r("kcClass","kcRecoveryCodesActions"),e(3),d(" ",t.i18n.msgStr("recovery-codes-print")," "),e(3),d(" ",t.i18n.msgStr("recovery-codes-download")," "),e(3),d(" ",t.i18n.msgStr("recovery-codes-copy")," "),e(),r("kcClass","kcFormOptionsClass"),e(2),r("kcClass","kcCheckInputClass")("checked",t.toggleRecoveryCodesConfirmation()),e(),d(" ",t.i18n.msgStr("recovery-codes-confirmation-message")," "),e(),r("action",t.kcContext.url.loginAction,$)("kcClass","kcFormGroupClass"),e(),r("value",C.generatedRecoveryAuthnCodesAsString),e(),r("value",C.generatedAt),e(),r("value",t.i18n.msgStr("recovery-codes-label-default")),e(2),N(y?34:35)}},dependencies:[q,G],encapsulation:2})}}return o})();export{re as LoginRecoveryAuthnCodeConfigComponent};
