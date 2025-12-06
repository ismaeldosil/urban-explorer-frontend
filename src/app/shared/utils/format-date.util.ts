export function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'Ahora';
  }

  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
  }

  if (diffHours < 24) {
    return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  }

  if (diffDays < 7) {
    return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  }

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  }

  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  }

  const years = Math.floor(diffDays / 365);
  return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
}

export function formatDateFull(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
