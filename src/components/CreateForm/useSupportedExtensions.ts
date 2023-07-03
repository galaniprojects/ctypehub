import { useEffect, useState } from 'react';

export function useSupportedExtensions() {
  const [extensions, setExtensions] = useState<
    Array<{ key: string; name: string }>
  >([]);

  useEffect(() => {
    function update() {
      const current = [...Object.entries(window.kilt)]
        .filter(([, api]) => 'signExtrinsicWithDid' in api)
        .map(([key, { name }]) => ({ key, name }));
      setExtensions(current);
    }

    update();
    window.dispatchEvent(new CustomEvent('kilt-dapp#initialized'));

    window.addEventListener('kilt-extension#initialized', update);
    return () => {
      window.removeEventListener('kilt-extension#initialized', update);
    };
  }, []);

  return extensions;
}
