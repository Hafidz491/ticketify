'use client';

import Swal from 'sweetalert2';

// Detect current theme (dark vs light)
function isDarkMode(): boolean {
  if (typeof document === 'undefined') return true;
  return document.documentElement.getAttribute('data-theme') !== 'light';
}

function getThemeColors() {
  const dark = isDarkMode();
  return {
    background: dark ? '#13151b' : '#ffffff',
    color: dark ? '#ffffff' : '#0f172a',
    backdrop: 'rgba(0, 0, 0, 0.65)',
    confirmButtonColor: dark ? '#ffffff' : '#0f172a',
    confirmButtonTextColor: dark ? '#000000' : '#ffffff',
    cancelButtonColor: dark ? '#222530' : '#f1f5f9',
    cancelButtonTextColor: dark ? '#cbd5e1' : '#475569',
    dangerColor: '#ef4444',
  };
}

/**
 * Beautiful confirmation dialog (replaces window.confirm)
 */
export async function showConfirmDialog(options: {
  title: string;
  text: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}): Promise<boolean> {
  const colors = getThemeColors();

  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    icon: options.isDestructive ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonText: options.confirmText || 'Konfirmasi',
    cancelButtonText: options.cancelText || 'Batal',
    reverseButtons: true,
    background: colors.background,
    color: colors.color,
    backdrop: colors.backdrop,
    confirmButtonColor: options.isDestructive ? colors.dangerColor : colors.confirmButtonColor,
    cancelButtonColor: colors.cancelButtonColor,
    customClass: {
      popup: 'ticketify-swal-popup',
      title: 'ticketify-swal-title',
      htmlContainer: 'ticketify-swal-text',
      confirmButton: 'ticketify-swal-confirm',
      cancelButton: 'ticketify-swal-cancel',
    },
  });

  return result.isConfirmed;
}

/**
 * Beautiful success dialog
 */
export async function showSuccessAlert(options: {
  title: string;
  text: string;
  confirmText?: string;
  timer?: number;
}): Promise<void> {
  const colors = getThemeColors();

  await Swal.fire({
    title: options.title,
    text: options.text,
    icon: 'success',
    confirmButtonText: options.confirmText || 'Tutup',
    timer: options.timer,
    timerProgressBar: Boolean(options.timer),
    background: colors.background,
    color: colors.color,
    backdrop: colors.backdrop,
    confirmButtonColor: colors.confirmButtonColor,
    customClass: {
      popup: 'ticketify-swal-popup',
      title: 'ticketify-swal-title',
      htmlContainer: 'ticketify-swal-text',
      confirmButton: 'ticketify-swal-confirm',
    },
  });
}

/**
 * Beautiful error dialog
 */
export async function showErrorAlert(options: {
  title: string;
  text: string;
  confirmText?: string;
}): Promise<void> {
  const colors = getThemeColors();

  await Swal.fire({
    title: options.title,
    text: options.text,
    icon: 'error',
    confirmButtonText: options.confirmText || 'Mengerti',
    background: colors.background,
    color: colors.color,
    backdrop: colors.backdrop,
    confirmButtonColor: colors.confirmButtonColor,
    customClass: {
      popup: 'ticketify-swal-popup',
      title: 'ticketify-swal-title',
      htmlContainer: 'ticketify-swal-text',
      confirmButton: 'ticketify-swal-confirm',
    },
  });
}

/**
 * Beautiful toast alert (floating top-right notification)
 */
export function showToastAlert(title: string, icon: 'success' | 'info' | 'warning' | 'error' = 'success'): void {
  const colors = getThemeColors();

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    background: colors.background,
    color: colors.color,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
    customClass: {
      popup: 'ticketify-swal-toast',
      title: 'ticketify-swal-toast-title',
    },
  });

  Toast.fire({
    icon,
    title,
  });
}
