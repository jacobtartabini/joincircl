import versionData from '../../VERSION.json';

export interface VersionInfo {
  version: string;
  lastUpdated: string;
  commitHash: string;
  buildNumber: number;
}

export const getVersionInfo = (): VersionInfo => {
  return versionData;
};

export const getVersionString = (): string => {
  return versionData.version;
};

export const getBuildInfo = (): string => {
  return `v${versionData.version} (Build ${versionData.buildNumber})`;
};

export const getFormattedLastUpdated = (): string => {
  return new Date(versionData.lastUpdated).toLocaleDateString();
};