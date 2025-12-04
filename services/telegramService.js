
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../constants.js';

export const sendReservationToTelegram = async (data) => {
  const message = `
🐟 *NUOVA PRENOTAZIONE* 🐟

🍲 *PRODOTTO:* ${data.product}

👤 *Cliente:* ${data.firstName} ${data.lastName}
📞 *Tel:* ${data.phone ? data.phone : 'Non fornito'}
⚖️ *Quantità:* ${data.grams}g
📅 *Data Ritiro:* ${data.pickupDate}
⏰ *Fascia Oraria:* ${data.pickupTimeSlot || 'Non specificato'}

📝 *Note:*
${data.notes || 'Nessuna nota aggiuntiva'}
  `;

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      throw new Error('Errore nella comunicazione con Telegram');
    }

    return true;
  } catch (error) {
    console.error('Failed to send telegram message:', error);
    return false;
  }
};
