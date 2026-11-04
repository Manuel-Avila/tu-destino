import Swal from 'sweetalert2';

/**
 * Ventana de confirmación para acciones del usuario (eliminar reseña, quitar de guardados, etc.).
 * - Pregunta "¿Estás seguro de continuar?".
 * - Si cancela, avisa "Acción cancelada".
 * Devuelve true solo si la persona confirmó.
 */
export async function confirmAction({
  title = '¿Estás seguro de continuar?',
  text = '',
  confirmText = 'Sí, continuar',
  cancelText = 'Cancelar',
  danger = true,
} = {}) {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: true,
    confirmButtonColor: danger ? '#c0392b' : '#0a4d3c',
    cancelButtonColor: '#6b7a76',
  });

  if (!result.isConfirmed) {
    Swal.fire({
      icon: 'info',
      title: 'Acción cancelada',
      text: 'No se realizó ningún cambio.',
      timer: 1800,
      timerProgressBar: true,
      showConfirmButton: false,
    });
    return false;
  }
  return true;
}

/** Aviso de que la acción se llevó a cabo con éxito (se cierra solo). */
export function notifySuccess(title, text = '') {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    timer: 1900,
    timerProgressBar: true,
    showConfirmButton: false,
  });
}

/** Aviso de que algo falló (el usuario lo cierra con el botón). */
export function notifyError(title, text = '') {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#0a4d3c',
  });
}
