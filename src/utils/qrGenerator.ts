import QRCode from 'qrcode';
import { AnyLicence, FederationSettings } from '../types';

export async function generateBadgeQRCodeUrl(
  licence: AnyLicence,
  settings: FederationSettings
): Promise<string> {
  let targetUrl = settings.siteWebUrl;

  if (licence.qrCustomUrl && licence.qrCustomUrl.trim() !== '') {
    targetUrl = licence.qrCustomUrl.trim();
  } else {
    switch (licence.category) {
      case 'CADRE':
        if (settings.qrDestinationType === 'organigramme') {
          targetUrl = `${settings.organigrammeUrl}?cadre=${encodeURIComponent(licence.id)}&role=${encodeURIComponent(licence.poste)}`;
        } else if (settings.qrDestinationType === 'site_web') {
          targetUrl = settings.siteWebUrl;
        } else if (settings.qrDestinationType === 'vcard') {
          targetUrl = `BEGIN:VCARD\nVERSION:3.0\nN:${licence.nom};${licence.prenom};;;\nFN:${licence.prenom} ${licence.nom}\nORG:${settings.nomFederation}\nTITLE:${licence.poste}${licence.sousTitre ? ' ' + licence.sousTitre : ''}\nTEL:${licence.telephone || ''}\nEMAIL:${licence.email || ''}\nURL:${settings.siteWebUrl}\nEND:VCARD`;
        } else {
          targetUrl = settings.organigrammeUrl;
        }
        break;

      case 'COMPETITION':
        targetUrl = `${settings.verificationLicenceUrl || settings.siteWebUrl}/athlete?licence=${encodeURIComponent(licence.numeroLicence)}&nom=${encodeURIComponent(licence.nom)}&club=${encodeURIComponent(licence.club)}`;
        break;

      case 'LOISIR':
        targetUrl = `${settings.verificationLicenceUrl || settings.siteWebUrl}/assurance?licence=${encodeURIComponent(licence.numeroLicence)}&police=${encodeURIComponent(licence.numeroAssurance)}`;
        break;

      case 'LIGUE_PRO':
        targetUrl = `${settings.verificationLicenceUrl || settings.siteWebUrl}/pro?licence=${encodeURIComponent(licence.numeroLicence)}&athlete=${encodeURIComponent(licence.prenom + ' ' + licence.nom)}`;
        break;

      default:
        targetUrl = settings.siteWebUrl;
    }
  }

  try {
    const dataUrl = await QRCode.toDataURL(targetUrl, {
      width: 256,
      margin: 1,
      color: {
        dark: '#002952',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}
