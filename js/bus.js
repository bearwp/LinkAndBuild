/* ============================================================
   LINK & BUILD — Event Bus
   Tiny pub/sub. Systems emit events; presentation subscribes.
   This decouples systems so adding a new one means only writing
   that one, not editing every other system.
   ============================================================ */

const Bus = {
  _handlers: {},

  on(event, fn) {
    (this._handlers[event] = this._handlers[event] || []).push(fn);
    return () => this.off(event, fn);
  },

  off(event, fn) {
    const list = this._handlers[event];
    if (!list) return;
    const i = list.indexOf(fn);
    if (i >= 0) list.splice(i, 1);
  },

  emit(event, payload) {
    const list = this._handlers[event];
    if (!list) return;
    // copy so handlers can subscribe/unsubscribe mid-emit safely
    for (const fn of list.slice()) {
      try { fn(payload); } catch (e) { console.error('[Bus]', event, e); }
    }
  },
};
