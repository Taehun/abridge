// iOS Lockdown Mode Detection
// Detects restricted environments (like iOS Lockdown Mode) by testing WASM support
(function() {
  window.isLockdownMode = null;

  window.detectLockdownMode = async function() {
    try {
      // Minimal valid WASM module (magic number + version)
      var wasmBytes = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
      await WebAssembly.compile(wasmBytes);
      window.isLockdownMode = false;
    } catch (e) {
      // WASM compilation failed - likely Lockdown Mode or restricted environment
      window.isLockdownMode = true;
    }
    document.dispatchEvent(new CustomEvent('lockdown:detected', {
      detail: { isLockdownMode: window.isLockdownMode }
    }));
    return window.isLockdownMode;
  };

  // Run detection immediately
  detectLockdownMode();
})();
