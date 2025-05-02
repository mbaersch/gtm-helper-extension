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
    return;
  }

  function injectPastedGtmCode(gtmCode) {
    var code = gtmCode.replace("<script>", "").replace("</script>", "");
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.textContent = code;
    document.head.appendChild(script);
  }

  function hideContainerQuality() {
    var stl = document.createElement("span");
    stl.innerHTML = '<style>div[data-ng-if="::ctrl.isTagHealthEnabled"]{display:none}</style>';
    document.body.appendChild(stl);
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
    if (settings.hideQuality) 
      hideContainerQuality();

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
      //if (settings.igtmGtmId && settings.igtm_Status) {
      //  injectGtmCode(settings.igtmGtmId);
      //}
      if (settings.igtmGtmCode && settings.igtm_Status) {
        injectPastedGtmCode(settings.igtmGtmCode);
      }
    }
     
  })();
})();
