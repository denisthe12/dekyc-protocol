declare global {
  interface Window {
    NCALayer?: {
      connect: () => Promise<void>;
      disconnect?: () => Promise<void>;
      basicsSignCMS?: (
        storageType: string,
        data: string,
        attached: boolean,
      ) => Promise<string>;
    };
    webSocket?: unknown;
  }
}

export async function ensureNcaLayerConnected() {
  if (typeof window === 'undefined') {
    throw new Error('NCALayer is only available in browser');
  }

  if (!window.NCALayer || typeof window.NCALayer.connect !== 'function') {
    throw new Error('NCALayer is not available. Please start NCALayer first.');
  }

  await window.NCALayer.connect();
}

export async function signChallengeWithNcaLayer(input: {
  challengeBase64: string;
}) {
  if (!window.NCALayer || typeof window.NCALayer.basicsSignCMS !== 'function') {
    throw new Error('NCALayer signing API is not available');
  }

  const cmsSignature = await window.NCALayer.basicsSignCMS(
    'PKCS12',
    input.challengeBase64,
    true,
  );

  if (!cmsSignature) {
    throw new Error('Empty CMS signature returned by NCALayer');
  }

  return cmsSignature;
}