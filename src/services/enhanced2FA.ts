
import { use2FA } from '@/hooks/use2FA';
import { AuditLogger } from './security/auditLogger';
import { useToast } from '@/hooks/use-toast';

export interface TrustedDevice {
  id: string;
  name: string;
  fingerprint: string;
  added_at: string;
  last_used: string;
}

export class Enhanced2FA {
  private static readonly TRUSTED_DEVICES_KEY = 'trusted_devices';

  static getTrustedDevices(): TrustedDevice[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const devices = localStorage.getItem(this.TRUSTED_DEVICES_KEY);
      return devices ? JSON.parse(devices) : [];
    } catch {
      return [];
    }
  }

  static addTrustedDevice(device: Omit<TrustedDevice, 'id' | 'added_at'>): void {
    if (typeof window === 'undefined') return;
    
    const devices = this.getTrustedDevices();
    const newDevice: TrustedDevice = {
      ...device,
      id: crypto.randomUUID(),
      added_at: new Date().toISOString(),
    };
    
    devices.push(newDevice);
    localStorage.setItem(this.TRUSTED_DEVICES_KEY, JSON.stringify(devices));
  }

  static removeTrustedDevice(deviceId: string): void {
    if (typeof window === 'undefined') return;
    
    const devices = this.getTrustedDevices().filter(d => d.id !== deviceId);
    localStorage.setItem(this.TRUSTED_DEVICES_KEY, JSON.stringify(devices));
  }

  static isDeviceTrusted(fingerprint: string): boolean {
    const devices = this.getTrustedDevices();
    return devices.some(device => device.fingerprint === fingerprint);
  }

  static updateLastUsed(fingerprint: string): void {
    if (typeof window === 'undefined') return;
    
    const devices = this.getTrustedDevices();
    const device = devices.find(d => d.fingerprint === fingerprint);
    
    if (device) {
      device.last_used = new Date().toISOString();
      localStorage.setItem(this.TRUSTED_DEVICES_KEY, JSON.stringify(devices));
    }
  }

  // Enhanced 2FA verification with trusted device support
  static async verify2FAWithDeviceCheck(
    token: string, 
    isBackupCode: boolean = false,
    trustDevice: boolean = false
  ): Promise<{ success: boolean; requiresVerification: boolean }> {
    const deviceFingerprint = this.getDeviceFingerprint();
    
    // Check if device is already trusted
    if (this.isDeviceTrusted(deviceFingerprint)) {
      this.updateLastUsed(deviceFingerprint);
      return { success: true, requiresVerification: false };
    }

    // Proceed with 2FA verification
    const { verify2FA } = use2FA();
    
    try {
      const success = await verify2FA(token, isBackupCode);
      
      if (success) {
        await AuditLogger.logSecurityEvent('security_2fa_enabled', '', {
          device_fingerprint: deviceFingerprint,
          method: isBackupCode ? 'backup_code' : 'totp'
        });

        // Add device to trusted list if requested
        if (trustDevice) {
          this.addTrustedDevice({
            name: this.getDeviceName(),
            fingerprint: deviceFingerprint,
            last_used: new Date().toISOString()
          });
        }
      }
      
      return { success, requiresVerification: true };
    } catch (error) {
      await AuditLogger.logSecurityEvent('security_2fa_enabled', '', {
        device_fingerprint: deviceFingerprint,
        error: error.message
      }, false, error.message);
      
      throw error;
    }
  }

  private static getDeviceFingerprint(): string {
    if (typeof window === 'undefined') return 'server';
    
    // Create a unique device fingerprint
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 0,
      navigator.maxTouchPoints || 0
    ].join('|');
    
    // Simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36);
  }

  private static getDeviceName(): string {
    if (typeof window === 'undefined') return 'Server';
    
    const ua = navigator.userAgent;
    
    if (ua.includes('Mobile')) {
      if (ua.includes('iPhone')) return 'iPhone';
      if (ua.includes('Android')) return 'Android Phone';
      return 'Mobile Device';
    }
    
    if (ua.includes('iPad')) return 'iPad';
    if (ua.includes('Mac')) return 'Mac';
    if (ua.includes('Windows')) return 'Windows PC';
    if (ua.includes('Linux')) return 'Linux PC';
    
    return 'Unknown Device';
  }

  // Generate recovery codes
  static generateRecoveryCodes(count: number = 8): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const code = Array.from({ length: 8 }, () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      
      codes.push(code);
    }
    
    return codes;
  }
}
