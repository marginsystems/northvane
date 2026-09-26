// Synchronous shell for the menu, the contact modal, and the one Lenis instance.
// Later UI reads and writes these fields directly. They are not React state.
export const bridge = {
  lenis: null,
  menuOpen: false,
  modalOpen: false,
  live: false,
  openModal() {},
  closeMenu() {},
  closeModal() {},
};
