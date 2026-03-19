import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

const MAINTENANCE_FILE = path.join(process.cwd(), 'maintenance.json');

export interface MaintenanceState {
  enabled: boolean;
  updatedAt: string;
}

/**
 * Read the maintenance state from disk.
 */
function readState(): MaintenanceState {
  try {
    if (!fs.existsSync(MAINTENANCE_FILE)) {
      return { enabled: false, updatedAt: new Date().toISOString() };
    }

    const raw = fs.readFileSync(MAINTENANCE_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as MaintenanceState;

    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : false,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    logger.warn('⚠️ Unable to read maintenance state, defaulting to disabled.', error);
    return { enabled: false, updatedAt: new Date().toISOString() };
  }
}

/**
 * Write the given maintenance state to disk.
 */
function writeState(state: MaintenanceState): void {
  try {
    fs.writeFileSync(MAINTENANCE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    logger.error('❌ Failed to write maintenance state to disk:', error);
  }
}

export function isMaintenanceModeEnabled(): boolean {
  return readState().enabled;
}

export function setMaintenanceMode(enabled: boolean): void {
  const state: MaintenanceState = {
    enabled,
    updatedAt: new Date().toISOString(),
  };
  writeState(state);
}
