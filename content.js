(function() {

  function loadSettings() {
    try {
      let settings = localStorage.getItem("igtm_settings");
      return settings ? JSON.parse(settings) : {};
    } catch (e) {
      return {}; 
    }
  }
  
  function injectGtmCode(gtmId) {
    var code = "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});" +
               "var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';" +
               "j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;" +
               "f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','" + gtmId + "');";
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.textContent = code;
    document.head.appendChild(script);
  }
  
  function pushToDataLayer(vars) {
    var code = "window.dataLayer = window.dataLayer || []; window.dataLayer.push(" + JSON.stringify(vars) + ");";
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.textContent = code;
    document.head.appendChild(script);
  }
  
  function addExtraScript(scode) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.textContent = scode;
    document.head.appendChild(script);
  }
  
  // Ausführung der Funktionen je nach Einstellungen  
  (function() {
    var settings = loadSettings();
    // Wenn mindestens eine der Optionen aktiviert ist, wird der entsprechende Code injiziert:
    if (settings.igtm_Status || settings.igtmAddInit || settings.igtmAddCode) {
      if (settings.igtmAddCode && settings.igtmCode) {
        addExtraScript(settings.igtmCode);
      }
      if (settings.igtmAddInit && settings.igtmInit) {
        try {
          var initObj = JSON.parse(settings.igtmInit);
          pushToDataLayer(initObj);
        } catch(e) {
          console.error("Error parsing object for dataLayer. Please provide a valid JSON string: ", e);
        }
      }
      if (settings.igtmGtmId && settings.igtm_Status) {
        injectGtmCode(settings.igtmGtmId);
      }
    }
  })();
})();
