/* The first script on the probe page, ahead of every one the page's policy
   governs: it hears each thing the policy refuses from the start of the load,
   and editor-probe.js reads the list at the end of its run. */
window.PROBE_REFUSED = [];
document.addEventListener('securitypolicyviolation', function (e) {
  window.PROBE_REFUSED.push(e.violatedDirective || e.effectiveDirective);
});
