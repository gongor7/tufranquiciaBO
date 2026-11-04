import { Linking } from 'react-native';
import { SUPPORT_WHATSAPP } from '../constants/support';

/** Abre WhatsApp con un mensaje preconfigurado (RF-41). */
export function openWhatsApp(phone: string | null | undefined, message: string): void {
  const target = phone && phone.replace(/\D/g, '').length >= 8 ? phone : SUPPORT_WHATSAPP;
  const digits = target.replace(/\D/g, '');
  const withCountry = digits.startsWith('591') ? digits : `591${digits}`;
  void Linking.openURL(`https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`);
}
